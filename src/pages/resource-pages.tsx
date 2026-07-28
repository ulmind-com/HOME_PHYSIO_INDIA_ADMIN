import { ResourceView } from "@/components/resource/ResourceView";
import { servicesConfig } from "@/config/resources/services.config";
import { equipmentConfig } from "@/config/resources/equipment.config";
import { blogsConfig } from "@/config/resources/blogs.config";
import { careersConfig } from "@/config/resources/careers.config";
import {
  faqsConfig,
  testimonialsConfig,
  videosConfig,
} from "@/config/resources/content.config";

export const ServicesPage = () => <ResourceView config={servicesConfig} />;
export const EquipmentPage = () => <ResourceView config={equipmentConfig} />;
export const BlogsPage = () => <ResourceView config={blogsConfig} />;
export const CareersPage = () => <ResourceView config={careersConfig} />;
export const VideosPage = () => <ResourceView config={videosConfig} />;
export const TestimonialsPage = () => <ResourceView config={testimonialsConfig} />;
export const FaqPage = () => <ResourceView config={faqsConfig} />;
