'use client';

import { motion } from 'framer-motion';

interface AlertModalProps {
  isOpen: boolean;
  stationName: string;
  onClose: () => void;
}

export default function AlertModal({ isOpen, stationName, onClose }: AlertModalProps) {
  if (!isOpen) return null;

  // Function to make the browser read the alert out loud using AI speech synthesis!
  const speakAlert = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(`Your time has come. Please go to ${stationName}`);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Trigger voice whenever modal shows up
  if (isOpen) {
    speakAlert();
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-blue-100 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
        <div className="text-4xl mb-4">⏰</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Slot is Next!</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Your reservation time is arriving in <span className="font-bold text-blue-600">5 minutes</span>. Please proceed immediately to: <br />
          <span className="inline-block mt-2 font-extrabold text-slate-800 text-lg bg-slate-100 px-4 py-2 rounded-xl border">
            ⛽ {stationName}
          </span>
        </p>
        <button 
          onClick={onClose}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition"
        >
          I am on my way
        </button>
      </motion.div>
    </div>
  );
}