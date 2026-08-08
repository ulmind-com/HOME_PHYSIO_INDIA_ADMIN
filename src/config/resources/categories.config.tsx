import { FolderTree } from "lucide-react";
import type { Category } from "@/types/models";
import { resourceServices } from "@/services/resources";
import type { ResourceConfig } from "@/components/resource/types";
import { DateCell, MediaCell, StatusCell } from "./cells";

export const categoriesConfig: ResourceConfig<Category> = {
  name: "Category",
  titlePlural: "Categories",
  description: "Manage the top-level service categories displayed on the website.",
  icon: <FolderTree />,
  service: resourceServices.serviceCategories,
  queryKey: "categories",
  permission: "categories",
  defaultSort: "order",
  formWidth: "lg",
  searchPlaceholder: "Search categories…",
  getRowTitle: (row) => row.name,
  filters: [
    {
      key: "is_active",
      label: "Active Status",
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },
  ],
  columns: [
    {
      header: "Category",
      cell: (r) => (
        <MediaCell
          image={r.image}
          title={r.name}
          subtitle={r.description}
        />
      ),
    },
    {
      header: "Status",
      cell: (r) => <StatusCell value={r.is_active ? "published" : "draft"} />,
    },
    { header: "Order", cell: (r) => <div className="text-muted-foreground">{r.order}</div> },
    { header: "Updated", cell: (r) => <DateCell value={r.updated_at} /> },
  ],
  fields: [
    { name: "name", label: "Name", type: "text", required: true, placeholder: "e.g. Elder Care" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Short description of the category" },
    { name: "image", label: "Image", type: "image", folder: "nupun/categories" },
    { name: "hero_image", label: "Hero Banner", type: "image", folder: "nupun/categories/hero" },
    { name: "order", label: "Display order", type: "number", defaultValue: 0 },
    { name: "is_active", label: "Is Active", type: "switch", defaultValue: true },
  ],
};
