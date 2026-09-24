import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, CheckCircle2, Clock, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { saveBookingToFirestore } from '../firebase';

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
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg bg-[#0d0d14] border border-white/10 rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl z-10 my-auto flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#f41151]/15 text-[#f41151] flex items-center justify-center">
                <CalendarIcon size={16} />
              </div>
              <h3
                className="text-lg sm:text-xl font-bold text-white tracking-tight"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Schedule AI Deep Dive
              </h3>
            </div>

            <button
              onClick={handleResetAndClose}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
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
                <div className="w-16 h-16 rounded-full bg-[#f41151]/15 text-[#f41151] flex items-center justify-center mx-auto border border-[#f41151]/30">
                  <CheckCircle2 size={36} />
                </div>
                <h3
                  className="text-2xl font-black text-white"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Session Confirmed!
                </h3>
                <p className="text-zinc-300 text-sm max-w-sm mx-auto">
                  Your 30-minute private AI strategy session is booked for {selectedDate} at {selectedSlot}. A calendar invite and Google Meet link have been sent to {formData.email || 'your email'}.
                </p>
                <button
                  onClick={handleResetAndClose}
                  className="mt-6 px-6 py-2.5 rounded-full bg-[#f41151] hover:bg-[#ff1e5d] text-white text-sm font-semibold transition-all cursor-pointer"
                >
                  Done
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-xs sm:text-sm text-zinc-300">
                  <Video size={18} className="text-[#f41151] shrink-0" />
                  <span>30-minute private AI consultation via Google Meet</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
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
                            ? 'bg-[#f41151]/20 border-[#f41151] text-white font-bold'
                            : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
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
                            ? 'bg-[#f41151] border-[#f41151] text-white font-bold'
                            : 'bg-white/[0.02] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <Clock size={12} className="inline mr-1 opacity-70" />
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Carter"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#f41151]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Your Email</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@brand.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#f41151]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Session / Prompt Topic</label>
                  <input
                    type="text"
                    placeholder="AI Generative system, multimodal branding, packaging specs..."
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#f41151]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#f41151] hover:bg-[#ff1e5d] text-white font-semibold text-sm shadow-[0_0_20px_rgba(244,17,81,0.4)] transition-all cursor-pointer"
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
