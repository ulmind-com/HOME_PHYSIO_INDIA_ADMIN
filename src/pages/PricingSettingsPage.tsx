import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { IndianRupee, Percent, Clock3, Save } from "lucide-react";

import type { PricingSettings } from "@/types/models";
import { settingsService } from "@/services/settings.service";
import { normalizeError } from "@/services/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { env } from "@/config/env";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type FormValues = Omit<PricingSettings, "id" | "created_at" | "updated_at">;

function NumberField({
  label,
  hint,
  register,
  name,
  suffix,
}: {
  label: string;
  hint?: string;
  register: ReturnType<typeof useForm<FormValues>>["register"];
  name: keyof FormValues;
  suffix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <Input type="number" min={0} {...register(name, { valueAsNumber: true })} className={suffix ? "pr-10" : undefined} />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function PricingSettingsPage() {
  const qc = useQueryClient();
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission("settings:update");

  const { data, isLoading } = useQuery({
    queryKey: ["settings", "pricing"],
    queryFn: () => settingsService.getPricing(),
  });

  const { register, handleSubmit, reset } = useForm<FormValues>();
  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => settingsService.updatePricing(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings", "pricing"] });
      toast.success("Pricing settings saved — new bookings will use these rates immediately.");
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Pricing Settings · {env.APP_NAME}</title>
      </Helmet>
      <PageHeader
        title="Pricing Settings"
        description="Every rate used by the therapy booking pricing engine — changes apply to new bookings immediately, no deploy needed."
        icon={<IndianRupee />}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : (
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><IndianRupee className="h-4 w-4" /> Physiotherapy / Yoga / Rehab Visit Fees</CardTitle>
                <CardDescription>Daily frequency pricing tiers and the flat weekly/package rate.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <NumberField label="1 visit/day" name="daily_visit_fee_1" register={register} suffix="₹" />
                <NumberField label="2 visits/day" name="daily_visit_fee_2" register={register} suffix="₹" />
                <NumberField label="3 visits/day" name="daily_visit_fee_3" register={register} suffix="₹" />
                <div className="col-span-3">
                  <NumberField label="Weekly / Package flat rate (per visit)" name="flat_visit_fee" register={register} suffix="₹" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><IndianRupee className="h-4 w-4" /> Portable Equipment</CardTitle>
                <CardDescription>Charge per selected machine. Waived automatically for package bookings.</CardDescription>
              </CardHeader>
              <CardContent>
                <NumberField label="Charge per machine" name="machine_charge_per_unit" register={register} suffix="₹" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><IndianRupee className="h-4 w-4" /> Massage Therapy Fees</CardTitle>
                <CardDescription>Base session price by massage type, plus an overtime surcharge.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <NumberField label="Normal Oil" name="massage_normal_oil_fee" register={register} suffix="₹" />
                <NumberField label="Dry Massage" name="massage_dry_fee" register={register} suffix="₹" />
                <NumberField label="Deep Tissue" name="massage_deep_tissue_fee" register={register} suffix="₹" />
                <NumberField label="Overtime surcharge" name="massage_overtime_surcharge" register={register} suffix="₹" />
                <NumberField
                  label="Standard max duration"
                  name="massage_standard_max_minutes"
                  register={register}
                  suffix="min"
                  hint="Sessions longer than this incur the surcharge."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Percent className="h-4 w-4" /> Platform Commission</CardTitle>
                <CardDescription>Percentage of the total booking amount kept as the platform fee.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <NumberField label="Physiotherapy" name="platform_fee_physiotherapy_percent" register={register} suffix="%" />
                <NumberField label="Yoga Therapy" name="platform_fee_yoga_therapy_percent" register={register} suffix="%" />
                <NumberField label="Home Rehabilitation" name="platform_fee_home_rehabilitation_percent" register={register} suffix="%" />
                <NumberField label="Massage Therapy" name="platform_fee_massage_therapy_percent" register={register} suffix="%" />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock3 className="h-4 w-4" /> Cancellation & Refund Policy</CardTitle>
                <CardDescription>
                  If a patient cancels at least this many hours before their scheduled visit, they get a full refund automatically via Razorpay.
                  Cancelling later refunds only the percentage below (0% = no refund). Admin rejecting an already-paid booking is always a full refund, regardless of this policy.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <NumberField label="Full-refund window" name="cancellation_full_refund_window_hours" register={register} suffix="hrs" />
                <NumberField label="Late-cancellation refund" name="cancellation_late_refund_percent" register={register} suffix="%" />
              </CardContent>
            </Card>
          </div>

          {canUpdate && (
            <Button type="submit" loading={mutation.isPending} className="w-full sm:w-auto">
              <Save /> Save Pricing Settings
            </Button>
          )}
        </form>
      )}
    </div>
  );
}
