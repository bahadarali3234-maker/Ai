import { GoogleGenAI } from '@google/genai';

export interface PlannerSubject {
  id?: string;
  label: string;
  intent?: string;
  queries: string[];
  must_include?: string[];
  must_exclude?: string[];
  count: number;
  orientation?: string;
  caption?: string;
}

export interface NormalizedImage {
  id: string;
  url: string;
  thumbnail: string;
  alt: string;
  title: string;
  sourceUrl: string;
  sourceDomain: string;
  width?: number;
  height?: number;
  score?: number;
}

export interface SubjectSearchResult {
  subject: PlannerSubject;
  images: NormalizedImage[];
  backupPool: NormalizedImage[];
  googleSearchUrl: string;
  totalFound: number;
}

/**
 * 1. Google Images Crawler (PRIMARY)
 * Attempts to retrieve image results from Google Images directly without API keys.
 * Detects consent/captcha/block and gracefully returns empty list.
 */
export async function crawlGoogleImages(query: string): Promise<NormalizedImage[]> {
  const images: NormalizedImage[] = [];
  try {
    const url = `https://www.google.com/search?tbm=isch&udm=2&hl=en&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie':
          'SOCS=CAISHAgBEhJnd3NfMjAyNDA2MTAtMF9SQzIaAmVuIAEaBgiA_LyaBg; CONSENT=PENDING+999; NID=511=dummy',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return [];

    const html = await res.text();
    // Detect captcha or block page
    if (html.includes('id="captcha"') || html.includes('enablejs?sei=') || html.includes('recaptcha')) {
      return [];
    }

    // Try extracting JSON patterns or image URLs
    const matches = [...html.matchAll(/\["(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp))",\s*(\d+),\s*(\d+)\]/gi)];
    for (const m of matches) {
      const imgUrl = m[1];
      const w = parseInt(m[2], 10);
      const h = parseInt(m[3], 10);
      if (imgUrl && !imgUrl.includes('gstatic.com') && !images.some((i) => i.url === imgUrl)) {
        let sourceDomain = 'google.com';
        try {
          sourceDomain = new URL(imgUrl).hostname.replace(/^www\./, '');
        } catch {}

        images.push({
          id: `g-${Date.now()}-${images.length}-${Math.random().toString(36).slice(2, 6)}`,
          url: imgUrl,
          thumbnail: imgUrl,
          alt: query,
          title: `${query} • Google Reference`,
          sourceUrl: `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`,
          sourceDomain,
          width: w || 1200,
          height: h || 800,
        });

        if (images.length >= 12) break;
      }
    }
  } catch (err) {
    // Fail silently to fall through to next crawler
  }
  return images;
}

/**
 * 2. Bing Images Crawler
 * Extracts high-res images and thumbnails from Bing's HTML iusc elements.
 */
export async function crawlBingImages(query: string): Promise<NormalizedImage[]> {
  const images: NormalizedImage[] = [];
  try {
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return [];

    const html = await res.text();
    const matches = [...html.matchAll(/class="iusc"[^>]*m="([^"]+)"/g)];

    for (const match of matches) {
      try {
        const rawJson = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        const obj = JSON.parse(rawJson);
        const murl = obj.murl;
        const turl = obj.turl || murl;
        const title = obj.t || query;

        if (murl && typeof murl === 'string' && !images.some((i) => i.url === murl)) {
          let sourceDomain = 'bing.com';
          try {
            sourceDomain = new URL(murl).hostname.replace(/^www\./, '');
          } catch {}

          images.push({
            id: `bing-${Date.now()}-${images.length}-${Math.random().toString(36).slice(2, 6)}`,
            url: murl,
            thumbnail: turl,
            alt: title,
            title: title,
            sourceUrl: obj.purl || murl,
            sourceDomain,
            width: 1200,
            height: 800,
          });

          if (images.length >= 25) break;
        }
      } catch {}
    }
  } catch (err) {
    // Fail silently
  }
  return images;
}

/**
 * 3. DuckDuckGo Images Crawler
 * Extracts image results using DuckDuckGo vqd token and i.js API.
 */
export async function crawlDuckDuckGoImages(query: string): Promise<NormalizedImage[]> {
  const images: NormalizedImage[] = [];
  try {
    const tokenRes = await fetch(
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}&t=h_&iar=images&iax=images&ia=images`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!tokenRes.ok) return [];

    const html = await tokenRes.text();
    const vqdMatch = html.match(/vqd=([\d-]+)/) || html.match(/vqd="([^"]+)"/);
    const vqd = vqdMatch ? vqdMatch[1] : null;

    if (vqd) {
      const imgRes = await fetch(
        `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,&s=0`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Referer: 'https://duckduckgo.com/',
          },
          signal: AbortSignal.timeout(5500),
        }
      );

      if (imgRes.ok) {
        const data: any = await imgRes.json();
        const results = Array.isArray(data?.results) ? data.results : [];
        for (const item of results) {
          if (item?.image && !images.some((i) => i.url === item.image)) {
            let sourceDomain = 'duckduckgo.com';
            try {
              sourceDomain = new URL(item.url || item.image).hostname.replace(/^www\./, '');
            } catch {
              sourceDomain = item.source || 'web';
            }

            images.push({
              id: `ddg-${Date.now()}-${images.length}-${Math.random().toString(36).slice(2, 6)}`,
              url: item.image,
              thumbnail: item.thumbnail || item.image,
              alt: item.title || query,
              title: item.title || query,
              sourceUrl: item.url || item.image,
              sourceDomain,
              width: item.width || 1200,
              height: item.height || 800,
            });

            if (images.length >= 25) break;
          }
        }
      }
    }
  } catch (err) {
    // Fail silently
  }
  return images;
}

