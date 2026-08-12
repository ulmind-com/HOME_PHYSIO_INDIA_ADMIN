import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BellRing, CalendarCheck } from "lucide-react";
import { notificationService } from "@/services/notification.service";

let ringInterval: ReturnType<typeof setInterval> | null = null;

const playRingingSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // First beep
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.value = 659.25; // E5
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second beep (higher)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.value = 880.0; // A5
    gain2.gain.setValueAtTime(0, now + 0.2);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.25);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.2);
    osc2.stop(now + 0.6);
  } catch {
    // Ignore audio policy issues
  }
};

const stopRinging = () => {
  if (ringInterval) {
    clearInterval(ringInterval);
    ringInterval = null;
  }
};

export function LiveNotificationListener() {
  const navigate = useNavigate();
  const prevUnreadRef = useRef<number | null>(null);
  const [activeAlert, setActiveAlert] = useState<{
    title: string;
    message: string;
  } | null>(null);

  // Poll unread count directly via fetch (no react-query, no window focus dependency)
  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      try {
        const result = await notificationService.unreadCount();
        const currentUnread = result.unread;

        if (!mounted) return;

        // On first poll, just record the baseline
        if (prevUnreadRef.current === null) {
          prevUnreadRef.current = currentUnread;
          return;
        }

        // If unread count increased, a new notification arrived!
        if (currentUnread > prevUnreadRef.current) {
          // Try to fetch latest notification details
          try {
            const notifs = await notificationService.list({
              page: 1,
              page_size: 1,
            });
            const latest = notifs?.items?.[0];
            if (mounted) {
              setActiveAlert({
                title: latest?.title || "New Booking Received!",
                message:
                  latest?.message ||
                  "A new request has been submitted. Check your notifications.",
              });
            }
          } catch {
            if (mounted) {
              setActiveAlert({
                title: "New Booking Received!",
                message:
                  "A new request has been submitted. Check your notifications.",
              });
            }
          }

          // Start ringing
          stopRinging();
          playRingingSound();
          ringInterval = setInterval(playRingingSound, 2500);
        }

        prevUnreadRef.current = currentUnread;
      } catch {
        // Silent fail — network error, auth error, etc.
      }
    };

    // Initial poll immediately
    poll();

    // Then poll every 5 seconds
    const intervalId = setInterval(poll, 5000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
      stopRinging();
    };
  }, []);

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
    stopRinging();
  }, []);

  const viewBooking = useCallback(() => {
    setActiveAlert(null);
    stopRinging();
    navigate("/bookings");
  }, [navigate]);

  return (
    <AnimatePresence>
      {activeAlert && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Zomato-style card */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="relative w-full max-w-md overflow-hidden rounded-[24px] bg-white text-center shadow-2xl"
          >
            {/* Animated top accent bar */}
            <div className="h-2 w-full bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]" />

            <div className="p-8 pb-10">
              {/* Animated bell icon */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 relative">
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0, 0.4],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-full bg-red-500/20"
                />
                <motion.div
                  animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                >
                  <BellRing className="h-10 w-10" />
                </motion.div>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-3">
                {activeAlert.title}
              </h2>
              <p className="text-[15px] leading-relaxed text-gray-500 mb-8">
                {activeAlert.message}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={viewBooking}
                  className="w-full rounded-xl bg-red-600 px-5 py-4 text-[15px] font-semibold text-white shadow-lg shadow-red-600/30 transition-all hover:bg-red-700 hover:shadow-red-600/40 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <CalendarCheck className="h-5 w-5" />
                  View Booking
                </button>
                <button
                  onClick={dismissAlert}
                  className="w-full rounded-xl bg-gray-100 px-5 py-3.5 text-[15px] font-medium text-gray-700 transition-colors hover:bg-gray-200 active:scale-[0.98]"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
