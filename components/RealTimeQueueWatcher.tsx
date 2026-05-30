'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';

export default function RealTimeQueueWatcher() {
  const { isSignedIn } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [targetStation, setTargetStation] = useState('');
  const speakCount = useRef(0);

  // 🔊 ২ বার স্বয়ংক্রিয়ভাবে কথা বলার কোর ফাংশন
  function triggerTwiceVoiceAnnouncement(stationName: string, bookingId: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); 
      speakCount.current = 0; 

      // 🎯 এই একই মেসেজটি আমরা নিচে স্ক্রিনেও ডিসপ্লে করব
      const message = `Hello driver, your slot is booked at ${stationName}, and you have to go to the station within 5 minutes.`;
      
      const speakSequence = () => {
        if (speakCount.current < 2) {
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.lang = 'en-US';
          utterance.rate = 0.92;
          utterance.pitch = 1.0;

          utterance.onend = () => {
            speakCount.current += 1;
            console.log(`🔊 [Audio Engine] Finished loop number: ${speakCount.current}`);
            
            if (speakCount.current < 2) {
              setTimeout(() => speakSequence(), 1000);
            } else {
              console.log("🎯 [Audio Engine] 2 loops completed. Automatically closing alert.");
              setModalOpen(false);
              
              // 💾 PERSISTENT LOCK: ব্রাউজারের মেমোরিতে এই বুকিং আইডিটি লক করে দিন যেন রিলোড দিলে আর না বাজে
              localStorage.setItem(`alert_dismissed_${bookingId}`, 'true');
            }
          };

          window.speechSynthesis.speak(utterance);
        }
      };

      speakSequence();

    } catch (error) {
      console.error("Audio engine layout failure:", error);
    }
  }

  useEffect(() => {
    if (!isSignedIn) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }

    async function checkUpcomingSlots() {
      try {
        const res = await fetch('/api/bookings'); 
        if (!res.ok) return;

        const data = await res.json();
        
        if (data && data.bookings) {
          const nowUTC = Date.now();

          data.bookings.forEach((booking: any) => {
            if (booking.status !== 'PENDING') return;

            const slotUTC = booking.slotTimeMs; 
            const timeDifferenceInMinutes = (slotUTC - nowUTC) / (1000 * 60);

            console.log(`🔍 [Watcher] Station: ${booking.station.name} | Minutes Left: ${timeDifferenceInMinutes.toFixed(2)}`);

            // 🎯 ৫ মিনিটের উইন্ডো চেক (৪ থেকে ৫.৫ মিনিটের মধ্যে)
            if (timeDifferenceInMinutes >= 4.0 && timeDifferenceInMinutes <= 5.5) {
              
              // লোকালস্টোরেজ চেক: এই বুকিংয়ের অ্যালার্ট কি আগে বাজানো হয়েছিল?
              const isAlreadyPlayed = localStorage.getItem(`alert_dismissed_${booking.id}`);
              if (isAlreadyPlayed === 'true') {
                return; 
              }

              setTargetStation(booking.station.name);
              
              if (!modalOpen) {
                setModalOpen(true);
                triggerTwiceVoiceAnnouncement(booking.station.name, booking.id);
              }
            }
          });
        }
      } catch (err) {
        console.error("Monitor tracking issue:", err);
      }
    }

    const interval = setInterval(checkUpcomingSlots, 15000); 
    checkUpcomingSlots();

    return () => clearInterval(interval);
  }, [modalOpen, isSignedIn]);

  return (
    <AnimatePresence>
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-blue-100 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 animate-bounce">
              📢
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Slot Notification</h2>
            
            {/* 🎯 এখানে হুবহু সেই ইংলিশ অডিও মেসেজটি স্ক্রিনেও সুন্দর টেক্সট আকারে দেখাবে */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 text-left shadow-inner">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Live Audio Script:</span>
              <p className="text-slate-700 font-medium text-base italic leading-relaxed">
                "Hello driver, your slot is booked at <span className="text-blue-600 font-bold not-italic">{targetStation}</span>, and you have to go to the station within 5 minutes."
              </p>
            </div>

            <div className="text-xs text-indigo-500 font-semibold animate-pulse bg-indigo-50 py-2 rounded-lg border border-indigo-100 flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              Playing Audio Broadcast Sequence...
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}