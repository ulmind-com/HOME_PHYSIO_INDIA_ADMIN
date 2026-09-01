import { endpoints } from "./api/endpoints";
import { http } from "./api/http";
import type { ListParams } from "@/types/api";
import type { Role, User } from "@/types/models";

export interface UserCreatePayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: string;
  user_type?: string;
  is_active: boolean;
  is_superuser: boolean;
  send_credentials_email?: boolean;
}

export const userService = {
  list: (params?: ListParams) => http.list<User>(endpoints.users.root, params),
  create: (data: UserCreatePayload) => http.post<User>(endpoints.users.root, data),
  update: (id: string, data: Partial<User>) =>
    http.put<User>(`${endpoints.users.root}/${id}`, data),
  remove: (id: string) => http.del<null>(`${endpoints.users.root}/${id}`),
  verifyDocument: (userId: string, docId: string) =>
    http.patch<any>(`${endpoints.users.root}/${userId}/documents/${docId}/verify`),

  roles: () => http.get<Role[]>(endpoints.users.roles),
  createRole: (data: { name: string; description?: string; permissions: string[] }) =>
    http.post<Role>(endpoints.users.createRole, data),
  updateRole: (id: string, data: Partial<Role>) =>
    http.put<Role>(endpoints.users.role(id), data),
  removeRole: (id: string) => http.del<null>(endpoints.users.role(id)),

  permissions: () =>
    http.get<{ code: string; group: string }[]>(endpoints.users.permissions),
};
