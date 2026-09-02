import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Stethoscope, Eye } from "lucide-react";

import type { ListParams } from "@/types/api";
import type { TherapyBooking } from "@/types/models";
import { therapyBookingService } from "@/services/therapy-booking.service";
import { normalizeError } from "@/services/api/client";

import { useAuth } from "@/contexts/AuthContext";
import { formatDate, formatCurrency, humanize } from "@/lib/utils";
import { env } from "@/config/env";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { Pagination } from "@/components/common/Pagination";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TherapyBookingDrawer } from "./TherapyBookingDrawer";

const STATUS_FILTERS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

const SERVICE_FILTERS = [
  { label: "Physiotherapy", value: "physiotherapy" },
  { label: "Yoga Therapy", value: "yoga_therapy" },
  { label: "Massage Therapy", value: "massage_therapy" },
  { label: "Home Rehabilitation", value: "home_rehabilitation" },
];

const PAYMENT_FILTERS = [
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];

export function TherapyBookingsPage() {
  useAuth();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [selected, setSelected] = useState<TherapyBooking | null>(null);

  const params: ListParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      search: search || undefined,
      status: status || undefined,
      service_category: serviceCategory || undefined,
      payment_status: paymentStatus || undefined,
    }),
    [page, pageSize, search, status, serviceCategory, paymentStatus]
  );

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["therapy-bookings", "list", params],
    queryFn: () => therapyBookingService.list(params),
  });

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Therapy Bookings · {env.APP_NAME}</title>
      </Helmet>

      <PageHeader
        title="Therapy Bookings"
        description="Priced Physiotherapy / Yoga / Massage / Rehabilitation bookings with Razorpay payments."
        icon={<Stethoscope />}
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between lg:flex-wrap">
          <SearchInput
            value={search}
            onChange={(v) => { setPage(1); setSearch(v); }}
            placeholder="Search by name, phone or reference…"
            className="w-full lg:max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            <Select value={serviceCategory || "__all__"} onValueChange={(v) => { setPage(1); setServiceCategory(v === "__all__" ? "" : v); }}>
              <SelectTrigger className="h-10 w-[190px]"><SelectValue placeholder="Service" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All services</SelectItem>
                {SERVICE_FILTERS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={paymentStatus || "__all__"} onValueChange={(v) => { setPage(1); setPaymentStatus(v === "__all__" ? "" : v); }}>
              <SelectTrigger className="h-10 w-[150px]"><SelectValue placeholder="Payment" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All payments</SelectItem>
                {PAYMENT_FILTERS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={status || "__all__"} onValueChange={(v) => { setPage(1); setStatus(v === "__all__" ? "" : v); }}>
              <SelectTrigger className="h-10 w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All statuses</SelectItem>
                {STATUS_FILTERS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Reference</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={8} cols={8} />
            ) : isError ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-sm font-medium text-destructive">Failed to load therapy bookings</p>
                    <p className="text-xs text-muted-foreground">{normalizeError(error).message}</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">Retry</Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="p-0">
                  <EmptyState
                    icon={<Stethoscope />}
                    title="No therapy bookings found"
                    description="Paid physiotherapy, yoga, massage and rehabilitation bookings will appear here."
                  />
                </TableCell>
              </TableRow>
            ) : (
              items.map((b, idx) => (
                <motion.tr
                  key={b.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="cursor-pointer border-b border-border transition-colors hover:bg-muted/50"
                  onClick={() => setSelected(b)}
                >
                  <TableCell className="font-mono text-xs font-medium">{b.reference}</TableCell>
                  <TableCell>
                    <p className="font-medium">{b.patient_name}</p>
                    <p className="text-xs text-muted-foreground">{b.contact_phone}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">{humanize(b.service_category)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(b.preferred_date)}</TableCell>
                  <TableCell className="text-sm font-medium">{formatCurrency(b.total_amount)}</TableCell>
                  <TableCell><StatusBadge status={b.payment_status} /></TableCell>
                  <TableCell><StatusBadge status={b.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setSelected(b); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>

        {items.length > 0 && (
          <Pagination
            meta={data?.pagination}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPage(1); setPageSize(s); }}
          />
        )}
      </Card>

      <TherapyBookingDrawer booking={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
