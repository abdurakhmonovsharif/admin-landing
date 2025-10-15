"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ResourceHeader } from "@/components/resource/resource-header";
import { DataTable } from "@/components/data-table/data-table";
import { ResourceFormFields } from "@/features/generic-crud/resource-form-fields";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { getResourceConfig } from "./resource-config";
import type { ResourceKey } from "./types";
import { cn } from "@/lib/utils";
import { EditorUploadsContext, useEditorUploadRegistry } from "@/contexts/editor-uploads-context";
import { resolveMediaUrl } from "@/lib/media-upload";

const IMAGE_URL_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "tiff", "tif", "heic", "heif", "avif"];
const VIDEO_URL_EXTENSIONS = ["mp4", "mov", "avi", "mkv", "webm", "m4v", "3gp", "wmv", "flv", "mpeg", "mpg"];

type PreviewMedia = {
  url: string;
  mediaType: "image" | "video";
  title?: string;
};

const inferMediaTypeFromUrl = (url: string): "image" | "video" | undefined => {
  const normalized = url.split("?")[0]?.toLowerCase() ?? "";
  if (VIDEO_URL_EXTENSIONS.some((ext) => normalized.endsWith(`.${ext}`))) {
    return "video";
  }
  if (IMAGE_URL_EXTENSIONS.some((ext) => normalized.endsWith(`.${ext}`))) {
    return "image";
  }
  return undefined;
};

const isYouTubeUrl = (url: string): boolean => {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
    return (
      hostname === "youtu.be" ||
      hostname.endsWith("youtube.com") ||
      hostname.endsWith("youtube-nocookie.com")
    );
  } catch {
    return false;
  }
};

const asPreviewMediaType = (value?: string | null): PreviewMedia["mediaType"] | undefined => {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized === "image" || normalized === "video") {
    return normalized;
  }
  return undefined;
};

