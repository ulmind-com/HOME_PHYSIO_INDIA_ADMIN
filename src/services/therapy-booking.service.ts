import { endpoints } from "./api/endpoints";
import { http } from "./api/http";
import type { ListParams } from "@/types/api";
import type { TherapyBooking } from "@/types/models";

export const therapyBookingService = {
  list: (params?: ListParams) => http.list<TherapyBooking>(endpoints.therapyBookings.root, params),
  get: (id: string) => http.get<TherapyBooking>(`${endpoints.therapyBookings.root}/${id}`),
  updateStatus: (id: string, status: string, reason?: string) =>
    http.patch<TherapyBooking>(
      `${endpoints.therapyBookings.status(id)}?status=${encodeURIComponent(status)}`,
      { reason }
    ),
  assign: (id: string, assigned_staff_id: string, assigned_staff_name: string) =>
    http.post<TherapyBooking>(endpoints.therapyBookings.assign(id), {
      assigned_staff_id,
      assigned_staff_name,
    }),
};
