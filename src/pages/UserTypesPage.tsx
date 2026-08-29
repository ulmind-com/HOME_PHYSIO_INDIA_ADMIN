import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet-async";
import { Users as UsersIcon, Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import type { ListParams } from "@/types/api";
import type { UserType } from "@/types/models";
import { userTypesService } from "@/services/user-types.service";
import { normalizeError } from "@/services/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { env } from "@/config/env";
import { PageHeader } from "@/components/common/PageHeader";
import { SearchInput } from "@/components/common/SearchInput";
import { Pagination } from "@/components/common/Pagination";
import { TableSkeleton } from "@/components/common/TableSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface UserTypeForm {
  name: string;
  description: string;
}

export function UserTypesPage() {
  const qc = useQueryClient();
  const { hasPermission } = useAuth();
  
  // Checking admin permission for now (assume users:manage or similar)
  const canCreate = hasPermission("users:create");
  const canUpdate = hasPermission("users:update");
  const canDelete = hasPermission("users:delete");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UserType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserType | null>(null);

  const params: ListParams = useMemo(
    () => ({ page, page_size: pageSize, search: search || undefined }),
    [page, pageSize, search]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["user-types", "list", params],
    queryFn: () => userTypesService.list(params),
  });

  const form = useForm<UserTypeForm>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({
      name: "",
      description: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (userType: UserType) => {
    setEditing(userType);
    form.reset({
      name: userType.name,
      description: userType.description,
    });
    setDialogOpen(true);
  };

  const save = useMutation({
    mutationFn: (values: UserTypeForm) => {
      if (editing) {
        return userTypesService.update(editing.id, values);
      }
      return userTypesService.create(values);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-types"] });
      toast.success(editing ? "User Type updated" : "User Type created");
      setDialogOpen(false);
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => userTypesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-types"] });
      toast.success("User Type deleted");
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>User Types · {env.APP_NAME}</title>
      </Helmet>
      <PageHeader
        title="User Types"
        description="Manage the different types of users in the platform."
        icon={<UsersIcon />}
        actions={
          canCreate && (
            <Button onClick={openCreate}>
              <Plus /> New Type
            </Button>
          )
        }
      />

      <Card className="overflow-hidden">
        <div className="border-b border-border p-4">
          <SearchInput
            value={search}
            onChange={(v) => {
              setPage(1);
              setSearch(v);
            }}
            placeholder="Search types…"
            className="w-full sm:max-w-xs"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Core</TableHead>
              {(canUpdate || canDelete) && (
                <TableHead className="text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={4} cols={5} />
            ) : items.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="p-0">
                  <EmptyState icon={<UsersIcon />} title="No user types" />
                </TableCell>
              </TableRow>
            ) : (
              items.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.slug}</TableCell>
                  <TableCell>{u.description}</TableCell>
                  <TableCell>
                    {u.is_core ? (
                      <Badge variant="default">Core</Badge>
                    ) : (
                      <Badge variant="secondary">Custom</Badge>
                    )}
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
                          {canUpdate && (
                            <DropdownMenuItem onClick={() => openEdit(u)}>
                              <Pencil /> Edit
                            </DropdownMenuItem>
                          )}
                          {canDelete && !u.is_core && (
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
              <DialogTitle>{editing ? "Edit User Type" : "New User Type"}</DialogTitle>
              <DialogDescription>
                {editing
                  ? "Update this user type details."
                  : "Create a new category of user."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label>Type Name</Label>
                <Input {...form.register("name", { required: true })} placeholder="e.g. Yoga Therapist" />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input {...form.register("description")} placeholder="Brief description of this role" />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={save.isPending}>
                {editing ? "Save changes" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete User Type?"
        description={`"${deleteTarget?.name}" will be deleted. Ensure no users are currently assigned to this type.`}
        loading={remove.isPending}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
      />
    </div>
  );
}
