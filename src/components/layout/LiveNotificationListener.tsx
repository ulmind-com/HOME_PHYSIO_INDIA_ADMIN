import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUnreadCount, useNotifications } from "@/hooks/useNotifications";

// A premium alert sound (synthesized to avoid needing static assets)
const playAlertSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const playTone = (freq: number, type: OscillatorType, time: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.2, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, time + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + dur);
    };

    const now = ctx.currentTime;
    playTone(659.25, "sine", now, 0.4); // E5
    playTone(880.0, "sine", now + 0.15, 0.6); // A5
  } catch (e) {
    // Ignore audio policy issues
  }
};

export function LiveNotificationListener() {
  const { data: unread = 0 } = useUnreadCount();
  const { data: notifs } = useNotifications();
  const queryClient = useQueryClient();
  const prevUnreadRef = useRef(unread);

  useEffect(() => {
    if (unread > prevUnreadRef.current) {
      playAlertSound();
      
      // Fetch the latest notification immediately
      queryClient.fetchQuery({
        queryKey: ["notifications", "list", { page: 1, page_size: 12 }],
      }).then((data: any) => {
        const latest = data?.items?.[0];
        if (latest && !latest.is_read) {
          toast.success(`New Request: ${latest.title}`, {
            description: latest.message,
            duration: 8000,
          });
        } else {
          toast.success("New Booking Received!", {
            description: "Please check your notifications.",
            duration: 8000,
          });
        }
      }).catch(() => {
        toast.success("New Booking Received!");
      });
      
      queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
    }
    prevUnreadRef.current = unread;
  }, [unread, queryClient]);

  return null; // This component is invisible
}
