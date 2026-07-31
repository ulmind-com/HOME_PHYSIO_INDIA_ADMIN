/** Domain model types mirroring the backend Beanie documents. */

export interface ImageAsset {
  url: string;
  public_id?: string | null;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  alt?: string | null;
}

export interface FileAsset {
  url: string;
  public_id?: string | null;
  resource_type?: string | null;
  format?: string | null;
  bytes?: number | null;
  original_filename?: string | null;
}

export interface SEOMeta {
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string[];
  canonical_url?: string | null;
  og_image?: string | null;
  schema_markup?: string | null;
}

export interface BaseDoc {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export type ContentStatus = "draft" | "published" | "archived";
export type BookingStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "in_progress"
  | "completed"
  | "cancelled";
export type RentalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "returned"
  | "cancelled";
export type ApplicationStatus =
  | "received"
  | "shortlisted"
  | "interview"
  | "rejected"
  | "hired";
export type ContactStatus = "new" | "read" | "replied" | "closed";

export interface User extends BaseDoc {
  name: string;
  email: string;
  phone?: string | null;
  avatar?: ImageAsset | null;
  role: string;
  extra_permissions: string[];
  is_active: boolean;
  is_superuser: boolean;
  last_login_at?: string | null;
}

export interface Role extends BaseDoc {
  slug: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
}

export interface Category extends BaseDoc {
  name: string;
  slug: string;
  description: string;
  icon?: string | null;
  image?: ImageAsset | null;
  order: number;
  is_active: boolean;
}

export interface Service extends BaseDoc {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category_id?: string | null;
  category_name?: string | null;
  icon?: string | null;
  featured_image?: ImageAsset | null;
  gallery: ImageAsset[];
  price?: number | null;
  price_unit?: string | null;
  features: string[];
  seo: SEOMeta;
  is_featured: boolean;
  order: number;
  status: ContentStatus;
}

export interface Booking extends BaseDoc {
  reference: string;
  patient_name: string;
  patient_age?: number | null;
  patient_gender?: string | null;
  contact_phone: string;
  contact_email?: string | null;
  service_id?: string | null;
  service_name: string;
  preferred_date: string;
  preferred_time?: string | null;
  address: string;
  city?: string | null;
  pincode?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  status: BookingStatus;
  assigned_staff_id?: string | null;
  assigned_staff_name?: string | null;
  admin_notes?: string | null;
  message?: string | null;
}

export interface Equipment extends BaseDoc {
  name: string;
  slug: string;
  short_description: string;
  description: string;
  category_id?: string | null;
  category_name?: string | null;
  featured_image?: ImageAsset | null;
  gallery: ImageAsset[];
  rental_price?: number | null;
  rental_unit: string;
  security_deposit?: number | null;
  min_rental_duration?: number | null;
  max_rental_duration?: number | null;
  specifications: Record<string, string>;
  stock: number;
  is_available: boolean;
  seo: SEOMeta;
  is_featured: boolean;
  order: number;
  status: ContentStatus;
}

export interface EquipmentRental extends BaseDoc {
  reference: string;
  equipment_id: string;
  equipment_name: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  address: string;
  start_date: string;
  end_date?: string | null;
  quantity: number;
  duration_days?: number | null;
  total_amount?: number | null;
  status: RentalStatus;
  admin_notes?: string | null;
}

export interface CareerJob extends BaseDoc {
  title: string;
  slug: string;
  category_id?: string | null;
  category_name?: string | null;
  description: string;
  responsibilities: string[];
  requirements: string[];
  location?: string | null;
  job_type: string;
  experience?: string | null;
  salary_range?: string | null;
  vacancies: number;
  seo: SEOMeta;
  is_featured: boolean;
  order: number;
  status: ContentStatus;
}

export interface JobApplication extends BaseDoc {
  reference: string;
  job_id?: string | null;
  job_title: string;
  full_name: string;
  email: string;
  phone: string;
  experience?: string | null;
  cover_letter?: string | null;
  resume?: FileAsset | null;
  status: ApplicationStatus;
  admin_notes?: string | null;
}

export interface Blog extends BaseDoc {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category_id?: string | null;
  category_name?: string | null;
  tags: string[];
  featured_image?: ImageAsset | null;
  author_name?: string | null;
  seo: SEOMeta;
  is_featured: boolean;
  views: number;
  published_at?: string | null;
  status: ContentStatus;
}

export interface Video extends BaseDoc {
  title: string;
  slug: string;
  description: string;
  category?: string | null;
  source: "youtube" | "cloudinary";
  youtube_url?: string | null;
  video_file?: FileAsset | null;
  thumbnail?: ImageAsset | null;
  is_featured: boolean;
  order: number;
  is_active: boolean;
}

export interface Testimonial extends BaseDoc {
  patient_name: string;
  designation?: string | null;
  photo?: ImageAsset | null;
  message: string;
  rating: number;
  is_featured: boolean;
  order: number;
  is_active: boolean;
}

export interface FAQ extends BaseDoc {
  question: string;
  answer: string;
  category?: string | null;
  order: number;
  is_active: boolean;
}

export interface ContactMessage extends BaseDoc {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: ContactStatus;
  admin_notes?: string | null;
}

export interface WorkingHour {
  day: string;
  open_time?: string | null;
  close_time?: string | null;
  is_closed: boolean;
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface ServicesHero {
  title?: string | null;
  subtitle?: string | null;
  background_image?: ImageAsset | null;
  stats?: HeroStat[];
}

export interface HomeHeroStat {
  value: number;
  suffix: string;
  label: string;
}

export interface HomeHero {
  trust_badge_text?: string | null;
  trust_badge_quote?: string | null;
  trust_badge_avatars?: ImageAsset[];
  slider_images?: ImageAsset[];
  stats?: HomeHeroStat[];
}

export interface ValueItem {
  title: string;
  body: string;
}

export interface TeamTile {
  image?: string | null;
  count: string;
  title: string;
  desc: string;
}

export interface CareTeamSlideStat {
  value: string;
  label: string;
}

export interface CareTeamSlide {
  image?: string | null;
  eyebrow: string;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
  stats: CareTeamSlideStat[];
}

export interface WhyChooseItem {
  title: string;
  detail: string;
}

export interface LegalSection {
  title: string;
  body: string;
}

export interface WebsiteSettings extends BaseDoc {
  website_name: string;
  tagline?: string | null;
  logo?: ImageAsset | null;
  favicon?: ImageAsset | null;
  theme_primary?: string | null;
  theme_accent?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  google_map_embed?: string | null;
  google_reviews_link?: string | null;
  working_hours: WorkingHour[];
  services_hero?: ServicesHero | null;
  home_hero?: HomeHero | null;

