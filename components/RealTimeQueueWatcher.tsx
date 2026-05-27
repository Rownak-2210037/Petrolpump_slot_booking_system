'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/nextjs';

export default function RealTimeQueueWatcher() {
  const { isSignedIn } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [targetStation, setTargetStation] = useState('');
  
  // 🎯 TRACKERS: মোডাল বন্ধ করতে এবং ২ বার কথা বলা ট্র্যাক করার জন্য রেফারেন্স ভেরিয়েবল
  const isAlertDismissedForThisSlot = useRef(false);
  const speakCount = useRef(0);

  // 🔊 ২ বার স্বয়ংক্রিয়ভাবে কথা বলার কোর ফাংশন
  function triggerTwiceVoiceAnnouncement(stationName: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // আগের কোনো সাউন্ড আটকে থাকলে ক্লিয়ার করি
      speakCount.current = 0; // কাউন্টার রিসেট

      const message = `Hello driver, your slot is booked at ${stationName}, and you have to go to the station within 5 minutes.`;
      
      const speakSequence = () => {
        if (speakCount.current < 2) {
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.lang = 'en-US';
          utterance.rate = 0.92;
          utterance.pitch = 1.0;

          // 🔄 ইভেন্ট লিসেনার: একবার বলা শেষ হলে এই ব্লকটি নিজে নিজেই রান করবে
          utterance.onend = () => {
            speakCount.current += 1;
            console.log(`🔊 [Audio Engine] Finished loop number: ${speakCount.current}`);
            
            if (speakCount.current < 2) {
              // ১ বার শেষ, তাই একটু বিরতি দিয়ে ২য় বার প্লে করো
              setTimeout(() => speakSequence(), 1000);
            } else {
              // 🎉 ২ বার বলা শেষ! এবার মোডালটি স্বয়ংক্রিয়ভাবে বন্ধ করে দাও
              console.log("🎯 [Audio Engine] 2 loops completed. Automatically closing alert.");
              setModalOpen(false);
            }
          };

          window.speechSynthesis.speak(utterance);
        }
      };

      // সিকোয়েন্সটি শুরু করো
      speakSequence();

    } catch (error) {
      console.error("Audio engine layout failure:", error);
    }
  }

  useEffect(() => {
    if (!isSignedIn) return;

    async function checkUpcomingSlots() {
      try {
        const res = await fetch('/api/bookings'); 
        if (!res.ok) return;

        const data = await res.json();
        
        if (data && data.bookings) {
          const nowUTC = Date.now();
          let rawPendingBookingsCount = 0;

          data.bookings.forEach((booking: any) => {
            if (booking.status !== 'PENDING') return;
            rawPendingBookingsCount++;

            const slotUTC = booking.slotTimeMs; 
            const timeDifferenceInMinutes = (slotUTC - nowUTC) / (1000 * 60);

            console.log(`🔍 [Watcher] Station: ${booking.station.name} | Minutes Left: ${timeDifferenceInMinutes.toFixed(2)}`);

            // 🎯 ৫ মিনিটের উইন্ডো চেক
            if (timeDifferenceInMinutes > 0 && timeDifferenceInMinutes <= 5.5) {
              // যদি এই স্লটের জন্য অলরেডি একবার অ্যালার্টের ২ সাইকেল শেষ হয়ে থাকে, তবে আর মোডাল খুলো না
              if (isAlertDismissedForThisSlot.current) return;

              setTargetStation(booking.station.name);
              
              if (!modalOpen) {
                setModalOpen(true);
                isAlertDismissedForThisSlot.current = true; // এই স্লটের জন্য অ্যালার্ট লক করে দাও
                triggerTwiceVoiceAnnouncement(booking.station.name);
              }
            }
          });

          // যদি কোনো পেন্ডিং বুকিং না থাকে, তবে পরবর্তী নতুন বুকিংয়ের জন্য ট্র্যাকার রিসেট করো
          if (rawPendingBookingsCount === 0) {
            isAlertDismissedForThisSlot.current = false;
          }
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
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-blue-100 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 animate-bounce">
              🚨
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Slot Approaching!</h2>
            <p className="text-slate-600 mb-4 leading-relaxed text-sm">
              Your fuel reservation window starts in <span className="font-bold text-blue-600">5 minutes</span>. Proceed immediately to: <br />
              <span className="inline-block mt-3 font-extrabold text-slate-800 text-base bg-slate-100 px-4 py-2 rounded-xl border">
                ⛽ {targetStation}
              </span>
            </p>

            <div className="text-xs text-indigo-500 font-medium animate-pulse bg-indigo-50 py-2 rounded-lg border border-indigo-100">
              🔊 Playing Voice Alert Sequence (2 Loops)...
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}