import { apiRequest } from "./client";
import { endpoints } from "./endpoints";
import type { TherapistEarning, TherapistPayout } from "@/types/models";

export interface TherapistSummary {
  therapist_id: string;
  therapist_name: string;
  total_pending: number;
  total_settled: number;
  total_reversed: number;
  last_payout_date?: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export const commissionsService = {
  getTherapistSummaries: () =>
    apiRequest<Record<string, TherapistSummary>>({
      url: endpoints.commissions.therapistSummaries,
      method: "GET",
    }),

  listEarnings: (params: { page: number; page_size: number; status?: string; therapist_id?: string }) =>
    apiRequest<PaginatedResponse<TherapistEarning>>({
      url: endpoints.commissions.earnings,
      method: "GET",
      params,
    }),

  listPayouts: (params: { page: number; page_size: number; status?: string; therapist_id?: string }) =>
    apiRequest<PaginatedResponse<TherapistPayout>>({
      url: endpoints.commissions.payouts,
      method: "GET",
      params,
    }),

  createPayout: (data: { therapist_id: string; period_start: string; period_end: string; admin_notes?: string }) =>
    apiRequest<TherapistPayout>({
      url: endpoints.commissions.createPayout,
      method: "POST",
      data,
    }),

  markPaid: (payoutId: string, data: { payment_method: string; transaction_reference: string; admin_notes?: string }) =>
    apiRequest<TherapistPayout>({
      url: endpoints.commissions.markPaid(payoutId),
      method: "PATCH",
      data,
    }),

  markFailed: (payoutId: string, data: { admin_notes?: string }) =>
    apiRequest<TherapistPayout>({
      url: endpoints.commissions.markFailed(payoutId),
      method: "PATCH",
      data,
    }),
};
