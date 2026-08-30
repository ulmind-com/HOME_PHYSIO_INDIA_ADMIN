import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { toast } from "sonner";
import { Phone, CheckCircle, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

import { firebaseAuth } from "@/config/firebase";
import { authService } from "@/services/auth.service";
import { tokenStore } from "@/services/api/tokens";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeError } from "@/services/api/client";
import { env } from "@/config/env";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PhoneLoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);
  const confirmationResult = useRef<ConfirmationResult | null>(null);

  // Initialize invisible reCAPTCHA on mount
  useEffect(() => {
    if (!recaptchaVerifier.current) {
      recaptchaVerifier.current = new RecaptchaVerifier(firebaseAuth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
      });
    }

    // Cleanup on unmount to prevent memory leaks / re-rendering issues
    return () => {
      if (recaptchaVerifier.current) {
        recaptchaVerifier.current.clear();
        recaptchaVerifier.current = null;
      }
    };
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error("Please enter a valid phone number with country code.");
      return;
    }

    setLoading(true);
    try {
      if (!recaptchaVerifier.current) throw new Error("reCAPTCHA not initialized");
      
      const result = await signInWithPhoneNumber(firebaseAuth, phone, recaptchaVerifier.current);
      confirmationResult.current = result;
      
      setOtpSent(true);
      toast.success("OTP sent successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to send OTP. Please try again.");
      // Reset recaptcha on error so user can try again
      if (recaptchaVerifier.current) {
        recaptchaVerifier.current.render().then((widgetId) => {
          (window as any).grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      if (!confirmationResult.current) throw new Error("OTP not sent");

      // Verify OTP with Firebase
      const result = await confirmationResult.current.confirm(otp);
      
      // Get Firebase ID Token
      const idToken = await result.user.getIdToken(true);
      
      // Send token to our backend for sync & login
      const res = await authService.phoneLogin(idToken);
      
      // Set tokens & user
      tokenStore.set(res.access_token, res.refresh_token);
      setUser(res.user);
      
      toast.success("Logged in successfully!");
      navigate("/", { replace: true });
    } catch (err: any) {
      console.error("Verification Error:", err);
      toast.error(normalizeError(err).message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-xl border border-border">
        
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{env.APP_NAME}</h1>
          <p className="text-muted-foreground">Patient Portal Login</p>
        </div>

        {/* reCAPTCHA Container - Hidden */}
        <div id="recaptcha-container"></div>

        {!otpSent ? (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 text-lg"
                  required
                  disabled={loading}
                  autoComplete="tel"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Include country code (e.g. +91 for India)
              </p>
            </div>
            
            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {loading ? "Sending..." : "Send OTP"}
              {!loading && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <div className="relative">
                <CheckCircle className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="pl-10 text-lg text-center tracking-[0.5em]"
                  required
                  disabled={loading}
                  autoComplete="one-time-code"
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Verify & Login"}
            </Button>

            <div className="text-center">
               <Button 
                 variant="link" 
                 type="button" 
                 onClick={() => setOtpSent(false)}
                 disabled={loading}
                 className="text-sm text-muted-foreground"
               >
                 Change phone number
               </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
