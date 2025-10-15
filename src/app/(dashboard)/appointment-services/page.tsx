import { Suspense } from "react";
import { AppointmentServicesPage } from "@/features/appointment-services/appointment-services-page";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Maʼlumotlar yuklanmoqda...</div>}>
      <AppointmentServicesPage />
    </Suspense>
  );
}
