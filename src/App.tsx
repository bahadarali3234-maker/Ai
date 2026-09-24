/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ServicesSection } from './components/ServicesSection';
import { AboutSection } from './components/AboutSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { FloatingActionWidget } from './components/FloatingActionWidget';
import { ProjectModal } from './components/ProjectModal';
import { IosChatModal } from './components/IosChatModal';
import { BookingModal } from './components/BookingModal';
import { InteractiveRevealModal } from './components/InteractiveRevealModal';
import { LoginModal } from './components/LoginModal';
import { PremiumLoader } from './components/PremiumLoader';
import { PROJECTS } from './data/portfolioData';
import { Project } from './types';

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [revealModalOpen, setRevealModalOpen] = useState<boolean>(false);
  const [chatModalOpen, setChatModalOpen] = useState<boolean>(false);
  const [chatTopic, setChatTopic] = useState<string>('');
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  // When user clicks "Chat", open the Interactive Reveal Canvas with Prompt Box
  const handleOpenChat = (topic: string = '') => {
    setChatTopic(topic);
    setRevealModalOpen(true);
  };

  const handleOpenDirectChat = (topic: string = '') => {
    setChatTopic(topic);
    setRevealModalOpen(true);
  };

  const handleOpenBooking = () => {
    setChatModalOpen(false);
    setRevealModalOpen(false);
    setBookingModalOpen(true);
  };

  const handleNavigate = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col selection:bg-[#f41151] selection:text-white relative">
      {/* Full Experience Preloader with Asset Preloading */}
      <PremiumLoader />

      {/* Top Navbar with Chat CTA and Optional Login */}
      <Navbar
        onOpenChat={() => handleOpenChat()}
        onNavigate={handleNavigate}
        onOpenLogin={() => setLoginModalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* Hero Section with Ultimate Chat Button & Shimmer */}
        <HeroSection onOpenChat={() => handleOpenChat()} />

        {/* Latest Projects Grid with Sticky Stacking Animation */}
        <ProjectsSection
          projects={PROJECTS}
          onSelectProject={(project) => setSelectedProject(project)}
        />

        {/* Services & Capabilities with Continuous Rightward Drift */}
        <ServicesSection
          onSelectService={(serviceName) =>
            handleOpenChat(`Inquiry for ${serviceName}`)
          }
        />

        {/* About & Philosophy with Dual-Dimension Bento Matrix */}
        <AboutSection onOpenChat={() => handleOpenChat()} />

        {/* Frequently Asked Questions */}
        <FaqSection />
      </main>

      {/* Footer with Chat Link */}
      <Footer
        onNavigate={handleNavigate}
        onOpenChat={() => handleOpenChat()}
      />

      {/* Floating Dynamic Island Style Chat Widget */}
      <FloatingActionWidget
        onOpenChat={() => handleOpenChat()}
      />

      {/* Case Study Detail Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onInquire={(projectName) =>
          handleOpenChat(`Project: ${projectName}`)
        }
      />

      {/* Full-Screen Dual Layer Interactive Reveal Canvas with Prompt Box Overlay */}
      <InteractiveRevealModal
        isOpen={revealModalOpen}
        onClose={() => setRevealModalOpen(false)}
        onOpenBooking={handleOpenBooking}
        onOpenLogin={() => setLoginModalOpen(true)}
        initialTopic={chatTopic}
      />

      {/* Ultimate iOS-Style Interactive Chat Modal */}
      <IosChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        initialTopic={chatTopic}
        onOpenBooking={handleOpenBooking}
      />

      {/* Video Call Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        prefilledTopic={chatTopic}
      />

      {/* Optional Firebase Authentication Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
}