export function GenericResourcePage({ resourceKey }: { resourceKey: ResourceKey }) {
  const config = getResourceConfig(resourceKey);
  const {
    defaultValues,
    toFormValues,
    fields,
    columns: baseColumns,
    service,
    schema,
    title,
    description,
  } = config;
  const queryClient = useQueryClient();
  const queryKey = ["resource", resourceKey];

  const { data, isLoading } = useQuery<unknown[]>({
    queryKey,
    queryFn: service.list,
  });

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<Record<string, unknown> | null>(null);
  const [previewMedia, setPreviewMedia] = useState<PreviewMedia | null>(null);

  const form = useForm({
    defaultValues,
    mode: "onSubmit",
  });

  const editorUploads = useEditorUploadRegistry();

  const hasEditorField = useMemo(
    () =>
      fields.some((field) => {
        if (field.type === "multilingual") {
          return field.kind === "editor";
        }
        return false;
      }),
    [fields]
  );

  const toRecord = (value: unknown): Record<string, unknown> =>
    (value && typeof value === "object" ? value : {}) as Record<string, unknown>;

  const resetForm = useCallback(
    (record?: unknown) => {
      const baseRecord = record ? toRecord(record) : {};
      const source = record
        ? toFormValues
          ? toFormValues(baseRecord)
          : baseRecord
        : {};
      const merged = { ...defaultValues, ...source };
      const normalized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(merged)) {
        if (Array.isArray(value)) {
          normalized[key] = value;
          continue;
        }
        if (typeof value === "boolean" || typeof value === "number") {
          normalized[key] = value;
          continue;
        }
        if (value === null || value === undefined) {
          const defaultValue = defaultValues[key];
          if (Array.isArray(defaultValue)) {
            normalized[key] = [];
          } else if (typeof defaultValue === "boolean") {
            normalized[key] = Boolean(defaultValue);
          } else if (typeof defaultValue === "number") {
            normalized[key] = defaultValue;
          } else {
            normalized[key] = "";
          }
        } else {
          normalized[key] = value;
        }
      }
      form.reset(normalized);
    },
    [defaultValues, toFormValues, form]
  );

  const openCreate = () => {
    setEditingRecord(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = useCallback(
    (record: unknown) => {
      const normalized = toRecord(record);
      setEditingRecord(normalized);
      resetForm(normalized);
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

  const openPreview = useCallback((record: Record<string, unknown>) => {
    const rawUrl =
      typeof record.url === "string"
        ? record.url
        : typeof record.image === "string"
          ? record.image
          : undefined;
    if (!rawUrl) {
      toast.error("Media topilmadi");
      return;
    }
    const resolvedUrl = resolveMediaUrl(rawUrl) ?? rawUrl;
    const mediaTypeRaw =
      typeof record.mediaType === "string" ? record.mediaType.toLowerCase() : undefined;
    const inferred = inferMediaTypeFromUrl(resolvedUrl);
    const fallbackType =
      typeof record.image === "string" && typeof record.url !== "string" ? "image" : undefined;
    const resolvedMediaType =
      inferred ??
      asPreviewMediaType(mediaTypeRaw) ??
      asPreviewMediaType(fallbackType) ??
      "image";
    setPreviewMedia({
      url: resolvedUrl,
      mediaType: resolvedMediaType,
      title: typeof record.title === "string" ? record.title : undefined,
    });
  }, []);

  const closePreview = useCallback(() => {
    setPreviewMedia(null);
  }, []);

  const mutation = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const sanitized = sanitizePayload(values);
      const payload = config.toPayload ? config.toPayload(sanitized, editingRecord) : sanitized;
      const currentId = editingRecord?.id as number | undefined;
      if (currentId) {
        await service.update(currentId, payload); 
        return "Yangilandi";
      }
      await service.create(payload);
      return "Yaratildi";
    },
    onSuccess: (message) => {
      toast.success(`${title}: ${message}`);
      editorUploads.commitAll();
      handleCloseAfterCommit();
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: unknown) => {
      toast.error("Saqlashda xatolik", {
        description: error instanceof Error ? error.message : String(error),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await service.remove(id);
    },
    onSuccess: () => {
      toast.success(`${title}: O‘chirildi`);
      setRecordToDelete(null);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: unknown) => {
      toast.error("O‘chirishda xatolik", {
        description: error instanceof Error ? error.message : String(error),
      });
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const fieldName = (issue.path.join(".") || issue.path[0]?.toString() || "root") as Parameters<
          typeof form.setError
        >[0];
        form.setError(fieldName, { message: issue.message });
      });
      toast.error("Maʼlumotlarni tekshiring");
      return;
    }

    await mutation.mutateAsync(parsed.data as Record<string, unknown>);
  });

  const columns = useMemo<ColumnDef<unknown>[]>(() => {
    const previewColumn: ColumnDef<unknown> | null =
      resourceKey === "gallery" || resourceKey === "journal"
        ? {
            id: "preview",
            header: "Ko‘rish",
            cell: ({ row }) => {
              const record = toRecord(row.original);
              const mediaSource =
                resourceKey === "journal"
                  ? (typeof record.image === "string" ? record.image : "")
                  : (typeof record.url === "string" ? record.url : "");
              if (!mediaSource) {
                return <span className="text-muted-foreground">—</span>;
              }
              return (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openPreview(record)}
                >
                  Ko‘rish
                </Button>
              );
            },
          }
        : null;

    return [
      ...baseColumns,
      ...(previewColumn ? [previewColumn] : []),
      {
        id: "actions",
        header: "Amallar",
        cell: ({ row }) => {
          const record = toRecord(row.original);
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
                  onClick={() => setRecordToDelete(record)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" /> O‘chirish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ];
  }, [baseColumns, openEdit, openPreview, resourceKey]);
  return (
    <div className="space-y-6">
      <ResourceHeader
        title={title}
        description={description}
        onCreate={openCreate}
      />
      <DataTable
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        searchPlaceholder="Qidiruv"
      />

      <Dialog open={!!previewMedia} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewMedia?.title ?? "Media ko‘rish"}</DialogTitle>
          </DialogHeader>
          {previewMedia ? (
            previewMedia.mediaType === "video" ? (
              isYouTubeUrl(previewMedia.url) ? (
                <div className="aspect-video w-full overflow-hidden rounded-md border bg-black">
                  <iframe
                    src={previewMedia.url}
                    title={previewMedia.title ?? "Gallery video"}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video
                  src={previewMedia.url}
                  controls
                  className="aspect-video w-full rounded-md border bg-black"
                />
              )
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewMedia.url}
                alt={previewMedia.title ?? "Gallery media"}
                className="max-h-[70vh] w-full rounded-md object-contain"
              />
            )
          ) : null}
        </DialogContent>
      </Dialog>

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
        <DialogContent fullScreen={hasEditorField}>
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Tahrirlash" : "Yangi yozuv"} – {title}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={onSubmit}
              className={hasEditorField ? "flex h-full flex-col gap-6" : "space-y-6"}
            >
              <EditorUploadsContext.Provider value={editorUploads.value}>
                <div className={cn(hasEditorField ? "flex-1 overflow-y-auto pr-1" : "space-y-6")}>
                  <ResourceFormFields fields={fields} />
                </div>
              </EditorUploadsContext.Provider>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void handleCancel();
                  }}
                >
                  Bekor qilish
                </Button>
                <Button type="submit">
                  {mutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!recordToDelete} onOpenChange={(open) => !open && setRecordToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>O‘chirishni tasdiqlang</AlertDialogTitle>
            <AlertDialogDescription>
              Bu amalni bekor qilib bo‘lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                const id = recordToDelete?.id as number | undefined;
                if (id) {
                  deleteMutation.mutate(id);
                }
              }}
            >
              O‘chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function sanitizePayload(values: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === "" || value === null) {
      result[key] = undefined;
      continue;
    }
    if (typeof value === "number" && Number.isNaN(value)) {
      result[key] = undefined;
      continue;
    }
    if (Array.isArray(value)) {
      result[key] = value.filter((item) => item !== "");
      continue;
    }
    result[key] = value;
  }
  return result;
}