/**
 * 4. Wikimedia Commons & Wikipedia pageimages Crawler
 */
export async function crawlWikimediaImages(query: string): Promise<NormalizedImage[]> {
  const images: NormalizedImage[] = [];

  // Part A: Wikimedia Commons File search
  try {
    const commonsUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      query
    )}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|size|mime&format=json&origin=*`;
    const cRes = await fetch(commonsUrl, { signal: AbortSignal.timeout(4500) });
    if (cRes.ok) {
      const cData: any = await cRes.json();
      const pages = cData?.query?.pages || {};
      for (const pageId of Object.keys(pages)) {
        const p = pages[pageId];
        const info = p.imageinfo?.[0];
        const imgUrl = info?.url;
        const mime = info?.mime || '';
        if (imgUrl && !mime.includes('svg') && !images.some((i) => i.url === imgUrl)) {
          const cleanTitle = (p.title || query).replace(/^File:/i, '').replace(/\.[a-z0-9]+$/i, '').trim();
          images.push({
            id: `wiki-c-${pageId}`,
            url: imgUrl,
            thumbnail: imgUrl,
            alt: cleanTitle,
            title: cleanTitle,
            sourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
            sourceDomain: 'wikimedia.org',
            width: info?.width || 1200,
            height: info?.height || 800,
          });
        }
      }
    }
  } catch {}

  // Part B: Wikipedia article lead image
  try {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      query
    )}&gsrlimit=6&prop=pageimages|extracts&piprop=original|thumbnail&pithumbsize=1200&format=json&origin=*`;
    const wRes = await fetch(wikiUrl, { signal: AbortSignal.timeout(4000) });
    if (wRes.ok) {
      const wData: any = await wRes.json();
      const pages = wData?.query?.pages || {};
      for (const pageId of Object.keys(pages)) {
        const p = pages[pageId];
        const imgUrl = p?.original?.source || p?.thumbnail?.source;
        if (imgUrl && !imgUrl.endsWith('.svg') && !images.some((i) => i.url === imgUrl)) {
          images.push({
            id: `wiki-p-${pageId}`,
            url: imgUrl,
            thumbnail: p?.thumbnail?.source || imgUrl,
            alt: p.title || query,
            title: `${p.title || query} • Wikipedia Reference`,
            sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title || query)}`,
            sourceDomain: 'wikipedia.org',
            width: 1200,
            height: 800,
          });
        }
      }
    }
  } catch {}

  return images;
}

/**
 * Filter and score image candidates
 */
export function filterAndScoreImages(candidates: NormalizedImage[], subject: PlannerSubject): {
  topImages: NormalizedImage[];
  backupPool: NormalizedImage[];
} {
  const seenUrls = new Set<string>();
  const filtered: NormalizedImage[] = [];

  const mustExclude = (subject.must_exclude || []).map((t) => t.toLowerCase().trim()).filter(Boolean);
  const mustInclude = (subject.must_include || []).map((t) => t.toLowerCase().trim()).filter(Boolean);
  const queryTokens = (subject.queries.join(' ') + ' ' + subject.label)
    .toLowerCase()
    .split(/[\s,.-]+/)
    .filter((t) => t.length >= 3);

  // 1. Hard filters
  for (const item of candidates) {
    if (!item.url || typeof item.url !== 'string') continue;

    // Deduplicate by clean URL without search params
    const cleanUrl = item.url.split('?')[0].toLowerCase();
    if (seenUrls.has(cleanUrl) || seenUrls.has(item.url)) continue;
    seenUrls.add(cleanUrl);
    seenUrls.add(item.url);

    const lowerUrl = item.url.toLowerCase();
    const lowerTitle = (item.title + ' ' + item.alt).toLowerCase();

    // Drop svg, gif, icons, tracking pixels
    if (
      lowerUrl.endsWith('.svg') ||
      lowerUrl.endsWith('.gif') ||
      lowerUrl.includes('1x1') ||
      lowerUrl.includes('pixel') ||
      lowerUrl.includes('spacer') ||
      lowerUrl.includes('beacon') ||
      lowerUrl.includes('favicon') ||
      lowerUrl.includes('logo_') ||
      lowerUrl.includes('/icons/')
    ) {
      continue;
    }

    // Must exclude filter
    const hasExcluded = mustExclude.some((ex) => lowerTitle.includes(ex) || lowerUrl.includes(ex));
    if (hasExcluded) continue;

    // Minimum dimensions
    if (item.width && item.width < 250 && item.height && item.height < 250) {
      continue;
    }

    filtered.push(item);
  }

  // 2. Score 0-100
  const domainCounts = new Map<string, number>();

  for (const item of filtered) {
    let score = 50; // base score
    const textCorpus = `${item.title} ${item.alt} ${item.sourceDomain}`.toLowerCase();

    // Must include match (+40 points)
    if (mustInclude.length > 0) {
      const matchCount = mustInclude.filter((inc) => textCorpus.includes(inc)).length;
      score += (matchCount / mustInclude.length) * 40;
    }

    // Query tokens match (+20 points)
    const tokenMatches = queryTokens.filter((token) => textCorpus.includes(token)).length;
    score += Math.min(25, tokenMatches * 5);

    // High resolution bonus (+15 points)
    if ((item.width || 0) >= 1000 || (item.height || 0) >= 600) {
      score += 15;
    }

    // Trusted source bonus (+15 points)
    const trustedDomains = ['wikimedia.org', 'wikipedia.org', 'unsplash.com', 'pexels.com', 'caranddriver.com', 'motortrend.com', 'autocar.co.uk'];
    if (trustedDomains.some((d) => item.sourceDomain.includes(d))) {
      score += 15;
    }

    // Domain diversity penalty: max 2 per domain without penalty
    const curDomainCount = domainCounts.get(item.sourceDomain) || 0;
    domainCounts.set(item.sourceDomain, curDomainCount + 1);
    if (curDomainCount >= 2) {
      score -= 25; // penalize 3rd+ repeated images from the same domain
    }

    item.score = Math.min(100, Math.max(0, Math.round(score)));
  }

  // Sort descending by score
  filtered.sort((a, b) => (b.score || 0) - (a.score || 0));

  const targetCount = subject.count || 4;
  const topImages = filtered.slice(0, targetCount);
  const backupPool = filtered.slice(targetCount);

  return { topImages, backupPool };
}

/**
 * Batched Gemini Vision / Relevance Verification
 * For USER_REQUESTED or borderline candidates (score < 65), checks if image titles/alt match the target entity.
 */
export async function verifyCandidatesWithGemini(
  candidates: NormalizedImage[],
  subject: PlannerSubject,
  getGeminiClient: () => GoogleGenAI | null
): Promise<NormalizedImage[]> {
  if (candidates.length <= 2) return candidates;

  const client = getGeminiClient();
  if (!client) return candidates;

  try {
    const listDescription = candidates
      .slice(0, 8)
      .map((c, idx) => `[${idx}] Title: "${c.title}" | Alt: "${c.alt}" | Domain: ${c.sourceDomain}`)
      .join('\n');

    const prompt = `You are an image verification system.
Target Subject: "${subject.label}" (Intent: ${subject.intent || 'visual reference'})

Candidate images:
${listDescription}

Which of these candidate indexes are genuinely relevant and accurate visual photos of "${subject.label}"?
Return a JSON array of valid 0-based integer indexes ordered by relevance. E.g. [0, 1, 2, 4].
Do not output markdown code blocks. Just the JSON array.`;

    const res = await Promise.race([
      client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          temperature: 0.1,
          maxOutputTokens: 200,
        },
      }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Vision check timeout')), 2500)),
    ]);

    if (res && res.text) {
      let raw = res.text.trim();
      if (raw.startsWith('```')) {
        raw = raw.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '').trim();
      }
      const indexes = JSON.parse(raw);
      if (Array.isArray(indexes) && indexes.length > 0) {
        const approved: NormalizedImage[] = [];
        for (const idx of indexes) {
          if (typeof idx === 'number' && candidates[idx]) {
            approved.push(candidates[idx]);
          }
        }
        if (approved.length >= 2) {
          // Append remaining candidates as backup
          const unapproved = candidates.filter((c) => !approved.includes(c));
          return [...approved, ...unapproved];
        }
      }
    }
  } catch (err) {
    // On timeout or error, safely retain original scored ranking
  }

  return candidates;
}

