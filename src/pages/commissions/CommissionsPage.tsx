import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { IndianRupee, Download, BadgeIndianRupee, History } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";

import { env } from "@/config/env";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { commissionsService } from "@/services/api/commissions.service";
import { normalizeError } from "@/services/api/client";
import { formatCurrency } from "@/lib/utils";

export function CommissionsPage() {
  return (
    <div className="space-y-6 pb-12">
      <Helmet>
        <title>Commissions & Payouts · {env.APP_NAME}</title>
      </Helmet>
      
      <PageHeader
        title="Commissions & Payouts"
        description="Manage therapist earnings, platform commissions, and manual payouts."
        icon={<IndianRupee />}
      />

      <Tabs defaultValue="summaries" className="space-y-6">
        <TabsList>
          <TabsTrigger value="summaries" className="gap-2"><BadgeIndianRupee className="w-4 h-4" /> Therapist Summaries</TabsTrigger>
          <TabsTrigger value="payouts" className="gap-2"><Download className="w-4 h-4" /> Payouts</TabsTrigger>
          <TabsTrigger value="earnings" className="gap-2"><History className="w-4 h-4" /> All Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="summaries">
          <SummariesTab />
        </TabsContent>
        <TabsContent value="payouts">
          <PayoutsTab />
        </TabsContent>
        <TabsContent value="earnings">
          <EarningsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummariesTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["commissions", "summaries"],
    queryFn: () => commissionsService.getTherapistSummaries(),
  });

  const [payoutOpen, setPayoutOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<{ id: string; name: string } | null>(null);

  const summaries = data ? Object.values(data) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Therapist Summaries</CardTitle>
        <CardDescription>Aggregated view of pending, settled, and reversed earnings per therapist.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : summaries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No earnings recorded yet.</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Therapist</TableHead>
                  <TableHead className="text-right">Pending Amount</TableHead>
                  <TableHead className="text-right">Settled Amount</TableHead>
                  <TableHead className="text-right">Reversed Amount</TableHead>
                  <TableHead>Last Payout</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summaries.map((summary) => (
                  <TableRow key={summary.therapist_id}>
                    <TableCell className="font-medium">{summary.therapist_name}</TableCell>
                    <TableCell className="text-right font-bold text-amber-600">
                      {formatCurrency(summary.total_pending)}
                    </TableCell>
                    <TableCell className="text-right text-emerald-600">
                      {formatCurrency(summary.total_settled)}
                    </TableCell>
                    <TableCell className="text-right text-rose-600">
                      {formatCurrency(summary.total_reversed)}
                    </TableCell>
                    <TableCell>
                      {summary.last_payout_date ? format(new Date(summary.last_payout_date), "dd MMM yyyy") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        disabled={summary.total_pending <= 0}
                        onClick={() => {
                          setSelectedTherapist({ id: summary.therapist_id, name: summary.therapist_name });
                          setPayoutOpen(true);
                        }}
                      >
                        Settle Payout
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <CreatePayoutDialog
        open={payoutOpen}
        onOpenChange={setPayoutOpen}
        therapistId={selectedTherapist?.id || ""}
        therapistName={selectedTherapist?.name || ""}
        onSuccess={() => qc.invalidateQueries({ queryKey: ["commissions"] })}
      />
    </Card>
  );
}

function CreatePayoutDialog({ open, onOpenChange, therapistId, therapistName, onSuccess }: any) {
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: commissionsService.createPayout,
    onSuccess: () => {
      toast.success(`Payout created for ${therapistName}`);
      onSuccess();
      onOpenChange(false);
      setPeriodStart("");
      setPeriodEnd("");
      setNotes("");
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settle Payout</DialogTitle>
          <DialogDescription>
            This will group all pending earnings for <strong>{therapistName}</strong> within the selected date range into a new Payout request.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Period Start (Inclusive)</Label>
              <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Period End (Inclusive)</Label>
              <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Admin Notes (Optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="E.g. August 2026 Salary" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            disabled={!periodStart || !periodEnd} 
            loading={mutation.isPending}
            onClick={() => mutation.mutate({
              therapist_id: therapistId,
              period_start: periodStart,
              period_end: periodEnd,
              admin_notes: notes
            })}
          >
            Create Payout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PayoutsTab() {
  const qc = useQueryClient();
  const page = 1;
  const { data, isLoading } = useQuery({
    queryKey: ["commissions", "payouts", page],
    queryFn: () => commissionsService.listPayouts({ page, page_size: 50 }),
  });

  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<string | null>(null);

  const markFailed = useMutation({
    mutationFn: (id: string) => commissionsService.markFailed(id, { admin_notes: "Failed / Rejected manually" }),
    onSuccess: () => {
      toast.success("Payout marked as failed. Earnings reverted to pending.");
      qc.invalidateQueries({ queryKey: ["commissions"] });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payouts History</CardTitle>
        <CardDescription>Track the settlement status of batched payouts to therapists.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Therapist</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ref / Method</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{format(new Date(p.created_at || ""), "dd MMM yyyy, HH:mm")}</TableCell>
                    <TableCell className="font-medium">{p.therapist_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.period_start} to {p.period_end}
                    </TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(p.total_amount)}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "paid" ? "success" : p.status === "failed" ? "danger" : "warning"}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.payment_method ? (
                        <div className="text-xs">
                          <div><span className="font-semibold uppercase">{p.payment_method}</span></div>
                          <div className="text-muted-foreground">{p.transaction_reference}</div>
                        </div>
                      ) : "-"}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {p.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => {
                            if(confirm("Are you sure you want to fail this payout? Associated earnings will revert to pending.")) {
                              markFailed.mutate(p.id);
                            }
                          }}>
                            Reject
                          </Button>
                          <Button size="sm" onClick={() => {
                            setSelectedPayout(p.id);
                            setMarkPaidOpen(true);
                          }}>
                            Mark Paid
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {data?.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No payouts found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <MarkPaidDialog
        open={markPaidOpen}
        onOpenChange={setMarkPaidOpen}
        payoutId={selectedPayout || ""}
        onSuccess={() => qc.invalidateQueries({ queryKey: ["commissions"] })}
      />
    </Card>
  );
}

function MarkPaidDialog({ open, onOpenChange, payoutId, onSuccess }: any) {
  const [method, setMethod] = useState("bank_transfer");
  const [ref, setRef] = useState("");
  const [notes, setNotes] = useState("");

  const mutation = useMutation({
    mutationFn: () => commissionsService.markPaid(payoutId, {
      payment_method: method,
      transaction_reference: ref,
      admin_notes: notes
    }),
    onSuccess: () => {
      toast.success("Payout marked as paid");
      onSuccess();
      onOpenChange(false);
      setRef("");
      setNotes("");
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Paid</DialogTitle>
          <DialogDescription>
            Record the payment details after you have manually transferred the funds.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={method} 
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="bank_transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Transaction Reference / UTR</Label>
            <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Required" />
          </div>
          <div className="space-y-2">
            <Label>Admin Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!ref} loading={mutation.isPending} onClick={() => mutation.mutate()}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EarningsTab() {
  const page = 1;
  const { data, isLoading } = useQuery({
    queryKey: ["commissions", "earnings", page],
    queryFn: () => commissionsService.listEarnings({ page, page_size: 50 }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Earnings Ledger</CardTitle>
        <CardDescription>Individual booking commissions credited to therapists.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Therapist</TableHead>
                  <TableHead>Booking Ref</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{format(new Date(e.created_at || ""), "dd MMM yyyy, HH:mm")}</TableCell>
                    <TableCell className="font-medium">{e.therapist_name}</TableCell>
                    <TableCell className="font-mono text-xs">{e.booking_reference}</TableCell>
                    <TableCell>{e.service_name}</TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(e.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={e.status === "settled" ? "success" : e.status === "reversed" ? "danger" : "warning"}>
                        {e.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {data?.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No earnings found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
