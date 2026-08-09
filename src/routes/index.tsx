import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import {
  CategoriesPage,
  ServicesPage,
  EquipmentPage,
  BlogsPage,
  CareersPage,
  VideosPage,
  TestimonialsPage,
  FaqPage,
} from "@/pages/resource-pages";
import { BookingsPage } from "@/pages/bookings/BookingsPage";
import { PhysioRequestsPage } from "@/pages/physio/PhysioRequestsPage";
import { RentalsPage } from "@/pages/RentalsPage";
import { ApplicationsPage } from "@/pages/ApplicationsPage";
import { ContactPage } from "@/pages/ContactPage";
import { MediaLibraryPage } from "@/pages/MediaLibraryPage";
import { SeoPage } from "@/pages/SeoPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { UsersPage } from "@/pages/UsersPage";
import { RolesPage } from "@/pages/RolesPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { ActivityLogsPage } from "@/pages/ActivityLogsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { NotFoundPage } from "@/pages/ErrorPages";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/physio" element={<PhysioRequestsPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="/rentals" element={<RentalsPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/applications" element={<ApplicationsPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/videos" element={<VideosPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/faqs" element={<FaqPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/media" element={<MediaLibraryPage />} />
          <Route path="/seo" element={<SeoPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/activity" element={<ActivityLogsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
