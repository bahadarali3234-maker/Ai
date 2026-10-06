import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, CheckCircle2, Clock, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { saveBookingToFirestore } from '../firebase';
import { useTheme } from '../context/ThemeContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledTopic?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  prefilledTopic = '',
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('Tomorrow (Mon)');
  const [selectedSlot, setSelectedSlot] = useState<string>('2:00 PM (EST)');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: prefilledTopic ? `Regarding ${prefilledTopic}` : '',
  });
  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (!isOpen) return null;

  const timeSlots = [
    '10:00 AM (EST)',
    '11:30 AM (EST)',
    '2:00 PM (EST)',
    '3:30 PM (EST)',
    '5:00 PM (EST)',
  ];

  const dates = [
    'Tomorrow (Mon)',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    saveBookingToFirestore({
      name: formData.name,
      email: formData.email,
      topic: formData.topic,
      selectedDate,
      selectedSlot,
    }).catch((err) => console.warn('Booking sync notice:', err));
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleResetAndClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg border rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl z-10 my-auto flex flex-col transition-colors duration-300"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Header */}
          <div
            className="p-6 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: isLight ? 'rgba(77, 163, 255, 0.15)' : 'rgba(255, 23, 68, 0.15)',
                  color: 'var(--primary)',
                }}
              >
                <CalendarIcon size={16} />
              </div>
              <h3
                className="text-lg sm:text-xl font-bold tracking-tight transition-colors"
                style={{ fontFamily: "'Syne', sans-serif", color: 'var(--text)' }}
              >
                Schedule AI Deep Dive
              </h3>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--surface-soft)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border"
                  style={{
                    backgroundColor: isLight ? 'rgba(77, 163, 255, 0.15)' : 'rgba(255, 23, 68, 0.15)',
                    borderColor: 'var(--primary)',
                    color: 'var(--primary)',
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>
                <h3
                  className="text-2xl font-black transition-colors"
                  style={{ fontFamily: "'Syne', sans-serif", color: 'var(--text)' }}
                >
                  Session Confirmed!
                </h3>
                <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
                  Your 30-minute private AI strategy session is booked for {selectedDate} at {selectedSlot}. A calendar invite and Google Meet link have been sent to {formData.email || 'your email'}.
                </p>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="mt-6 px-6 py-2.5 rounded-full text-white text-sm font-semibold transition-all cursor-pointer theme-button-primary"
                >
                  Done
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div
                  className="flex items-center gap-3 p-3 rounded-2xl border text-xs sm:text-sm"
                  style={{
                    backgroundColor: 'var(--surface-soft)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Video size={18} style={{ color: 'var(--primary)' }} className="shrink-0" />
                  <span>30-minute private AI consultation via Google Meet</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Select Day
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {dates.map((d) => (
                      <button
                        type="button"
                        key={d}
                        onClick={() => setSelectedDate(d)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                          selectedDate === d
                            ? 'theme-button-primary font-bold'
                            : 'hover:border-zinc-400'
                        }`}
                        style={{
                          backgroundColor: selectedDate === d ? 'var(--primary)' : 'var(--surface-soft)',
                          borderColor: selectedDate === d ? 'var(--primary)' : 'var(--border)',
                          color: selectedDate === d ? '#ffffff' : 'var(--text-secondary)',
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Available Timeslot
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                          selectedSlot === slot
                            ? 'theme-button-primary font-bold'
                            : 'hover:border-zinc-400'
                        }`}
                        style={{
                          backgroundColor: selectedSlot === slot ? 'var(--primary)' : 'var(--surface-soft)',
                          borderColor: selectedSlot === slot ? 'var(--primary)' : 'var(--border)',
                          color: selectedSlot === slot ? '#ffffff' : 'var(--text-secondary)',
                        }}
                      >
                        <Clock size={12} className="inline mr-1 opacity-70" />
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Carter"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      style={{
                        backgroundColor: 'var(--surface-soft)',
                        borderColor: 'var(--border)',
                        color: 'var(--text)',
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Your Email</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@brand.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      style={{
                        backgroundColor: 'var(--surface-soft)',
                        borderColor: 'var(--border)',
                        color: 'var(--text)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Session / Prompt Topic</label>
                  <input
                    type="text"
                    placeholder="AI Generative system, multimodal branding, packaging specs..."
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    style={{
                      backgroundColor: 'var(--surface-soft)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full text-white font-semibold text-sm transition-all cursor-pointer theme-button-primary"
                >
                  Confirm AI Consultation ({selectedDate} at {selectedSlot})
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
