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

export interface TherapistDocument {
  id: string;
  title: string;
  file: FileAsset;
  is_verified: boolean;
  uploaded_at: string;
  verified_at?: string | null;
}

export interface User extends BaseDoc {
  name: string;
  email: string;
  phone?: string | null;
  avatar?: ImageAsset | null;
  role: string;
  user_type?: string;
  extra_permissions: string[];
  is_active: boolean;
  is_superuser: boolean;
  last_login_at?: string | null;
  documents?: TherapistDocument[];
  age?: number | null;
  gender?: string | null;
  pincode?: string | null;
  medical_condition?: string | null;
  specialization?: string | null;
  experience_years?: number | null;
  qualification?: string | null;
  therapist_tier?: string | null;
  verification_status?: "pending" | "approved" | "rejected";
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
  hero_badge?: string | null;
  hero_title?: string | null;
  hero_description?: string | null;
  hero_cta_primary_text?: string | null;
  hero_cta_secondary_text?: string | null;
  hero_image?: ImageAsset | null;
  hero_images?: ImageAsset[];
  hero_images_mobile?: ImageAsset[];
  hero_stats?: HeroStat[];
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
  whatsapp_number?: string | null;
  service_id?: string | null;
  service_name: string;
  care_required?: string | null;
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

export type ServiceCategory = "physiotherapy" | "yoga_therapy" | "massage_therapy" | "home_rehabilitation";
export type FrequencyType = "daily" | "weekly" | "package";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface TherapyBooking extends BaseDoc {
  reference: string;
  patient_id?: string | null;
  patient_name: string;
  patient_age?: number | null;
  patient_gender?: string | null;
  contact_phone: string;
  contact_email?: string | null;
  address: string;
  city?: string | null;
  pincode?: string | null;
  service_category: ServiceCategory;
  condition_notes?: string | null;
  preferred_date: string;
  shift: string;
  time_slot: string;
  session_duration_minutes: number;
  frequency_type?: FrequencyType | null;
  daily_visits_per_day?: number | null;
  weekly_days_count?: number | null;
  package_duration?: string | null;
  package_custom_months?: number | null;
  equipment: string[];
  massage_type?: string | null;
  massage_duration_minutes?: number | null;
  visit_fee: number;
  machine_charge: number;
  total_amount: number;
  platform_fee_percent: number;
  platform_fee_amount: number;
  therapist_payout: number;
  payment_status: PaymentStatus;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  amount_paid: number;
  cancellation_reason?: string | null;
  cancelled_by?: string | null;
  refund_amount: number;
  razorpay_refund_id?: string | null;
  refunded_at?: string | null;
  status: BookingStatus;
  assigned_staff_id?: string | null;
  assigned_staff_name?: string | null;
  admin_notes?: string | null;
}

export interface PricingSettings extends BaseDoc {
  daily_visit_fee_1: number;
  daily_visit_fee_2: number;
  daily_visit_fee_3: number;
  flat_visit_fee: number;
  machine_charge_per_unit: number;
  massage_normal_oil_fee: number;
  massage_dry_fee: number;
  massage_deep_tissue_fee: number;
  massage_overtime_surcharge: number;
  massage_standard_max_minutes: number;
  platform_fee_physiotherapy_percent: number;
  platform_fee_yoga_therapy_percent: number;
  platform_fee_home_rehabilitation_percent: number;
  platform_fee_massage_therapy_percent: number;
  cancellation_full_refund_window_hours: number;
  cancellation_late_refund_percent: number;
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
  preferred_location?: string | null;
  qualification?: string | null;
  preferred_duty?: string | null;
  previous_employer?: string | null;
  relevant_skills?: string | null;
  certificates?: string | null;
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

export interface StaffMember extends BaseDoc {
  name: string;
  photo?: ImageAsset | null;
  category: string;
  rating: number;
  service_label: string;
  price_7_days?: number | null;
  price_15_days?: number | null;
  price_30_days?: number | null;
  experience?: string | null;
  bio?: string | null;
  is_featured: boolean;
  is_active: boolean;
  order: number;
}

export interface ContactMessage extends BaseDoc {
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  service_required?: string | null;
  patient_location?: string | null;
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

export interface FounderCard {
  name: string;
  role: string;
  image?: ImageAsset | null;
  description: string;
  address?: string | null;
}

export interface HeroSlide {
  title?: string | null;
  subtitle?: string | null;
  button_text?: string | null;
  button_link?: string | null;
  image_desktop?: ImageAsset | null;
  image_mobile?: ImageAsset | null;
  order: number;
}

export interface ServicesHero {
  title?: string | null;
  subtitle?: string | null;
  background_image?: ImageAsset | null;
  stats?: HeroStat[];
  slides?: HeroSlide[];
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
  slider_images_mobile?: ImageAsset[];
  stats?: HomeHeroStat[];
}

export interface CommitmentItem {
  icon: string;
  text: string;
}

export interface ComprehensiveServiceCard {
  id?: string | null;
  title: string;
  image?: ImageAsset | string | null;
  features: string[];
  button_text: string;
  button_link?: string | null;
  select_label: string;
  form_options: string[];
  order: number;
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

export interface HomeAboutFeature {
  title?: string | null;
  description?: string | null;
  icon?: string | null;
  icon_image?: string | ImageAsset | null;
}

export interface HomeAboutTile {
  image?: string | ImageAsset | null;
  count?: string | null;
  title?: string | null;
  description?: string | null;
  cta_label?: string | null;
  cta_link?: string | null;
}

export interface LegalSection {
  title: string;
  body: string;
}

export interface BookingFormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "radio" | "date" | "time" | "number";
  placeholder?: string | null;
  required: boolean;
  options: string[];
  col_span: number;
  order: number;
}

export interface BookingFormStep {
  key: string;
  label: string;
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  fields: BookingFormField[];
  order: number;
}

export interface BookingFormConfig {
  steps: BookingFormStep[];
  cities: string[];
  service_care_hints: Record<string, string>;
}

export interface WebsiteSettings extends BaseDoc {
  website_name: string;
  tagline?: string | null;
  logo?: ImageAsset | null;
  favicon?: ImageAsset | null;
  theme_primary?: string | null;
  theme_accent?: string | null;
  font_family?: string | null;
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
  hero_cta_primary_text?: string | null;
  hero_cta_secondary_text?: string | null;
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
  commitment_items?: CommitmentItem[];
  commitment_image?: ImageAsset | null;
  about_founders?: FounderCard[];
  about_address_name?: string | null;
  about_address_line1?: string | null;
  about_address_line2?: string | null;
  about_map_embed_url?: string | null;
  why_choose_eyebrow?: string | null;
  why_choose_title?: string | null;
  why_choose_description?: string | null;
  commitment_subtitle?: string | null;
  commitment_badge_value?: string | null;
  commitment_badge_label?: string | null;
  about_welcome_title?: string | null;
  about_welcome_description?: string | null;
  about_welcome_image?: ImageAsset | null;

