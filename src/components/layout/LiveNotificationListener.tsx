import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BellRing, CalendarCheck } from "lucide-react";
import { STORAGE_KEYS, env } from "@/config/env";

/**
 * LiveNotificationListener
 * 
 * Polls the backend for new unread notifications every 5 seconds using
 * raw `fetch()` (bypassing axios to avoid any interceptor issues).
 * When a new notification is detected, plays a ringing sound and shows
 * a Zomato/Swiggy-style full-screen alert modal.
 * 
 * Also listens for `visibilitychange` to immediately re-poll when the
 * tab becomes visible (handles mobile Chrome throttling).
 */

// ─── Sound ───────────────────────────────────────────────────
let ringTimer: ReturnType<typeof setInterval> | null = null;

function playSound() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;

    const beep = (freq: number, start: number, dur: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.25, start + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, start + dur);
      o.connect(g).connect(ctx.destination);
      o.start(start);
      o.stop(start + dur);
    };

    beep(660, now, 0.3);
    beep(880, now + 0.18, 0.5);
  } catch {
    /* ignore */
  }
}

function startRinging() {
  stopRinging();
  playSound();
  ringTimer = setInterval(playSound, 3000);
}

function stopRinging() {
  if (ringTimer) {
    clearInterval(ringTimer);
    ringTimer = null;
  }
}

// ─── Raw fetch helper (no axios, no interceptors) ────────────
async function fetchUnreadCount(): Promise<number> {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);
  if (!token) return -1; // not logged in

  const res = await fetch(`${env.API_BASE_URL}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return -1;
  const json = await res.json();
  // Backend returns: { success: true, data: { unread: N }, message: "..." }
  return json?.data?.unread ?? 0;
}

async function fetchLatestNotification(): Promise<{
  title: string;
  message: string;
} | null> {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);
  if (!token) return null;

  const res = await fetch(
    `${env.API_BASE_URL}/notifications?page=1&page_size=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) return null;
  const json = await res.json();
  const item = json?.data?.items?.[0];
  if (!item) return null;
  return { title: item.title, message: item.message };
}

// ─── Component ───────────────────────────────────────────────
export function LiveNotificationListener() {
  const navigate = useNavigate();
  const baselineRef = useRef<number | null>(null);
  const [alert, setAlert] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const poll = useCallback(async () => {
    try {
      const count = await fetchUnreadCount();
      if (count < 0) return; // not logged in or API error

      // First poll: just record the baseline
      if (baselineRef.current === null) {
        baselineRef.current = count;
        console.log("[LiveNotif] Baseline set:", count);
        return;
      }

      // Detect increase
      if (count > baselineRef.current) {
        console.log("[LiveNotif] NEW! was:", baselineRef.current, "now:", count);

        // Get details of the latest notification
        const latest = await fetchLatestNotification();

        setAlert({
          title: latest?.title || "🔔 New Booking Received!",
          message:
            latest?.message ||
            "A new request has been submitted. Tap to view details.",
        });

        startRinging();
      }

      baselineRef.current = count;
    } catch (err) {
      console.warn("[LiveNotif] Poll error:", err);
    }
  }, []);

  useEffect(() => {
    // Poll immediately on mount
    poll();

    // Then every 5 seconds
    const id = setInterval(poll, 5000);

    // Also poll when tab becomes visible (mobile Chrome throttles setInterval)
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        console.log("[LiveNotif] Tab visible, polling now");
        poll();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      stopRinging();
    };
  }, [poll]);

  const dismiss = useCallback(() => {
    setAlert(null);
    stopRinging();
  }, []);

  const viewDetails = useCallback(() => {
    setAlert(null);
    stopRinging();
    navigate("/bookings");
  }, [navigate]);

  // ─── Render ──────────────────────────────────────────────
  return (
    <AnimatePresence>
      {alert && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Card */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white text-center shadow-2xl"
          >
            {/* Top accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-orange-400 to-red-500" />

            <div className="px-8 pt-8 pb-10">
              {/* Bell icon */}
              <div className="mx-auto mb-6 relative flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600">
                <motion.div
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-full bg-red-400/20"
                />
                <motion.div
                  animate={{ rotate: [0, -12, 12, -12, 12, 0] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    repeatDelay: 0.8,
                  }}
                >
                  <BellRing className="h-10 w-10" />
                </motion.div>
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
                {alert.title}
              </h2>
              <p className="text-sm leading-relaxed text-gray-500 mb-8">
                {alert.message}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={viewDetails}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 text-[15px] font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-700 active:scale-[0.97]"
                >
                  <CalendarCheck className="h-5 w-5" />
                  View Booking
                </button>
                <button
                  onClick={dismiss}
                  className="w-full rounded-2xl bg-gray-100 px-5 py-3.5 text-[15px] font-medium text-gray-700 transition-colors hover:bg-gray-200 active:scale-[0.97]"
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
