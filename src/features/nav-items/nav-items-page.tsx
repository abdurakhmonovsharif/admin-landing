"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Pencil, Trash, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { ResourceHeader } from "@/components/resource/resource-header";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ResourceFormFields } from "@/features/generic-crud/resource-form-fields";
import { navItemFormSchema, type NavItemFormValues } from "./schema";
import { NavItemControllerService } from "@/lib/api/client";
import type { NavItem } from "@/lib/api/models/NavItem";
import type { NavItemProduct } from "@/lib/api/models/NavItemProduct";
import type { FieldDescriptor } from "@/features/generic-crud/types";
import { slugify } from "@/lib/slugify";
import { EditorUploadsContext, useEditorUploadRegistry } from "@/contexts/editor-uploads-context";

export function NavItemsPage() {
  const queryClient = useQueryClient();
  const queryKey = ["nav-items"];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => NavItemControllerService.list3(),
  });

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [editingRecord, setEditingRecord] = useState<NavItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NavItem | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [pendingParent, setPendingParent] = useState<NavItem | null>(null);

  const form = useForm<NavItemFormValues>({
    resolver: zodResolver(navItemFormSchema),
    defaultValues: {
      nameUz: "",
      nameRu: "",
      nameEn: "",
      slug: "",
      parentId: undefined,
    },
  });

  const editorUploads = useEditorUploadRegistry();

  const resetForm = useCallback(
    (record?: NavItem, parent?: NavItem | null) => {
      setSlugTouched(false);
      form.reset({
        nameUz: record?.nameUz ?? "",
        nameRu: record?.nameRu ?? "",
        nameEn: record?.nameEn ?? "",
        slug: record?.slug ?? "",
        parentId: record?.parent?.id ?? parent?.id ?? undefined,
      });
    },
    [form]
  );

  const openCreate = (parent?: NavItem | null) => {
    setEditingRecord(null);
    setPendingParent(parent ?? null);
    resetForm(undefined, parent ?? null);
    setDialogOpen(true);
  };

  const openEdit = (record: NavItem) => {
    setEditingRecord(record);
    setPendingParent(record.parent ?? null);
    resetForm(record);
    setDialogOpen(true);
  };

  const finalizeClose = useCallback(() => {
    setEditingRecord(null);
    setPendingParent(null);
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
    mutationFn: async (values: NavItemFormValues) => {
      const resolvedParentId = values.parentId ?? pendingParent?.id ?? undefined;
      const payload: NavItem = {
        nameUz: values.nameUz,
        nameRu: values.nameRu || undefined,
        nameEn: values.nameEn || undefined,
        slug: values.slug,
        parent: resolvedParentId ? { id: resolvedParentId } : undefined,
      };
      if (editingRecord?.id) {
        await NavItemControllerService.update3({ id: editingRecord.id, requestBody: payload });
        return "Yangilandi";
      }
      await NavItemControllerService.create3({ requestBody: payload });
      return "Yaratildi";
    },
    onSuccess: (message) => {
      toast.success(`Nav Item ${message}`);
      editorUploads.commitAll();
      queryClient.invalidateQueries({ queryKey });
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
      await NavItemControllerService.delete3({ id });
    },
    onSuccess: () => {
      toast.success("Nav Item o‘chirildi");
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

  const allNavItems = useMemo(() => flattenNavItems(data ?? []), [data]);
  const parentOptions: FieldDescriptor = {
    type: "select",
    name: "parentId",
    label: "Ota element",
    placeholder: "Tanlang",
    valueType: "number",
    options: [
      { label: "Ota element yo‘q", value: "" },
      ...allNavItems
        .filter((item) => item.id !== editingRecord?.id)
        .map((item) => ({
          label: `${"— ".repeat(item.level)}${item.nameUz ?? item.slug}`.trimStart(),
          value: String(item.id),
        })),
    ],
  };

  const fields: FieldDescriptor[] = [
    { type: "multilingual", baseName: "name", label: "Nom", required: true },
    { type: "text", name: "slug", label: "Slug", required: true, placeholder: "nav-item-slug" },
    parentOptions,
  ];

  const watchedNameUz = form.watch("nameUz");

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "slug") {
        if (form.formState.dirtyFields.slug) {
          setSlugTouched(true);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (!slugTouched && !editingRecord && watchedNameUz && !(form.getValues("slug") ?? "")) {
      form.setValue("slug", slugify(watchedNameUz), { shouldDirty: false });
    }
  }, [slugTouched, editingRecord, watchedNameUz, form]);

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
        title="Nav Itemlar"
        description="Sayt navigatsiyasi daraxti."
        onCreate={() => openCreate(null)}
        createLabel="Yangi nav item"
      />

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="divide-y">
          {isLoading ? (
            <p className="p-4 text-sm text-muted-foreground">Yuklanmoqda...</p>
          ) : (data ?? []).length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">Hozircha ma’lumot yo‘q.</p>
          ) : (
            (data ?? []).map((item) => (
              <NavItemNode
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Nav Item tahriri" : "Yangi Nav Item"}
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
                <Button type="submit" disabled={mutation.isPending} onClick={() => setSlugTouched(true)}>
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
            <AlertDialogTitle>Nav itemni o‘chirish</AlertDialogTitle>
            <AlertDialogDescription>
              Tanlangan nav item va uning bolalari o‘chiriladi.
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

function NavItemNode({
  item,
  level,
  expandedIds,
  onToggle,
  onAddChild,
  onEdit,
  onDelete,
}: {
  item: NavItem;
  level: number;
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
  onAddChild: (parent: NavItem) => void;
  onEdit: (item: NavItem) => void;
  onDelete: (item: NavItem) => void;
}) {
  const childNavItems = item.children ?? [];
  const products = item.products ?? [];
  const hasChildNavItems = childNavItems.length > 0;
  const hasProducts = products.length > 0;
  const hasExpandableContent = hasChildNavItems || hasProducts;
  const isExpanded = expandedIds.has(item.id ?? -1);

  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-3 text-sm">
        <div className="flex items-center gap-2" style={{ marginLeft: level * 16 }}>
          {hasExpandableContent ? (
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
            <p className="font-semibold text-foreground">{item.nameUz ?? "No title"}</p>
            <p className="text-xs text-muted-foreground">/{item.slug}</p>
            {hasProducts ? (
              <p className="text-xs text-muted-foreground">Mahsulotlar: {products.length}</p>
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
      {hasExpandableContent && isExpanded && (
        <div className="divide-y">
          {childNavItems.map((child) => (
            <NavItemNode
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
          {products.map((product, index) => (
            <NavItemProductRow key={`product-${product.id ?? index}`} product={product} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function flattenNavItems(items: NavItem[], level = 0): Array<NavItem & { level: number }> {
  return items.flatMap((item) => {
    const current = [{ ...item, level }];
    const childNodes = item.children ? flattenNavItems(item.children, level + 1) : [];
    return [...current, ...childNodes];
  });
}

function NavItemProductRow({ product, level }: { product: NavItemProduct; level: number }) {
  const title = product.link ?? product.img ?? `Product #${product.id ?? ""}`;

  return (
    <div className="flex items-start gap-2 px-4 py-3 text-sm" style={{ marginLeft: level * 16 }}>
      <span className="mt-1 inline-flex h-5 w-5 items-center justify-center text-muted-foreground">•</span>
      <div className="space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        <div className="space-y-0.5 text-xs text-muted-foreground">
          {product.img ? (
            <a
              href={product.img}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate underline hover:text-foreground"
            >
              Rasm: {product.img}
            </a>
          ) : null}
          {product.link ? (
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate underline hover:text-foreground"
            >
              Havola: {product.link}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
