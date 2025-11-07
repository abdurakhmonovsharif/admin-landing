"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { ResourceHeader } from "@/components/resource/resource-header";
import { DataTable } from "@/components/data-table/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { appointmentServiceFormSchema, type AppointmentServiceFormValues } from "./schema";
import { AppointmentServiceControllerService, AppointmentControllerService, LocationControllerService } from "@/lib/api/client";
import type { AppointmentService } from "@/lib/api/models/AppointmentService";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ResourceFormFields } from "@/features/generic-crud/resource-form-fields";
import type { FieldDescriptor } from "@/features/generic-crud/types";
import { SearchableSelect } from "@/components/forms/searchable-select";
import { Input } from "@/components/ui/input";
import { formatDate, formatDateTime } from "@/lib/formatters";
import { localTimeToString, stringToLocalTime } from "@/lib/time";
import Link from "next/link";
import { ExternalLink, MoreVertical, Pencil, Trash } from "lucide-react";
import { EditorUploadsContext, useEditorUploadRegistry } from "@/contexts/editor-uploads-context";

export function AppointmentServicesPage() {
  const queryClient = useQueryClient();
  const params = useSearchParams();
  const appointmentFilter = params.get("appointmentId");

  const queryKey = ["appointment-services"];
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => AppointmentServiceControllerService.list13(),
  });

  const { data: appointments } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => AppointmentControllerService.list12(),
  });

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: () => LocationControllerService.list5(),
  });

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AppointmentService | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppointmentService | null>(null);

  const resolver = useMemo(
    () => zodResolver(appointmentServiceFormSchema) as Resolver<AppointmentServiceFormValues>,
    []
  );

  const form = useForm<AppointmentServiceFormValues>({
    resolver,
    defaultValues: {
      appointmentId: appointmentFilter ? Number(appointmentFilter) : 0,
      locationId: 0,
      titleUz: "",
      titleRu: "",
      titleEn: "",
      descriptionUz: "",
      descriptionRu: "",
      descriptionEn: "",
      date: "",
      time: "",
    },
  });

  const editorUploads = useEditorUploadRegistry();

  useEffect(() => {
    if (appointmentFilter) {
      form.setValue("appointmentId", Number(appointmentFilter), { shouldDirty: false });
    }
  }, [appointmentFilter, form]);

  const resetForm = useCallback(
    (record?: AppointmentService | null) => {
      form.reset({
      appointmentId: record?.appointment?.id ?? (appointmentFilter ? Number(appointmentFilter) : 0),
      locationId: record?.location?.id ?? 0,
        titleUz: record?.titleUz ?? "",
        titleRu: record?.titleRu ?? "",
        titleEn: record?.titleEn ?? "",
        descriptionUz: record?.descriptionUz ?? "",
        descriptionRu: record?.descriptionRu ?? "",
        descriptionEn: record?.descriptionEn ?? "",
        date: record?.date ?? "",
        time: localTimeToString(record?.time) ?? "",
      });
    },
    [appointmentFilter, form]
  );

  const openCreate = () => {
    setEditingRecord(null);
    resetForm(null);
    setDialogOpen(true);
  };

  const openEdit = useCallback((record: AppointmentService) => {
    setEditingRecord(record);
    resetForm(record);
    setDialogOpen(true);
  }, [resetForm]);

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
    mutationFn: async (values: AppointmentServiceFormValues) => {
      const payload: AppointmentService = {
        appointment: { id: values.appointmentId },
        location: { id: values.locationId },
        titleUz: values.titleUz,
        titleRu: values.titleRu || undefined,
        titleEn: values.titleEn || undefined,
        descriptionUz: values.descriptionUz || undefined,
        descriptionRu: values.descriptionRu || undefined,
        descriptionEn: values.descriptionEn || undefined,
        date: values.date,
        time: stringToLocalTime(values.time),
      };
      if (editingRecord?.id) {
        await AppointmentServiceControllerService.update13({ id: editingRecord.id, requestBody: payload });
        return "Yangilandi";
      }
      await AppointmentServiceControllerService.create13({ requestBody: payload });
      return "Yaratildi";
    },
    onSuccess: (message) => {
      toast.success(`Appointment service ${message}`);
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
      await AppointmentServiceControllerService.delete13({ id });
    },
    onSuccess: () => {
      toast.success("Xizmat o‘chirildi");
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

  const multiFields: FieldDescriptor[] = [
    { type: "multilingual", baseName: "title", label: "Sarlavha", required: true },
    { type: "multilingual", baseName: "description", label: "Tavsif", kind: "textarea" },
  ];

  const appointmentOptions = (appointments ?? []).map((appointment) => ({
    value: String(appointment.id),
    label: appointment.titleUz ?? `Appointment #${appointment.id}`,
    description: appointment.type,
  }));

  const locationOptions = (locations ?? []).map((location) => ({
    value: String(location.id),
    label: location.nameUz ?? `Location #${location.id}`,
    description: location.address,
  }));

  const filteredData = useMemo(() => {
    if (!appointmentFilter) return data ?? [];
    return (data ?? []).filter((service) => service.appointment?.id === Number(appointmentFilter));
  }, [data, appointmentFilter]);

  const columns = useMemo<ColumnDef<AppointmentService>[]>(() => [
    { accessorKey: "id", header: "ID" },
    {
      accessorKey: "appointment",
      header: "Appointment",
      cell: ({ row }) => {
        
        return row.original?.titleUz ?? "—"
      },
    },
    {
      accessorKey: "location",
      header: "Joy",
      cell: ({ row }) => row.original.location?.nameUz ?? "—",
    },
    {
      accessorKey: "client",
      header: "Mijoz",
      cell: ({ row }) => {
        const client = row.original.client;
        if (!client) return "—";
        return (
          <Link
            href={`/client-details?serviceId=${row.original.id}`}
            className="flex items-center gap-1 text-primary hover:underline"
          >
            <span>{client.firstname ?? client.email ?? "Client"}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        );
      },
    },
    { accessorKey: "date", header: "Sana", cell: ({ row }) => formatDate(row.original.date) },
    {
      accessorKey: "time",
      header: "Vaqt",
      cell: ({ row }) => localTimeToString(row.original.time),
    },
    {
      accessorKey: "createdAt",
      header: "Yaratildi",
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
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
  ], [openEdit]);

  return (
    <div className="space-y-6">
      <ResourceHeader
        title="Appointment xizmatlari"
        description="Xizmatlarni appointment va lokatsiyaga biriktiring."
        onCreate={openCreate}
        createLabel="Xizmat qo‘shish"
      />

      <DataTable<AppointmentService>
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
        searchPlaceholder="Xizmat qidirish"
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Xizmat tahriri" : "Yangi xizmat"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="appointmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appointment</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          value={field.value ? String(field.value) : undefined}
                          onChange={(val) => field.onChange(val ? Number(val) : undefined)}
                          options={appointmentOptions}
                          placeholder="Appointment tanlang"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Joylashuv</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          value={field.value ? String(field.value) : undefined}
                          onChange={(val) => field.onChange(val ? Number(val) : undefined)}
                          options={locationOptions}
                          placeholder="Lokatsiya tanlang"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <EditorUploadsContext.Provider value={editorUploads.value}>
                <ResourceFormFields fields={multiFields} />
              </EditorUploadsContext.Provider>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sana</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vaqt</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
            <AlertDialogTitle>Xizmatni o‘chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Bu amalni bekor qilib bo‘lmaydi.
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
    </div>
  );
}
