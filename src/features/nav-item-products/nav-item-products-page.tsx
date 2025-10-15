"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Pencil, Trash, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ResourceHeader } from "@/components/resource/resource-header";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ResourceFormFields } from "@/features/generic-crud/resource-form-fields";
import type { FieldDescriptor } from "@/features/generic-crud/types";
import { navItemProductFormSchema, type NavItemProductFormValues } from "./schema";
import { NavItemProductControllerService, NavItemControllerService } from "@/lib/api/client";
import type { NavItemProduct } from "@/lib/api/models/NavItemProduct";
import type { NavItem } from "@/lib/api/models/NavItem";
import { EditorUploadsContext, useEditorUploadRegistry } from "@/contexts/editor-uploads-context";

export function NavItemProductsPage() {
  const queryClient = useQueryClient();
  const queryKey = ["nav-item-products"];

  const { data: productsData, isLoading } = useQuery({
    queryKey,
    queryFn: () => NavItemProductControllerService.list4(),
  });

  const { data: navItemsData } = useQuery({
    queryKey: ["nav-items"],
    queryFn: () => NavItemControllerService.list3(),
  });

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<NavItemProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NavItemProduct | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const form = useForm<NavItemProductFormValues>({
    resolver: zodResolver(navItemProductFormSchema),
    defaultValues: {
      navItemId: undefined,
      parentId: undefined,
      img: "",
      link: "",
    },
  });

  const editorUploads = useEditorUploadRegistry();

  const resetForm = (record?: NavItemProduct, parent?: NavItemProduct | null) => {
    form.reset({
      navItemId: record?.navitem?.id ?? undefined,
      parentId: record?.parent?.id ?? parent?.id ?? undefined,
      img: record?.img ?? "",
      link: record?.link ?? "",
    });
  };

  const openCreate = (parent?: NavItemProduct | null) => {
    setEditingRecord(null);
    resetForm(undefined, parent ?? null);
    setDialogOpen(true);
  };

  const openEdit = (record: NavItemProduct) => {
    setEditingRecord(record);
    resetForm(record);
    setDialogOpen(true);
  };

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
    mutationFn: async (values: NavItemProductFormValues) => {
      const payload: NavItemProduct = {
        navitem: values.navItemId ? { id: values.navItemId } : undefined,
        parent: values.parentId ? { id: values.parentId } : undefined,
        img: values.img || undefined,
        link: values.link || undefined,
      } as NavItemProduct;
      if (editingRecord?.id) {
        await NavItemProductControllerService.update4({ id: editingRecord.id, requestBody: payload });
        return "Yangilandi";
      }
      await NavItemProductControllerService.create4({ requestBody: payload });
      return "Yaratildi";
    },
    onSuccess: (message) => {
      toast.success(`Nav Item Product ${message}`);
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
      await NavItemProductControllerService.delete4({ id });
    },
    onSuccess: () => {
      toast.success("Nav item product o‘chirildi");
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

  const flatProducts = useMemo(() => flattenProducts(productsData ?? []), [productsData]);
  const navItemOptions = useMemo(() => flattenNavItems(navItemsData ?? []), [navItemsData]);

  const fields: FieldDescriptor[] = [
    {
      type: "select",
      name: "navItemId",
      label: "Bog‘langan NavItem",
      placeholder: "Tanlang",
      valueType: "number",
      options: [
        { label: "Tanlanmagan", value: "" },
        ...navItemOptions.map((item) => ({
          label: `${"— ".repeat(item.level)}${item.nameUz ?? item.slug}`.trimStart(),
          value: String(item.id),
        })),
      ],
    },
    {
      type: "select",
      name: "parentId",
      label: "Ota product",
      placeholder: "Tanlang",
      valueType: "number",
      options: [
        { label: "Root", value: "" },
        ...flatProducts
          .filter((item) => item.id !== editingRecord?.id)
          .map((item) => ({
            label: `${"— ".repeat(item.level)}${item.navitem?.nameUz ?? item.link ?? item.img ?? "Unknown"}`.trimStart(),
            value: String(item.id),
          })),
      ],
    },
    { type: "text", name: "img", label: "Rasm URL", placeholder: "https://" },
    { type: "text", name: "link", label: "Havola", placeholder: "https://" },
  ];

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <ResourceHeader
        title="Nav Item mahsulotlari"
        description="Navigatsiyaga biriktirilgan mahsulotlar daraxti."
        onCreate={() => openCreate(null)}
        createLabel="Yangi product"
      />

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-medium">Jami: {flatProducts.length}</p>
          <Button size="sm" onClick={() => openCreate(null)}>
            <Plus className="mr-2 h-4 w-4" /> Yangi root
          </Button>
        </div>
        <div className="divide-y">
          {isLoading ? (
            <p className="p-4 text-sm text-muted-foreground">Yuklanmoqda...</p>
          ) : (productsData ?? []).length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Ma’lumot topilmadi.</p>
          ) : (
            (productsData ?? []).map((item) => (
              <ProductNode
                key={item.id}
                item={item}
                level={0}
                expandedIds={expandedIds}
                onToggle={toggleExpand}
                onAddChild={openCreate}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))
          )}
        </div>
      </div>

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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Product tahriri" : "Yangi product"}
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

  ...
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Productni o‘chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Tanlangan product va uning bolalari o‘chiriladi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget?.id) {
                  deleteMutation.mutate(deleteTarget.id);
                }
              }}
            >
              Tasdiqlash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ProductNode({
  item,
  level,
  expandedIds,
  onToggle,
  onAddChild,
  onEdit,
  onDelete,
}: {
  item: NavItemProduct;
  level: number;
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
  onAddChild: (parent: NavItemProduct) => void;
  onEdit: (item: NavItemProduct) => void;
  onDelete: (item: NavItemProduct) => void;
}) {
  const hasChildren = (item.children?.length ?? 0) > 0;
  const isExpanded = expandedIds.has(item.id ?? -1);

  const title = item.navitem?.nameUz ?? item.link ?? item.img ?? `Product #${item.id}`;

  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-3 text-sm">
        <div className="flex items-center gap-2" style={{ marginLeft: level * 16 }}>
          {hasChildren ? (
            <button
              type="button"
              className="rounded-md border px-1.5 py-1 text-muted-foreground hover:bg-muted"
              onClick={() => item.id && onToggle(item.id)}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <span className="inline-flex h-5 w-5 items-center justify-center text-muted-foreground">•</span>
          )}
          <div>
            <p className="font-semibold text-foreground">{title}</p>
            {item.link ? (
              <p className="text-xs text-muted-foreground">{item.link}</p>
            ) : null}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onAddChild(item)}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(item)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div className="divide-y">
          {item.children?.map((child) => (
            <ProductNode
              key={child.id}
              item={child}
              level={level + 1}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function flattenProducts(items: NavItemProduct[], level = 0): Array<NavItemProduct & { level: number }> {
  return items.flatMap((item) => {
    const current = [{ ...item, level }];
    const children = item.children ? flattenProducts(item.children, level + 1) : [];
    return [...current, ...children];
  });
}

function flattenNavItems(items: NavItem[], level = 0): Array<NavItem & { level: number }> {
  return items.flatMap((item) => {
    const current = [{ ...item, level }];
    const children = item.children ? flattenNavItems(item.children, level + 1) : [];
    return [...current, ...children];
  });
}
