import {
  LayoutDashboard,
  Stethoscope,
  CalendarCheck,
  Package,
  ClipboardList,
  Briefcase,
  FileUser,
  Newspaper,
  Video,
  Quote,
  HelpCircle,
  Mail,
  Search,
  Images,
  Settings,
  Users,
  ShieldCheck,
  Bell,
  ScrollText,
  UserCircle,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  permission?: string;
  badgeKey?: "notifications";
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", to: "/", icon: LayoutDashboard, permission: "dashboard:view" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Bookings", to: "/bookings", icon: CalendarCheck, permission: "bookings:view" },
      { label: "Rental Requests", to: "/rentals", icon: ClipboardList, permission: "rentals:view" },
      { label: "Job Applications", to: "/applications", icon: FileUser, permission: "applications:view" },
      { label: "Contact Messages", to: "/contact", icon: Mail, permission: "contacts:view" },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { label: "Services", to: "/services", icon: Stethoscope, permission: "services:view" },
      { label: "Medical Equipment", to: "/equipment", icon: Package, permission: "equipment:view" },
      { label: "Careers", to: "/careers", icon: Briefcase, permission: "careers:view" },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Blogs", to: "/blogs", icon: Newspaper, permission: "blogs:view" },
      { label: "Videos", to: "/videos", icon: Video, permission: "videos:view" },
      { label: "Testimonials", to: "/testimonials", icon: Quote, permission: "testimonials:view" },
      { label: "FAQ", to: "/faqs", icon: HelpCircle, permission: "faqs:view" },
      { label: "Media Library", to: "/media", icon: Images, permission: "media:view" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "SEO", to: "/seo", icon: Search, permission: "seo:view" },
      { label: "Website Settings", to: "/settings", icon: Settings, permission: "settings:view" },
      { label: "Users", to: "/users", icon: Users, permission: "users:view" },
      { label: "Roles", to: "/roles", icon: ShieldCheck, permission: "roles:view" },
      { label: "Notifications", to: "/notifications", icon: Bell, badgeKey: "notifications" },
      { label: "Activity Logs", to: "/activity", icon: ScrollText, permission: "activity_logs:view" },
      { label: "Profile", to: "/profile", icon: UserCircle },
    ],
  },
];
