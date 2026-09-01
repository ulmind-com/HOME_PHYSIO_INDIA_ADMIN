import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet-async";
import { Users as UsersIcon, Plus, Pencil, Trash2, MoreHorizontal, Eye, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { ListParams } from "@/types/api";
import type { User, UserType } from "@/types/models";
import { userService, type UserCreatePayload } from "@/services/user.service";
import { userTypesService } from "@/services/user-types.service";
import { normalizeError } from "@/services/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { env } from "@/config/env";
import { formatDate, humanize, initials } from "@/lib/utils";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { Pagination } from "@/components/common/Pagination";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/common/StatusBadge";

interface UserForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  user_type: string;
  is_active: boolean;
  is_superuser: boolean;
  send_credentials_email: boolean;
}

export function TherapistsPage() {
  const qc = useQueryClient();
  const { user: currentUser, hasPermission } = useAuth();
  const canCreate = hasPermission("users:create");
  const canUpdate = hasPermission("users:update");
  const canDelete = hasPermission("users:delete");
  const isSuperuser = Boolean(currentUser?.is_superuser);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [viewingDetails, setViewingDetails] = useState<User | null>(null);

  const params: ListParams = useMemo(
    () => ({
      page,
      page_size: pageSize,
      search: search || undefined,
      role: "therapist",
      user_type: userTypeFilter || undefined,
    }),
    [page, pageSize, search, userTypeFilter]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["therapists", "list", params],
    queryFn: () => userService.list(params),
  });
  const { data: userTypesData } = useQuery({
    queryKey: ["user-types", "list"],
    queryFn: () => userTypesService.list(),
  });

  const userTypes = userTypesData?.items ?? [];

  const form = useForm<UserForm>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "therapist",
      user_type: "physiotherapist",
      is_active: true,
      is_superuser: false,
      send_credentials_email: true,
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "therapist",
      user_type: "physiotherapist",
      is_active: true,
      is_superuser: false,
      send_credentials_email: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    form.reset({
      name: user.name,
      email: user.email,
      password: "",
      phone: user.phone ?? "",
      role: user.role,
      user_type: user.user_type || "physiotherapist",
      is_active: user.is_active,
      is_superuser: user.is_superuser,
      send_credentials_email: false,
    });
    setDialogOpen(true);
  };

  const save = useMutation({
    mutationFn: (values: UserForm) => {
      if (editing) {
        const { ...rest } = values;
        return userService.update(editing.id, {
          name: rest.name,
          phone: rest.phone,
          role: rest.role,
          user_type: rest.user_type,
          is_active: rest.is_active,
          is_superuser: rest.is_superuser,
        });
      }
      
      const payload: Partial<UserForm> = { ...values };
      if (!payload.password) {
        delete payload.password;
      }
      return userService.create(payload as UserCreatePayload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["therapists"] });
      toast.success(editing ? "User updated" : "User created");
      setDialogOpen(false);
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["therapists"] });
      toast.success("User deleted");
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  const verifyDocMut = useMutation({
    mutationFn: (data: { userId: string; docId: string }) => userService.verifyDocument(data.userId, data.docId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["therapists"] });
      toast.success("Document verification updated");
      setViewingDetails((prev) => {
        if (!prev || prev.id !== variables.userId) return prev;
        return {
          ...prev,
          documents: prev.documents?.map((d) =>
            d.id === variables.docId ? { ...d, is_verified: !d.is_verified } : d
          ),
        };
      });
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Users · {env.APP_NAME}</title>
      </Helmet>
      <PageHeader
        title="Therapists"
        description="Manage therapist accounts and their profiles."
        icon={<UsersIcon />}
        actions={
          canCreate && (
            <Button onClick={openCreate}>
              <Plus /> New user
            </Button>
          )
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={search}
            onChange={(v) => {
              setPage(1);
              setSearch(v);
            }}
            placeholder="Search therapists…"
            className="w-full sm:max-w-xs"
          />
          <Select
            value={userTypeFilter || "__all__"}
            onValueChange={(v) => {
              setPage(1);
              setUserTypeFilter(v === "__all__" ? "" : v);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Therapist Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Therapist Types</SelectItem>
              {userTypes
                .filter((ut: UserType) => ut.slug !== "admin" && ut.slug !== "patient")
                .map((ut: UserType) => (
                  <SelectItem key={ut.id} value={ut.slug}>
                    {ut.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>User</TableHead>
              <TableHead>Therapist Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last login</TableHead>
              {(canUpdate || canDelete) && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={6} cols={5} />
            ) : items.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="p-0">
                  <EmptyState icon={<UsersIcon />} title="No users" />
                </TableCell>
              </TableRow>
            ) : (
              items.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        {u.avatar?.url && <AvatarImage src={u.avatar.url} />}
                        <AvatarFallback>{initials(u.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {humanize(u.user_type || "physiotherapist")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.is_superuser ? "default" : "secondary"}>
                      {u.is_superuser ? "Super Admin" : humanize(u.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={u.is_active ? "active" : "inactive"} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.last_login_at ? formatDate(u.last_login_at) : "Never"}
                  </TableCell>
                  {(canUpdate || canDelete) && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingDetails(u)}>
                            <Eye /> View Details
                          </DropdownMenuItem>
                          {canUpdate && (
                            <DropdownMenuItem onClick={() => openEdit(u)}>
                              <Pencil /> Edit
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <DropdownMenuItem destructive onClick={() => setDeleteTarget(u)}>
                              <Trash2 /> Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={form.handleSubmit((v) => save.mutate(v))}>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit user" : "New user"}</DialogTitle>
              <DialogDescription>
                {editing
                  ? "Update this user's details and permissions."
                  : "Create a new admin or staff account."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label>Full name</Label>
                <Input {...form.register("name", { required: true })} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  disabled={Boolean(editing)}
                  {...form.register("email", { required: true })}
                />
              </div>
              {!editing && (
                <>
                  <div className="space-y-1.5">
                    <Label>Password</Label>
                    <Input 
                      type="password" 
                      autoComplete="new-password"
                      placeholder="Leave blank to auto-generate" 
                      {...form.register("password")} 
                    />
                  </div>
                  <label className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">Email Credentials</p>
                      <p className="text-xs text-muted-foreground">Send an email with the login details</p>
                    </div>
                    <Switch
                      checked={form.watch("send_credentials_email")}
                      onCheckedChange={(v) => form.setValue("send_credentials_email", v)}
                    />
                  </label>
                </>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input {...form.register("phone")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Therapist Type</Label>
                  <Select
                    value={form.watch("user_type")}
                    onValueChange={(v) => form.setValue("user_type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {userTypes
                        .filter((ut: UserType) => ut.slug !== "admin" && ut.slug !== "patient")
                        .map((ut: UserType) => (
                          <SelectItem key={ut.id} value={ut.slug}>
                            {ut.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <label className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <span className="text-sm font-medium">Active account</span>
                <Switch
                  checked={form.watch("is_active")}
                  onCheckedChange={(v) => form.setValue("is_active", v)}
                />
              </label>
              {isSuperuser && (
                <label className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Super admin</p>
                    <p className="text-xs text-muted-foreground">Full unrestricted access</p>
                  </div>
                  <Switch
                    checked={form.watch("is_superuser")}
                    onCheckedChange={(v) => form.setValue("is_superuser", v)}
                  />
                </label>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={save.isPending}>
                {editing ? "Save changes" : "Create user"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete user?"
        description={`"${deleteTarget?.name}" will lose access immediately.`}
        loading={remove.isPending}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
      />
      {/* Therapist Details Dialog */}
      <Dialog open={!!viewingDetails} onOpenChange={(open) => !open && setViewingDetails(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Therapist Details</DialogTitle>
            <DialogDescription>
              Detailed view of therapist profile and documents.
            </DialogDescription>
          </DialogHeader>
          
          {viewingDetails && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Personal Information</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="font-medium text-muted-foreground">Name</span>
                    <span className="col-span-2">{viewingDetails.name}</span>
                    
                    <span className="font-medium text-muted-foreground">Email</span>
                    <span className="col-span-2">{viewingDetails.email}</span>
                    
                    <span className="font-medium text-muted-foreground">Phone</span>
                    <span className="col-span-2">{viewingDetails.phone || "-"}</span>
                    
                    <span className="font-medium text-muted-foreground">Status</span>
                    <span className="col-span-2">
                      <StatusBadge status={viewingDetails.is_active ? "active" : "inactive"} />
                    </span>
                  </div>
                </div>

                {/* Professional Info */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Professional Profile</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <span className="font-medium text-muted-foreground">Specialization</span>
                    <span className="col-span-2">Physiotherapy</span>
                    
                    <span className="font-medium text-muted-foreground">Experience</span>
                    <span className="col-span-2">N/A</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Documents & Certifications</h4>
                {(!viewingDetails.documents || viewingDetails.documents.length === 0) ? (
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center flex flex-col items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium">No documents uploaded</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {viewingDetails.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/10">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-medium truncate" title={doc.title}>{doc.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                              {doc.is_verified ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                  <CheckCircle2 className="h-3 w-3" /> Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                  Pending
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.file.url} target="_blank" rel="noreferrer">
                              <Eye className="h-4 w-4 mr-1.5" /> View
                            </a>
                          </Button>
                          <Button
                            variant={doc.is_verified ? "outline" : "default"}
                            size="sm"
                            onClick={() => verifyDocMut.mutate({ userId: viewingDetails.id, docId: doc.id })}
                            disabled={verifyDocMut.isPending}
                          >
                            {doc.is_verified ? "Unverify" : "Verify"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setViewingDetails(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
