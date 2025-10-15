import type { ComponentType, SVGProps } from "react";
import {
  BriefcaseBusiness,
  CalendarClock,
  FileText,
  Globe2,
  Images,
  Info,
  Layers3,
  Mail,
  MapPin,
  Megaphone,
  Navigation2,
  Users,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  description?: string;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    title: "Kontent",
    items: [
      { title: "About", href: "/about", icon: Info },
      { title: "News", href: "/news", icon: Megaphone },
      { title: "Gallery", href: "/gallery", icon: Images },
      { title: "Journal", href: "/journal", icon: FileText },
      { title: "Famous", href: "/famous", icon: Users },
    ],
  },
  {
    title: "Navigatsiya",
    items: [
      { title: "Nav Items", href: "/nav-items", icon: Navigation2 },
      { title: "Nav Item Products", href: "/nav-item-products", icon: Layers3 },
    ],
  },
  {
    title: "Joylashuvlar",
    items: [
      { title: "Locations", href: "/locations", icon: MapPin },
      { title: "Contacts", href: "/contacts", icon: Globe2 },
    ],
  },
  {
    title: "Appointmentlar",
    items: [
      { title: "Appointments", href: "/appointments", icon: CalendarClock },
      { title: "Services", href: "/appointment-services", icon: FileText },
      { title: "Clients", href: "/client-details", icon: Users },
    ],
  },
  {
    title: "Arizalar",
    items: [
      { title: "User Emails", href: "/user-emails", icon: Mail },
      { title: "Vacancies", href: "/vacancies", icon: BriefcaseBusiness },
      { title: "Job Requests", href: "/job-requests", icon: FileText },
    ],
  },
];
