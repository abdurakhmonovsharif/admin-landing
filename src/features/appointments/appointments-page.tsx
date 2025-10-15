"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { ResourceHeader } from "@/components/resource/resource-header";
import { DataTable } from "@/components/data-table/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ResourceFormFields } from "@/features/generic-crud/resource-form-fields";
import type { FieldDescriptor } from "@/features/generic-crud/types";
import { appointmentFormSchema, type AppointmentFormValues } from "./schema";
import { AppointmentControllerService } from "@/lib/api/client";
import type { Appointment } from "@/lib/api/models/Appointment";
import type { AppointmentService } from "@/lib/api/models/AppointmentService";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatDateTime } from "@/lib/formatters";
import { localTimeToString } from "@/lib/time";
import { Badge } from "@/components/ui/badge";
import { EditorUploadsContext, useEditorUploadRegistry } from "@/contexts/editor-uploads-context";
import Link from "next/link";
import { ExternalLink, MoreVertical, Pencil, Trash } from "lucide-react";

export function AppointmentsPage() {
  const queryClient = useQueryClient();
  const queryKey = ["appointments"];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => AppointmentControllerService.list12(),
  });

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Appointment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
  const [servicesDrawer, setServicesDrawer] = useState<Appointment | null>(null);

  const servicesQuery = useQuery({
    queryKey: ["appointment", servicesDrawer?.id],
    queryFn: async () => {
      if (!servicesDrawer?.id) return null;
      return AppointmentControllerService.get12({ id: servicesDrawer.id });
    },
    enabled: !!servicesDrawer?.id,
  });

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      type: "personality",
      titleUz: "",
      titleRu: "",
      titleEn: "",
    },
  });

  const editorUploads = useEditorUploadRegistry();

  const resetForm = useCallback(
    (record?: Appointment | null) => {
      form.reset({
        type: record?.type ?? "personality",
        titleUz: record?.titleUz ?? "",
        titleRu: record?.titleRu ?? "",
        titleEn: record?.titleEn ?? "",
      });
    },
    [form]
  );

  const openCreate = () => {
    setEditingRecord(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = useCallback(
    (record: Appointment) => {
      setEditingRecord(record);
      resetForm(record);
      setDialogOpen(true);
    },
    [resetForm]
  );

  const finalizeClose = useCallback(() => {
    setEditingRecord(null);
    resetForm();
  }, [resetForm]);

  const handleCancel = useCallback(
    async (options?: { keepDialogState?: boolean }) => {
      if (!options?.keepDialogState) {
        setDialogOpen(false);
      }
      await editorUploads.discardAll();
      finalizeClose();
    },
    [editorUploads, finalizeClose]
  );

  const handleCloseAfterCommit = useCallback(() => {
    setDialogOpen(false);
    finalizeClose();
  }, [finalizeClose]);

  const mutation = useMutation({
    mutationFn: async (values: AppointmentFormValues) => {
      const payload: Appointment = {
        type: values.type,
        titleUz: values.titleUz,
        titleRu: values.titleRu || undefined,
        titleEn: values.titleEn || undefined,
      };
      if (editingRecord?.id) {
        await AppointmentControllerService.update12({ id: editingRecord.id, requestBody: payload });
        return "Yangilandi";
      }
      await AppointmentControllerService.create12({ requestBody: payload });
      return "Yaratildi";
    },
    onSuccess: (message) => {
      toast.success(`Appointment ${message}`);
      queryClient.invalidateQueries({ queryKey });
      editorUploads.commitAll();
      handleCloseAfterCommit();
    },
    onError: (error: unknown) => {
      toast.error("Saqlashda xatolik", {
        description: error instanceof Error ? error.message : String(error),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await AppointmentControllerService.delete12({ id });
    },
    onSuccess: () => {
      toast.success("Appointment o‘chirildi");
      queryClient.invalidateQueries({ queryKey });
      setDeleteTarget(null);
    },
    onError: (error: unknown) => {
      toast.error("O‘chirishda xatolik", {
        description: error instanceof Error ? error.message : String(error),
      });
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
  });

  const fields: FieldDescriptor[] = [
    {
      type: "select",
      name: "type",
      label: "Appointment turi",
      options: [
        { label: "Personality", value: "personality" },
        { label: "Store", value: "store" },
      ],
      placeholder: "Tanlang",
    },
    { type: "multilingual", baseName: "title", label: "Sarlavha", required: true },
  ];

  const columns = useMemo<ColumnDef<Appointment>[]>(() => [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "titleUz", header: "Sarlavha (UZ)" },
    {
      accessorKey: "type",
      header: "Turi",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Yaratildi",
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
  ], []);

  const columnsWithActions = useMemo<ColumnDef<Appointment>[]>(() => [
    ...columns,
    {
      id: "actions",
      header: "Amallar",
      cell: ({ row }) => {
        const record = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setServicesDrawer(record)}>
                Xizmatlar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEdit(record)}>
                <Pencil className="mr-2 h-4 w-4" /> Tahrirlash
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteTarget(record)}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" /> O‘chirish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [columns, openEdit]);

  return (
    <div className="space-y-6">
      <ResourceHeader
        title="Appointments"
        description="Murakkab appointment sozlamalari va xizmatlar."
        onCreate={openCreate}
        createLabel="Appointment qo‘shish"
      />

      <DataTable<Appointment>
        columns={columnsWithActions}
        data={data ?? []}
        isLoading={isLoading}
        searchPlaceholder="Appointment qidirish"
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
            void handleCancel({ keepDialogState: true });
          } else {
            setDialogOpen(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Appointment tahriri" : "Yangi appointment"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              <EditorUploadsContext.Provider value={editorUploads.value}>
                <ResourceFormFields fields={fields} />
              </EditorUploadsContext.Provider>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleCancel()}
                >
                  Bekor qilish
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Appointmentni o‘chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Ushbu appointment va bog‘langan ma’lumotlar o‘chiriladi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget?.id && deleteMutation.mutate(deleteTarget.id)}
            >
              Tasdiqlash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={!!servicesDrawer} onOpenChange={(open) => !open && setServicesDrawer(null)}>
        <SheetContent className="w-full max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {servicesDrawer ? `${servicesDrawer.titleUz ?? "Services"}` : "Services"}
            </SheetTitle>
          </SheetHeader>
          {servicesQuery.isLoading ? (
            <p className="py-6 text-sm text-muted-foreground">Xizmatlar yuklanmoqda...</p>
          ) : servicesQuery.data?.services && servicesQuery.data.services.length > 0 ? (
            <div className="space-y-4 py-4">
              {servicesQuery.data.services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <p className="py-6 text-sm text-muted-foreground">Hozircha xizmatlar yo‘q.</p>
          )}
          {servicesDrawer?.id ? (
            <div className="border-t pt-4">
              <Button asChild variant="outline">
                <Link href={`/appointment-services?appointmentId=${servicesDrawer.id}`}>
                  Xizmatlarni boshqarish <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ServiceCard({ service }: { service: AppointmentService }) {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold">{service.titleUz ?? "Xizmat"}</p>
          <p className="text-sm text-muted-foreground">{service.descriptionUz ?? ""}</p>
        </div>
        <Badge variant="secondary">{service.date ?? "T/s"}</Badge>
      </div>
      <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
        <p>Vaqt: {localTimeToString(service.time)}</p>
        <p>Joy: {service.location?.nameUz ?? "—"}</p>
        <p>Mijoz: {service.client?.firstname ?? "—"}</p>
      </div>
      {service.client ? (
        <div className="mt-3 text-sm">
          <Link
            href={`/client-details?serviceId=${service.id}`}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Mijoz tafsiloti <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