  // Home page hero
  hero_headline?: string | null;
  hero_subtitle?: string | null;
  hero_description?: string | null;
  hero_image?: ImageAsset | null;
  hero_stats?: HeroStat[];

  // About page
  about_hero_badge?: string | null;
  about_hero_title?: string | null;
  about_hero_description?: string | null;
  about_hero_image?: ImageAsset | null;
  about_hero_stats?: HeroStat[];
  about_story_title?: string | null;
  about_story_text?: string | null;
  about_stats?: HeroStat[];
  about_values?: ValueItem[];
  about_commitments?: string[];
  about_welcome_title?: string | null;
  about_welcome_description?: string | null;
  about_welcome_image?: ImageAsset | null;

  // Content sections
  how_it_works_steps?: ValueItem[];
  team_tiles?: TeamTile[];
  care_team_slides?: CareTeamSlide[];
  trust_bar_items?: string[];
  why_choose_items?: WhyChooseItem[];
  conditions_list?: string[];

  // Footer
  footer_tagline?: string | null;
  footer_description?: string | null;
  footer_image?: string | null;

  // CTA
  cta_title?: string | null;
  cta_description?: string | null;

  // Legal pages
  privacy_sections?: LegalSection[];
  terms_sections?: LegalSection[];
  refund_sections?: LegalSection[];
}

export interface SocialLinks extends BaseDoc {
  facebook?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  youtube?: string | null;
  twitter?: string | null;
  whatsapp?: string | null;
}

export interface SEOSettings extends BaseDoc {
  page_key: string;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords: string[];
  canonical_url?: string | null;
  og_image?: string | null;
  schema_markup?: string | null;
}

export interface NotificationItem extends BaseDoc {
  user_id?: string | null;
  type: "booking" | "contact" | "application" | "rental" | "system";
  title: string;
  message: string;
  link?: string | null;
  reference_id?: string | null;
  is_read: boolean;
  read_at?: string | null;
}

export interface ActivityLog extends BaseDoc {
  user_id?: string | null;
  user_email?: string | null;
  action: string;
  entity: string;
  entity_id?: string | null;
  description: string;
  metadata: Record<string, unknown>;
  ip_address?: string | null;
}

export interface DashboardStats {
  bookings: { total: number; pending: number; approved: number; completed: number };
  services: number;
  equipment: number;
  rentals: number;
  applications: number;
  new_contacts: number;
  blogs: number;
  revenue: { currency: string; total: number; note: string };
}

export interface DashboardCharts {
  booking_status: Record<string, number>;
  bookings_trend: { date: string; count: number }[];
}
