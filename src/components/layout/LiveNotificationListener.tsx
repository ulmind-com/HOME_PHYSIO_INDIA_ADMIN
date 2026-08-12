import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BellRing, CalendarCheck } from "lucide-react";
import { notificationService } from "@/services/notification.service";

let ringInterval: NodeJS.Timeout | null = null;

const playRingingSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = () => {
      const freq1 = 659.25; // E5
      const freq2 = 880.00; // A5
      const now = ctx.currentTime;

      // First beep
      let osc = ctx.createOscillator();
      let gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq1;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);

      // Second beep
      osc = ctx.createOscillator();
      gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq2;
      gain.gain.setValueAtTime(0, now + 0.2);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.2);
      osc.stop(now + 0.6);
    };

    playTone();
  } catch (e) {
    // Ignore audio policy issues
  }
};

export function LiveNotificationListener() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Track unread count internally to avoid react-query focus pause
  const prevUnreadRef = useRef<number | null>(null);
  const [activeAlert, setActiveAlert] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    // Poll every 5 seconds regardless of window focus
    const pollInterval = setInterval(async () => {
      try {
        const data = await notificationService.unreadCount();
        const unread = data.unread;

        if (prevUnreadRef.current !== null && unread > prevUnreadRef.current) {
          // New notification arrived!
          
          // Stop previous ringing if any
          if (ringInterval) clearInterval(ringInterval);
          
          // Start ringing every 2.5 seconds
          playRingingSound();
          ringInterval = setInterval(playRingingSound, 2500);

          queryClient.fetchQuery({
            queryKey: ["notifications", "list", { page: 1, page_size: 12 }],
          }).then((res: any) => {
            const latest = res?.items?.[0];
            setActiveAlert({
              title: latest?.title || "New Booking Received!",
              message: latest?.message || "Please check your notifications for details.",
            });
          }).catch(() => {
            setActiveAlert({
              title: "New Booking Received!",
              message: "Please check your notifications for details.",
            });
          });
          
          queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
          queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
        }
        prevUnreadRef.current = unread;
      } catch (err) {
        // Silent fail on polling errors
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [queryClient]);

  const dismissAlert = () => {
    setActiveAlert(null);
    if (ringInterval) {
      clearInterval(ringInterval);
      ringInterval = null;
    }
  };

  const viewBooking = () => {
    dismissAlert();
    navigate("/notifications");
  };

  // Zomato style prominent overlay modal
  return (
    <AnimatePresence>
      {activeAlert && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden rounded-[24px] bg-white text-center shadow-2xl"
          >
            {/* Animated glowing top border */}
            <div className="h-2 w-full bg-gradient-to-r from-red-500 via-orange-500 to-red-500 bg-[length:200%_100%] animate-[pulse_2s_ease-in-out_infinite]" />

            <div className="p-8 pb-10">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 relative">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full bg-red-500/20"
                />
                <motion.div
                  animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                >
                  <BellRing className="h-10 w-10" />
                </motion.div>
              </div>

              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground mb-3">
                {activeAlert.title}
              </h2>
              <p className="text-[15px] leading-relaxed text-muted-foreground mb-8">
                {activeAlert.message}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={viewBooking}
                  className="w-full rounded-xl bg-red-600 px-5 py-4 text-[15px] font-semibold text-white shadow-lg shadow-red-600/30 transition-all hover:bg-red-700 hover:shadow-red-600/40 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <CalendarCheck className="h-5 w-5" />
                  View Details Now
                </button>
                <button
                  onClick={dismissAlert}
                  className="w-full rounded-xl bg-muted px-5 py-3.5 text-[15px] font-medium text-foreground transition-colors hover:bg-muted-foreground/10 active:scale-[0.98]"
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
