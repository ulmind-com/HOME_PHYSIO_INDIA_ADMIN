import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Activity, Eye } from "lucide-react";

import type { ListParams } from "@/types/api";
import type { Booking, BookingStatus } from "@/types/models";
import { bookingService } from "@/services/booking.service";

import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/utils";
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
import { PhysioDrawer } from "./PhysioDrawer";

/** Service names that indicate a physiotherapy booking. */
const PHYSIO_KEYWORDS = [
  "physiotherapy",
  "physio",
  "rehabilitation",
  "stroke rehab",
  "orthopedic",
  "mobility",
  "balance training",
  "geriatric physio",
  "bedridden patient physio",
  "pain management",
  "exercise therapy",
];

function isPhysioBooking(b: Booking): boolean {
  const name = b.service_name.toLowerCase();
  return PHYSIO_KEYWORDS.some((kw) => name.includes(kw));
}

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

export function PhysioRequestsPage() {
  useAuth();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [selected, setSelected] = useState<Booking | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["bookings", "list", "physio", search, status, page, pageSize],
    queryFn: async () => {
      const result = await bookingService.list({
        search: search || undefined,
        status: (status as BookingStatus) || undefined,
        page: 1,
        page_size: 100,
      });
      const physioItems = result.items.filter(isPhysioBooking);
      const startIdx = (page - 1) * pageSize;
      const paginatedItems = physioItems.slice(startIdx, startIdx + pageSize);
      return {
        items: paginatedItems,
        pagination: {
          total: physioItems.length,
          page,
          page_size: pageSize,
          total_pages: Math.max(1, Math.ceil(physioItems.length / pageSize)),
          has_next: startIdx + pageSize < physioItems.length,
          has_prev: page > 1,
        },
      };
    },
  });

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Physio Requests · {env.APP_NAME}</title>
      </Helmet>

      <PageHeader
        title="Physio Requests"
        description="Review and manage physiotherapy booking requests."
        icon={<Activity />}
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            value={search}
            onChange={(v) => {
              setPage(1);
              setSearch(v);
            }}
            placeholder="Search by name, phone or reference…"
            className="w-full lg:max-w-sm"
          />
          <Select
            value={status || "__all__"}
            onValueChange={(v) => {
              setPage(1);
              setStatus(v === "__all__" ? "" : v);
            }}
          >
            <SelectTrigger className="h-10 w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All statuses</SelectItem>
              {STATUS_FILTERS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Reference</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Preferred date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={8} cols={6} />
            ) : isError ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-sm font-medium text-destructive">Failed to load physio requests</p>
                    <p className="text-xs text-muted-foreground">{normalizeError(error).message}</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">Retry</Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="p-0">
                  <EmptyState
                    icon={<Activity />}
                    title="No physiotherapy requests found"
                    description="Physiotherapy bookings submitted from the website will appear here."
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
                  <TableCell className="font-mono text-xs font-medium">
                    {b.reference}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{b.patient_name}</p>
                    <p className="text-xs text-muted-foreground">{b.contact_phone}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {b.service_name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(b.preferred_date)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={b.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(b);
                      }}
                    >
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
            onPageSizeChange={(s) => {
              setPage(1);
              setPageSize(s);
            }}
          />
        )}
      </Card>

      <PhysioDrawer booking={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
