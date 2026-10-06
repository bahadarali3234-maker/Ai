/**
 * Automated Acceptance Test Suite for Clarification Gate
 * Validates all 13 test scenarios specified in User Brief Section 8.
 */

import {
  parseAndValidateGateResponse,
  isSkipIntent,
  buildEnrichedTaskPrompt,
  ClarificationDecision,
} from '../src/utils/clarificationGate';

const BASE_URL = 'http://localhost:3000';

async function callGate(payload: any): Promise<ClarificationDecision> {
  const res = await fetch(`${BASE_URL}/api/clarification-gate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Gate returned status ${res.status}`);
  }
  return res.json();
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 RUNNING CLARIFICATION GATE ACCEPTANCE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  // 1. "hi" -> PROCEED, no questions
  try {
    const res = await callGate({ prompt: 'hi' });
    assert('1. "hi" -> PROCEED without questions', res.decision === 'PROCEED' && res.questions.length === 0, JSON.stringify(res));
  } catch (e: any) {
    assert('1. "hi" -> PROCEED', false, e.message);
  }

  // 2. "What is the capital of France?" -> PROCEED
  try {
    const res = await callGate({ prompt: 'What is the capital of France?' });
    assert('2. "What is the capital of France?" -> PROCEED', res.decision === 'PROCEED' && res.questions.length === 0, JSON.stringify(res));
  } catch (e: any) {
    assert('2. "What is the capital of France?" -> PROCEED', false, e.message);
  }

  // 3. "Make me a website" -> ASK with website-specific questions
  try {
    const res = await callGate({ prompt: 'Make me a website' });
    const isAsk = res.decision === 'ASK';
    const isWebsiteType = res.task_type === 'website';
    const hasQuestions = res.questions.length >= 1;
    assert('3. "Make me a website" -> ASK with website questions', isAsk && isWebsiteType && hasQuestions, `Decision: ${res.decision}, Type: ${res.task_type}, Qs: ${res.questions.length}`);
  } catch (e: any) {
    assert('3. "Make me a website" -> ASK', false, e.message);
  }

  // 4. "Mujhe ik mobile app banani ha" -> ASK, in Roman Urdu
  try {
    const res = await callGate({ prompt: 'Mujhe ik mobile app banani ha' });
    const isAsk = res.decision === 'ASK';
    const isApp = res.task_type === 'app';
    const firstQ = res.questions[0]?.question || '';
    const hasUrduWords = /kya|hai|chahiye|app|kaun|ka|ki|ke/i.test(firstQ);
    assert('4. "Mujhe ik mobile app banani ha" -> ASK in Roman Urdu', isAsk && isApp && hasUrduWords, `Q1: "${firstQ}"`);
  } catch (e: any) {
    assert('4. "Mujhe ik mobile app banani ha"', false, e.message);
  }

  // 5. "Write a business plan" -> ASK (business-specific questions)
  try {
    const res = await callGate({ prompt: 'Write a business plan' });
    const isAsk = res.decision === 'ASK';
    const isBusiness = res.task_type === 'business';
    const qText = res.questions.map(q => q.question).join(' ');
    const isNotWebsite = !qText.toLowerCase().includes('website template');
    assert('5. "Write a business plan" -> ASK business questions', isAsk && isBusiness && isNotWebsite, `Type: ${res.task_type}, Q count: ${res.questions.length}`);
  } catch (e: any) {
    assert('5. "Write a business plan"', false, e.message);
  }

  // 6. "Make a logo for my coffee shop called Bean Hub, minimal, brown and cream" -> PROCEED or at most 1 question
  try {
    const res = await callGate({ prompt: 'Make a logo for my coffee shop called Bean Hub, minimal, brown and cream' });
    const isProceedOrMinimal = res.decision === 'PROCEED' || (res.decision === 'ASK' && res.questions.length <= 1);
    assert('6. Detailed logo prompt -> PROCEED or max 1 question', isProceedOrMinimal, `Decision: ${res.decision}, Qs: ${res.questions.length}`);
  } catch (e: any) {
    assert('6. Detailed logo prompt', false, e.message);
  }

  // 7. "asdfgh" -> REDIRECT
  try {
    const res = await callGate({ prompt: 'asdfgh' });
    const isRedirect = res.decision === 'REDIRECT';
    const hasMsg = Boolean(res.redirect_message && res.redirect_message.length > 10);
    assert('7. "asdfgh" -> REDIRECT with polite message', isRedirect && hasMsg, `Decision: ${res.decision}, Msg: "${res.redirect_message}"`);
  } catch (e: any) {
    assert('7. "asdfgh"', false, e.message);
  }

  // 8. User answers all questions -> prompt enrichment builds complete prompt
  try {
    const mockDecision: ClarificationDecision = {
      validity: 'valid',
      task_type: 'website',
      completeness: 'incomplete',
      decision: 'ASK',
      detected_info: {},
      missing_critical: ['purpose'],
      assumptions_if_skipped: [],
      questions: [
        { id: 'q1', question: 'What is the purpose?', why_it_matters: '', type: 'single_choice' },
        { id: 'q2', question: 'What is the brand name?', why_it_matters: '', type: 'single_choice' },
      ],
    };
    const enriched = buildEnrichedTaskPrompt('Make me a website', mockDecision, {
      q1: 'Luxury Portfolio',
      q2: 'Velocity Apex',
    });
    const hasAnswers = enriched.includes('Luxury Portfolio') && enriched.includes('Velocity Apex');
    assert('8. Enriched task prompt incorporates user answers', hasAnswers, enriched);
  } catch (e: any) {
    assert('8. Enriched prompt', false, e.message);
  }

  // 9. Skip intent detection in English & Roman Urdu
  try {
    const skips = ['skip', 'just do it', 'you decide', 'tum decide karo', 'apni marzi se', 'whatever you think'];
    const allDetected = skips.every((s) => isSkipIntent(s));
    assert('9. Skip intent detection (English & Roman Urdu)', allDetected, `Tested: ${skips.join(', ')}`);
  } catch (e: any) {
    assert('9. Skip intent detection', false, e.message);
  }

  // 10. The same question is never asked twice (tracking asked_questions)
  try {
    const askedList = ['What is the main purpose of the website?'];
    const res = await callGate({
      prompt: 'Make me a website',
      askedQuestions: askedList,
    });
    const duplicates = (res.questions || []).filter((q) => askedList.includes(q.question));
    assert('10. Never repeats previously asked questions', duplicates.length === 0, `Duplicates found: ${duplicates.length}`);
  } catch (e: any) {
    assert('10. Never repeat questions', false, e.message);
  }

  // 11. Info already given in detected_info is not asked again
  try {
    const detectedInfo = { primary_purpose: 'Coffee shop portfolio' };
    const res = await callGate({
      prompt: 'Build the coffee shop portfolio website',
      detectedInfo,
    });
    const reAskedPurpose = (res.questions || []).some(
      (q) => q.question.toLowerCase().includes('what is the purpose') || q.question.toLowerCase().includes('what kind of website')
    );
    assert('11. Detected info is preserved and not re-asked', !reAskedPurpose, JSON.stringify(res.questions));
  } catch (e: any) {
    assert('11. Preserve detected info', false, e.message);
  }

  // 12. Gate failure / bad JSON fallback safely to PROCEED
  try {
    const fallback1 = parseAndValidateGateResponse('INVALID RAW JSON {{{');
    const fallback2 = parseAndValidateGateResponse('```json\n{"invalid: json\n```');
    const safe = fallback1.decision === 'PROCEED' && fallback2.decision === 'PROCEED';
    assert('12. Robust fallback on JSON parsing failure to PROCEED', safe);
  } catch (e: any) {
    assert('12. Robust fallback', false, e.message);
  }

  // 13. Skip intent via gate endpoint returns PROCEED with defaults
  try {
    const res = await callGate({ prompt: 'tum decide karo' });
    assert('13. User says "tum decide karo" -> PROCEED with assumptions', res.decision === 'PROCEED', JSON.stringify(res));
  } catch (e: any) {
    assert('13. Skip endpoint', false, e.message);
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
  if (failed > 0) {
    process.exit(1);
  }
}

// Wait for dev server if starting up
setTimeout(() => {
  runTestSuite().catch((e) => {
    console.error('Test execution failed:', e);
    process.exit(1);
  });
}, 1000);
