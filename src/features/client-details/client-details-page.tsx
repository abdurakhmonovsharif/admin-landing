"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { ResourceHeader } from "@/components/resource/resource-header";
import { DataTable } from "@/components/data-table/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { clientDetailsFormSchema, type ClientDetailsFormValues } from "./schema";
import { ClientDetailsControllerService, AppointmentServiceControllerService } from "@/lib/api/client";
import type { ClientDetails } from "@/lib/api/models/ClientDetails";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SearchableSelect } from "@/components/forms/searchable-select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/formatters";
import { ExternalLink, MoreVertical, Pencil, Phone, Trash } from "lucide-react";
import Link from "next/link";

export function ClientDetailsPage() {
  const queryClient = useQueryClient();
  const queryKey = ["client-details"];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => ClientDetailsControllerService.list11(),
  });

  const { data: services } = useQuery({
    queryKey: ["appointment-services"],
    queryFn: () => AppointmentServiceControllerService.list13(),
  });

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ClientDetails | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientDetails | null>(null);

  const resolver = useMemo(
    () => zodResolver(clientDetailsFormSchema) as Resolver<ClientDetailsFormValues>,
    []
  );

  const form = useForm<ClientDetailsFormValues>({
    resolver,
    defaultValues: {
      serviceId: 0,
      firstname: "",
      lastname: "",
      email: "",
      phoneNumber: "",
      address: "",
      comment: "",
    },
  });

  const resetForm = useCallback(
    (record?: ClientDetails | null) => {
      form.reset({
      serviceId: record?.service?.id ?? 0,
        firstname: record?.firstname ?? "",
        lastname: record?.lastname ?? "",
        email: record?.email ?? "",
        phoneNumber: record?.phoneNumber ?? "",
        address: record?.address ?? "",
        comment: record?.comment ?? "",
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
    (record: ClientDetails) => {
      setEditingRecord(record);
      resetForm(record);
      setDialogOpen(true);
    },
    [resetForm]
  );

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingRecord(null);
    resetForm();
  };

  const mutation = useMutation({
    mutationFn: async (values: ClientDetailsFormValues) => {
      const payload: ClientDetails = {
        service: { id: values.serviceId },
        firstname: values.firstname,
        lastname: values.lastname,
        email: values.email,
        phoneNumber: values.phoneNumber,
        address: values.address || undefined,
        comment: values.comment || undefined,
      };
      if (editingRecord?.id) {
        await ClientDetailsControllerService.update11({ id: editingRecord.id, requestBody: payload });
        return "Yangilandi";
      }
      await ClientDetailsControllerService.create11({ requestBody: payload });
      return "Yaratildi";
    },
    onSuccess: (message) => {
      toast.success(`Client details ${message}`);
      queryClient.invalidateQueries({ queryKey });
      closeDialog();
    },
    onError: (error: unknown) => {
      toast.error("Saqlashda xatolik", {
        description: error instanceof Error ? error.message : String(error),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await ClientDetailsControllerService.delete11({ id });
    },
    onSuccess: () => {
      toast.success("Client o‘chirildi");
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

  const serviceOptions = useMemo(
    () =>
      (services ?? []).map((service) => ({
        value: String(service.id),
        label: service.titleUz ?? `Service #${service.id}`,
        description: service.appointment?.titleUz ?? undefined,
      })),
    [services]
  );

  const columns = useMemo<ColumnDef<ClientDetails>[]>(() => [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "firstname", header: "Ism" },
    { accessorKey: "lastname", header: "Familiya" },
    {
      accessorKey: "phoneNumber",
      header: "Telefon",
      cell: ({ row }) => (
        <a href={`tel:${row.original.phoneNumber}`} className="flex items-center gap-1 text-primary hover:underline">
          <Phone className="h-3.5 w-3.5" /> {row.original.phoneNumber}
        </a>
      ),
    },
    { accessorKey: "email", header: "Email" },
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
              <DropdownMenuItem asChild>
                <Link href={`/appointment-services?appointmentId=${record.service?.appointment?.id ?? ""}`}>
                  <ExternalLink className="mr-2 h-4 w-4" /> Xizmatga o‘tish
                </Link>
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
  ], [openEdit]);

  return (
    <div className="space-y-6">
      <ResourceHeader
        title="Client details"
        description="Mijozlar bilan ishlash bo‘limi."
        onCreate={openCreate}
        createLabel="Mijoz qo‘shish"
      />

      <DataTable<ClientDetails>
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        searchPlaceholder="Mijoz qidirish"
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          } else {
            setDialogOpen(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Mijozni tahrirlash" : "Yangi mijoz"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-5">
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Xizmat</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        value={field.value ? String(field.value) : undefined}
                        onChange={(val) => field.onChange(val ? Number(val) : undefined)}
                        options={serviceOptions}
                        placeholder="Xizmat tanlang"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ism</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Familiya</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manzil</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Izoh</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeDialog}>
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
            <AlertDialogTitle>Mijozni o‘chirish</AlertDialogTitle>
            <AlertDialogDescription>Bu amalni bekor qilib bo‘lmaydi.</AlertDialogDescription>
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
