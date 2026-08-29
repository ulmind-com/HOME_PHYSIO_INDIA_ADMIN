import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet-async";
import { FileText, Plus, Eye, Pencil, Trash2, MoreHorizontal, Download } from "lucide-react";
import { toast } from "sonner";
import type { ListParams } from "@/types/api";
import type { MedicalReport, ReportStatus, ReportType } from "@/types/models";
import { medicalReportsService } from "@/services/medical-reports.service";
import { normalizeError } from "@/services/api/client";
import { env } from "@/config/env";
import { formatDate } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface UploadForm {
  title: string;
  report_type: ReportType;
  patient_id: string;
  file: FileList;
}

interface ReviewForm {
  status: ReportStatus;
  physio_notes: string;
}

export function MedicalReportsPage() {
  const qc = useQueryClient();
  // Assume generic view/update permissions, or specific medical_reports permissions
  const canUpdate = true; // Admins have *

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  
  const [uploadOpen, setUploadOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MedicalReport | null>(null);

  const params: ListParams = useMemo(
    () => ({ page, page_size: pageSize, search: search || undefined }),
    [page, pageSize, search]
  );

  const { data, isLoading } = useQuery({
    queryKey: ["medical-reports", "list", params],
    queryFn: () => medicalReportsService.list(params),
  });

  const uploadForm = useForm<UploadForm>({
    defaultValues: {
      title: "",
      report_type: "Medical Report",
      patient_id: "",
    },
  });

  const reviewForm = useForm<ReviewForm>({
    defaultValues: {
      status: "Viewed",
      physio_notes: "",
    },
  });

  const openUpload = () => {
    uploadForm.reset();
    setUploadOpen(true);
  };

  const openReview = (report: MedicalReport) => {
    setSelectedReport(report);
    reviewForm.reset({
      status: report.status,
      physio_notes: report.physio_notes || "",
    });
    setReviewOpen(true);
  };
  
  const openPreview = (report: MedicalReport) => {
    setSelectedReport(report);
    setPreviewOpen(true);
  };

  const uploadMutation = useMutation({
    mutationFn: (values: UploadForm) => {
      const file = values.file[0];
      return medicalReportsService.upload({
        title: values.title,
        report_type: values.report_type,
        patient_id: values.patient_id,
        file: file,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medical-reports"] });
      toast.success("Medical Report uploaded successfully");
      setUploadOpen(false);
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  const reviewMutation = useMutation({
    mutationFn: (values: ReviewForm) => {
      if (!selectedReport) throw new Error("No report selected");
      return medicalReportsService.review(selectedReport.id, values);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medical-reports"] });
      toast.success("Medical Report reviewed");
      setReviewOpen(false);
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => medicalReportsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["medical-reports"] });
      toast.success("Report deleted successfully");
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(normalizeError(err).message),
  });

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Medical Reports · {env.APP_NAME}</title>
      </Helmet>
      <PageHeader
        title="Medical Reports"
        description="Manage patient prescriptions, X-rays, and medical documents."
        icon={<FileText />}
        actions={
          canUpdate && (
            <Button onClick={openUpload}>
              <Plus /> Upload Report
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
            placeholder="Search report titles…"
            className="w-full sm:max-w-xs"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Report Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Patient ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton rows={5} cols={6} />
            ) : items.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="p-0">
                  <EmptyState icon={<FileText />} title="No reports found" />
                </TableCell>
              </TableRow>
            ) : (
              items.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{r.report_type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.patient_id}</TableCell>
                  <TableCell>
                     <Badge variant={r.status === "Reviewed" ? "success" : r.status === "Viewed" ? "secondary" : "danger"}>
                        {r.status}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.created_at ? formatDate(r.created_at) : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openPreview(r)}>
                          <Eye /> Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(r.file?.url, '_blank')}>
                          <Download /> Download
                        </DropdownMenuItem>
                        {canUpdate && (
                          <DropdownMenuItem onClick={() => openReview(r)}>
                            <Pencil /> Review / Notes
                          </DropdownMenuItem>
                        )}
                        {canUpdate && (
                          <DropdownMenuItem destructive onClick={() => setDeleteTarget(r)}>
                            <Trash2 /> Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
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

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={uploadForm.handleSubmit((v) => uploadMutation.mutate(v))}>
            <DialogHeader>
              <DialogTitle>Upload Medical Report</DialogTitle>
              <DialogDescription>
                Upload a document or image on behalf of a patient.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label>Report Title</Label>
                <Input {...uploadForm.register("title", { required: true })} placeholder="e.g. Post-Surgery X-Ray" />
              </div>
              
              <div className="space-y-1.5">
                <Label>Patient ID</Label>
                <Input {...uploadForm.register("patient_id", { required: true })} placeholder="Enter patient ID" />
              </div>

              <div className="space-y-1.5">
                <Label>Report Type</Label>
                <Select
                  value={uploadForm.watch("report_type")}
                  onValueChange={(v: any) => uploadForm.setValue("report_type", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prescription">Prescription</SelectItem>
                    <SelectItem value="X-Ray">X-Ray</SelectItem>
                    <SelectItem value="MRI">MRI</SelectItem>
                    <SelectItem value="Medical Report">Medical Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label>File</Label>
                <Input type="file" {...uploadForm.register("file", { required: true })} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUploadOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={uploadMutation.isPending}>
                Upload
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Review Dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={reviewForm.handleSubmit((v) => reviewMutation.mutate(v))}>
            <DialogHeader>
              <DialogTitle>Review Medical Report</DialogTitle>
              <DialogDescription>
                Update the status and add physiotherapist notes.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={reviewForm.watch("status")}
                  onValueChange={(v: any) => reviewForm.setValue("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Uploaded">Uploaded</SelectItem>
                    <SelectItem value="Viewed">Viewed</SelectItem>
                    <SelectItem value="Reviewed">Reviewed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label>Physio Notes</Label>
                <Textarea 
                   {...reviewForm.register("physio_notes")} 
                   placeholder="Enter clinical notes here..." 
                   className="h-32"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReviewOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={reviewMutation.isPending}>
                Save Notes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4 bg-muted/20 rounded-md overflow-auto max-h-[70vh]">
             {selectedReport?.file?.url && selectedReport.file.url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                 <img src={selectedReport.file.url} alt="Report Preview" className="max-w-full h-auto rounded shadow-sm" />
             ) : (
                 <div className="text-center py-8">
                     <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                     <p>Preview not available for this file type.</p>
                     <Button variant="link" onClick={() => window.open(selectedReport?.file?.url, '_blank')} className="mt-2">
                        Download to view
                     </Button>
                 </div>
             )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Report?"
        description={`This will permanently delete the report and remove the file from storage.`}
        loading={remove.isPending}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
      />
    </div>
  );
}
