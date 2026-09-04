import { Wrench } from "lucide-react";
import type { TherapyEquipment } from "@/types/models";
import { resourceServices } from "@/services/resources";
import type { ResourceConfig } from "@/components/resource/types";
import { Badge } from "@/components/ui/badge";
import { BoolCell, DateCell } from "./cells";

const CATEGORY_LABELS: Record<string, string> = {
  physiotherapy: "Physiotherapy",
  yoga_therapy: "Yoga Therapy",
  massage_therapy: "Massage Therapy",
  home_rehabilitation: "Home Rehabilitation",
};

export const therapyEquipmentConfig: ResourceConfig<TherapyEquipment> = {
  name: "Equipment",
  titlePlural: "Therapy Equipment",
  description:
    "Bookable equipment per service. Patients only see items matching the service they're booking — plus anything their therapist adds themselves.",
  icon: <Wrench />,
  service: resourceServices.therapyEquipment,
  queryKey: "therapy-equipment",
  permission: "therapy_equipment",
  defaultSort: "sort_order",
  formWidth: "lg",
  getRowTitle: (row) => row.name,
  filters: [
    {
      key: "category",
      label: "Service",
      options: [
        { label: "Physiotherapy", value: "physiotherapy" },
        { label: "Yoga Therapy", value: "yoga_therapy" },
        { label: "Massage Therapy", value: "massage_therapy" },
        { label: "Home Rehabilitation", value: "home_rehabilitation" },
      ],
    },
    {
      key: "owner_type",
      label: "Owner",
      options: [
        { label: "Platform", value: "platform" },
        { label: "Therapist's own", value: "therapist" },
      ],
    },
    {
      key: "is_active",
      label: "Status",
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },
  ],
  columns: [
    {
      header: "Equipment",
      cell: (r) => (
        <div className="min-w-0">
          <p className="font-medium">{r.name}</p>
          {r.description && (
            <p className="truncate text-xs text-muted-foreground">{r.description}</p>
          )}
        </div>
      ),
    },
    {
      header: "Service",
      cell: (r) => (
        <Badge variant="secondary">{CATEGORY_LABELS[r.category] ?? r.category}</Badge>
      ),
    },
    {
      header: "Charge",
      cell: (r) => (
        <span className="font-mono text-sm tabular-nums">₹{r.charge.toLocaleString("en-IN")}</span>
      ),
    },
    {
      header: "Owner",
      cell: (r) =>
        r.owner_type === "therapist" ? (
          <div className="text-xs">
            <Badge variant="outline">Therapist</Badge>
            <p className="mt-1 text-muted-foreground">{r.therapist_name ?? "—"}</p>
          </div>
        ) : (
          <Badge>Platform</Badge>
        ),
    },
    { header: "Active", cell: (r) => <BoolCell value={r.is_active} /> },
    { header: "Updated", cell: (r) => <DateCell value={r.updated_at} /> },
  ],
  fields: [
    {
      name: "name",
      label: "Equipment name",
      type: "text",
      required: true,
      placeholder: "e.g. Hot Stone Set",
      section: "Details",
      colSpan: 2,
    },
    {
      name: "category",
      label: "Service category",
      type: "select",
      required: true,
      options: [
        { label: "Physiotherapy", value: "physiotherapy" },
        { label: "Yoga Therapy", value: "yoga_therapy" },
        { label: "Massage Therapy", value: "massage_therapy" },
        { label: "Home Rehabilitation", value: "home_rehabilitation" },
      ],
      section: "Details",
    },
    {
      name: "charge",
      label: "Charge (₹ per session)",
      type: "number",
      required: true,
      section: "Details",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Shown to the patient under the equipment name",
      section: "Details",
      colSpan: 2,
    },
    {
      name: "sort_order",
      label: "Sort order",
      type: "number",
      defaultValue: 0,
      section: "Visibility",
    },
    {
      name: "is_active",
      label: "Available for booking",
      type: "switch",
      defaultValue: true,
      section: "Visibility",
    },
  ],
};