/**
 * Execute full search pipeline for a single planner subject
 */
export async function executeSubjectSearch(
  subject: PlannerSubject,
  mode: string,
  getGeminiClient: () => GoogleGenAI | null
): Promise<SubjectSearchResult> {
  const queriesToRun = subject.queries && subject.queries.length > 0 ? subject.queries : [subject.label];
  const primaryQuery = queriesToRun[0];

  // Run all crawlers in parallel with safe timeouts
  const crawlerPromises: Promise<NormalizedImage[]>[] = [
    crawlGoogleImages(primaryQuery),
    crawlBingImages(primaryQuery),
    crawlDuckDuckGoImages(primaryQuery),
    crawlWikimediaImages(primaryQuery),
  ];

  // If there is a second alternate query, run it in Bing/DDG as well
  if (queriesToRun[1]) {
    crawlerPromises.push(crawlBingImages(queriesToRun[1]));
    crawlerPromises.push(crawlDuckDuckGoImages(queriesToRun[1]));
  }

  const settled = await Promise.allSettled(crawlerPromises);
  const allCandidates: NormalizedImage[] = [];

  for (const s of settled) {
    if (s.status === 'fulfilled' && Array.isArray(s.value)) {
      allCandidates.push(...s.value);
    }
  }

  // Filter and score
  let { topImages, backupPool } = filterAndScoreImages(allCandidates, subject);

  // Vision / Relevance check if USER_REQUESTED or borderline score
  const isBorderline = topImages.some((img) => (img.score || 0) < 65);
  if (mode === 'USER_REQUESTED' || isBorderline) {
    const combined = [...topImages, ...backupPool];
    const verified = await verifyCandidatesWithGemini(combined, subject, getGeminiClient);
    topImages = verified.slice(0, subject.count || 4);
    backupPool = verified.slice(subject.count || 4);
  }

  // Fallback: if all crawlers yielded 0 images, run category search on wikimedia
  if (topImages.length === 0) {
    const fallbackImages = await crawlWikimediaImages(subject.label);
    const scored = filterAndScoreImages(fallbackImages, subject);
    topImages = scored.topImages;
    backupPool = scored.backupPool;
  }

  const googleSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(primaryQuery)}`;

  return {
    subject,
    images: topImages,
    backupPool,
    googleSearchUrl,
    totalFound: topImages.length + backupPool.length,
  };
}
