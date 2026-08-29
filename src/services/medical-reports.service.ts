import { createCrudService } from "./crud.factory";
import { endpoints } from "./api/endpoints";
import { http } from "./api/http";
import type { MedicalReport, ReportStatus } from "@/types/models";

const baseService = createCrudService<MedicalReport>(endpoints.medicalReports.root);

export const medicalReportsService = {
  ...baseService,
  
  // Custom upload method (multipart/form-data)
  upload: async (data: { title: string; report_type: string; patient_id: string; file: File }) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("report_type", data.report_type);
    formData.append("patient_id", data.patient_id);
    formData.append("file", data.file);
    
    return http.post<MedicalReport>(endpoints.medicalReports.root, formData);
  },
  
  // Custom update method for file replacements (multipart/form-data)
  updateWithFile: async (id: string, data: { title?: string; report_type?: string; file?: File }) => {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.report_type) formData.append("report_type", data.report_type);
    if (data.file) formData.append("file", data.file);
    
    return http.put<MedicalReport>(endpoints.medicalReports.report(id), formData);
  },
  
  // Custom review method
  review: async (id: string, data: { status?: ReportStatus; physio_notes?: string }) => {
    return http.patch<MedicalReport>(endpoints.medicalReports.review(id), data);
  }
};