  // Home About section
  home_about_heading?: string | null;
  home_about_description?: string | null;
  home_about_features?: HomeAboutFeature[];
  home_about_tiles?: HomeAboutTile[];

  videos_wall_image?: ImageAsset | null;

  how_it_works_steps?: ValueItem[];
  team_tiles?: TeamTile[];
  care_team_slides?: CareTeamSlide[];
  trust_bar_items?: string[];
  why_choose_items?: WhyChooseItem[];
  conditions_list?: string[];

  // Comprehensive Services
  comprehensive_services_eyebrow?: string | null;
  comprehensive_services_title?: string | null;
  comprehensive_services_description?: string | null;
  comprehensive_services?: ComprehensiveServiceCard[];

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

  // Booking form config
  booking_form_config?: BookingFormConfig | null;
}

export interface SocialLinks extends BaseDoc {
  facebook?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  youtube?: string | null;
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

export interface UserType extends BaseDoc {
  name: string;
  slug: string;
  description: string;
  is_core: boolean;
}

export type ReportType = "Prescription" | "X-Ray" | "MRI" | "Medical Report";
export type ReportStatus = "Uploaded" | "Viewed" | "Reviewed";

export interface MedicalReport extends BaseDoc {
  patient_id: string;
  title: string;
  report_type: ReportType;
  file: FileAsset | ImageAsset;
  status: ReportStatus;
  physio_notes: string;
  reviewed_by_id?: string | null;
}

export type EarningStatus = "pending" | "settled" | "reversed";

export interface TherapistEarning extends BaseDoc {
  therapist_id: string;
  therapist_name: string;
  booking_id: string;
  booking_reference: string;
  service_name: string;
  amount: number;
  status: EarningStatus;
  payout_id?: string | null;
  reversed_at?: string | null;
  settled_at?: string | null;
  admin_notes?: string | null;
}

export type PayoutStatus = "pending" | "paid" | "failed";

export interface TherapistPayout extends BaseDoc {
  therapist_id: string;
  therapist_name: string;
  period_start: string;
  period_end: string;
  total_amount: number;
  earning_ids: string[];
  status: PayoutStatus;
  payment_method?: string | null;
  transaction_reference?: string | null;
  paid_at?: string | null;
  admin_id: string;
  admin_name: string;
  admin_notes?: string | null;
}
