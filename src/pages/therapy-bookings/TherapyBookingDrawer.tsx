import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Activity,
  Check,
  X,
  Ban,
  UserPlus,
  Wallet,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import type { TherapyBooking } from "@/types/models";
import { therapyBookingService } from "@/services/therapy-booking.service";
import { userService } from "@/services/user.service";
import { normalizeError } from "@/services/api/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate, formatCurrency, humanize } from "@/lib/utils";

interface Props {
  booking: TherapyBooking | null;
  onClose: () => void;
}

const SERVICE_TYPE_MAP: Record<string, string> = {
  physiotherapy: "physiotherapist",
  yoga_therapy: "yoga_therapist",
  massage_therapy: "massage_therapist",
  home_rehabilitation: "physiotherapist",
};

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-accent">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export function TherapyBookingDrawer({ booking, onClose }: Props) {
  const qc = useQueryClient();
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission("therapy_bookings:update");
  const [notes, setNotes] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");

  useEffect(() => {
    setNotes("");
    setSelectedStaffId("");
  }, [booking?.id]);

  const wantedUserType = booking ? SERVICE_TYPE_MAP[booking.service_category] : undefined;

  const { data: therapistsData } = useQuery({
    queryKey: ["therapists", "select", wantedUserType],
    queryFn: () =>
      userService.list({ page_size: 100, role: "therapist", verification_status: "approved", user_type: wantedUserType }),
    enabled: Boolean(booking),
  });

  const therapists = (therapistsData?.items ?? []).filter((t) => {
    if (booking?.service_category === "massage_therapy") {
      return Boolean(t.gender) && t.gender === booking.patient_gender;
    }
    return true;
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["therapy-bookings"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const action = useMutation({
    mutationFn: async (kind: "approved" | "rejected" | "cancelled" | "completed") => {
      if (!booking) return;
      return therapyBookingService.updateStatus(booking.id, kind, notes || undefined);
    },
    onSuccess: (_, kind) => {
      invalidate();
      toast.success(`Booking ${kind}`);
      onClose();
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  const assign = useMutation({
    mutationFn: () => {
      const selected = therapists.find((t) => t.id === selectedStaffId);
      if (!selected) throw new Error("Please select a valid therapist");
      return therapyBookingService.assign(booking!.id, selected.id, selected.name);
    },
    onSuccess: (updatedBooking) => {
      invalidate();
      toast.success("Therapist assigned successfully");
      if (booking && updatedBooking) {
        booking.assigned_staff_id = updatedBooking.assigned_staff_id;
        booking.assigned_staff_name = updatedBooking.assigned_staff_name;
      }
      setSelectedStaffId("");
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  const isTerminal =
    booking && ["completed", "cancelled", "rejected"].includes(booking.status);
  const isPaid = booking?.payment_status === "paid";
  const isAssignable = booking && ["approved", "in_progress"].includes(booking.status);

  return (
    <Sheet open={Boolean(booking)} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-lg">
        {booking && (
          <>
            <SheetHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <SheetTitle>{booking.patient_name}</SheetTitle>
                  <SheetDescription className="font-mono text-xs">{booking.reference}</SheetDescription>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={booking.status} />
                  <StatusBadge status={booking.payment_status} />
                </div>
              </div>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoRow icon={Activity} label="Service" value={humanize(booking.service_category)} />
                <InfoRow icon={Calendar} label="Preferred date" value={formatDate(booking.preferred_date)} />
                <InfoRow icon={Clock} label="Shift / Slot" value={`${humanize(booking.shift)} · ${booking.time_slot}`} />
                <InfoRow icon={User} label="Patient" value={`${booking.patient_name}${booking.patient_age ? `, ${booking.patient_age}` : ""}${booking.patient_gender ? ` (${humanize(booking.patient_gender)})` : ""}`} />
                <InfoRow icon={Phone} label="Phone" value={booking.contact_phone} />
                <InfoRow icon={Mail} label="Email" value={booking.contact_email} />
              </section>

              <Separator />

              <section className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5" /> Pricing
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm rounded-xl border border-border p-3">
                  <span className="text-muted-foreground">Visit fee</span>
                  <span className="text-right">{formatCurrency(booking.visit_fee)}</span>
                  <span className="text-muted-foreground">Machine charge</span>
                  <span className="text-right">{formatCurrency(booking.machine_charge)}</span>
                  <span className="font-medium">Total</span>
                  <span className="text-right font-medium">{formatCurrency(booking.total_amount)}</span>
                  <span className="text-muted-foreground">Platform fee ({booking.platform_fee_percent}%)</span>
                  <span className="text-right text-muted-foreground">-{formatCurrency(booking.platform_fee_amount)}</span>
                  <span className="text-muted-foreground">Therapist payout</span>
                  <span className="text-right">{formatCurrency(booking.therapist_payout)}</span>
                </div>
                {booking.equipment.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center text-xs text-muted-foreground">
                    <Wrench className="h-3.5 w-3.5" />
                    {booking.equipment.map((e) => (
                      <span key={e} className="rounded-full border border-border px-2 py-0.5 uppercase">{e}</span>
                    ))}
                  </div>
                )}
              </section>

              <Separator />

              <section className="space-y-4">
                <InfoRow
                  icon={MapPin}
                  label="Location"
                  value={[booking.address, booking.city, booking.pincode].filter(Boolean).join(", ")}
                />
                {booking.condition_notes && (
                  <div className="rounded-lg border border-border bg-muted/40 p-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Patient Condition</p>
                    <p className="text-sm">{booking.condition_notes}</p>
                  </div>
                )}
                {booking.admin_notes && (
                  <div className="rounded-lg border border-border bg-muted/40 p-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Admin notes</p>
                    <p className="whitespace-pre-wrap text-sm">{booking.admin_notes}</p>
                  </div>
                )}
                {booking.refund_amount > 0 && (
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                    <p className="mb-1 text-xs font-medium text-green-700">Refund Processed</p>
                    <p className="text-sm">
                      {formatCurrency(booking.refund_amount)} refunded
                      {booking.cancelled_by ? ` (cancelled by ${booking.cancelled_by})` : ""}
                    </p>
                    {booking.cancellation_reason && (
                      <p className="text-xs text-muted-foreground mt-1">Reason: {booking.cancellation_reason}</p>
                    )}
                  </div>
                )}
              </section>

              {canUpdate && (
                <>
                  <Separator />
                  <section className="space-y-4">
                    {!isPaid && (
                      <p className="text-xs text-amber-600 bg-amber-500/10 rounded-lg p-2.5">
                        Payment not yet completed — approval is disabled until the patient pays.
                      </p>
                    )}
                    {isAssignable && (
                      <div className="space-y-1.5">
                        <Label>Assign Therapist</Label>
                        <div className="flex gap-2">
                          <select
                            value={selectedStaffId}
                            onChange={(e) => setSelectedStaffId(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="">-- Select Therapist --</option>
                            {therapists.map((t) => (
                              <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                            ))}
                          </select>
                          <Button variant="outline" onClick={() => assign.mutate()} loading={assign.isPending} disabled={!selectedStaffId}>
                            <UserPlus /> Assign
                          </Button>
                        </div>
                        {therapists.length === 0 && (
                          <p className="text-xs text-muted-foreground">
                            No approved {humanize(wantedUserType ?? "")}
                            {booking.service_category === "massage_therapy" ? ` (${humanize(booking.patient_gender ?? "")})` : ""} available.
                          </p>
                        )}
                        {booking.assigned_staff_name && (
                          <p className="text-xs text-muted-foreground">
                            Currently assigned to <span className="font-medium text-foreground">{booking.assigned_staff_name}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {!isTerminal && (
                      <div className="space-y-1.5">
                        <Label>Note / reason (for reject or cancel)</Label>
                        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional reason…" rows={2} />
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>

            {canUpdate && !isTerminal && (
              <div className="flex flex-wrap gap-2 border-t border-border bg-muted/30 p-4">
                <Button
                  variant="success"
                  className="flex-1"
                  onClick={() => action.mutate("approved")}
                  loading={action.isPending}
                  disabled={booking.status === "approved" || !isPaid}
                >
                  <Check /> Approve
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => action.mutate("rejected")} loading={action.isPending}>
                  <X /> Reject
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => action.mutate("cancelled")} loading={action.isPending}>
                  <Ban /> Cancel
                </Button>
                {["approved", "in_progress"].includes(booking.status) && (
                  <Button variant="default" className="flex-1" onClick={() => action.mutate("completed")} loading={action.isPending}>
                    <Check /> Complete
                  </Button>
                )}
              </div>
            )}
            {isTerminal && (
              <div className="border-t border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                This booking is {humanize(booking.status).toLowerCase()} and can no longer be modified.
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
