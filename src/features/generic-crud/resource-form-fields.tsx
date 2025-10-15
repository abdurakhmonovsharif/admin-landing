"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FocusEvent } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FieldDescriptor } from "./types";
import { useLanguage } from "@/contexts/language-context";
import { useEditorUploadsContext } from "@/contexts/editor-uploads-context";
import { deleteMediaFile, resolveMediaUrl, uploadMediaFile, type UploadedMedia } from "@/lib/media-upload";
import { Loader2, Trash2, Upload, Plus, FileText } from "lucide-react";

const languages = [
  { code: "uz", label: "UZ" },
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
] as const;

const getRecordString = (record: Record<string, unknown> | undefined, key: string): string | undefined => {
  if (!record) return undefined;
  const value = record[key];
  return typeof value === "string" ? value : undefined;
};

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "svg",
  "tiff",
  "tif",
  "heic",
  "heif",
  "avif",
]);

const VIDEO_EXTENSIONS = new Set([
  "mp4",
  "mov",
  "avi",
  "mkv",
  "webm",
  "m4v",
  "3gp",
  "wmv",
  "flv",
  "mpeg",
  "mpg",
]);

type Language = (typeof languages)[number];

const getLanguageSuffix = (code: Language["code"]) =>
  `${code.charAt(0).toUpperCase()}${code.slice(1)}`;

type SocialLinkValue = {
  platform: string;
  link: string;
};

const inferMediaTypeFromFile = (file: File): "image" | "video" | undefined => {
  const mimeType = file.type.toLowerCase();
  if (mimeType.startsWith("image/")) {
    return "image";
  }
  if (mimeType.startsWith("video/")) {
    return "video";
  }

  const extensionMatch = /\.([^.]+)$/.exec(file.name ?? "");
  const extension = extensionMatch?.[1]?.toLowerCase();
  if (!extension) {
    return undefined;
  }

  if (IMAGE_EXTENSIONS.has(extension)) {
    return "image";
  }
  if (VIDEO_EXTENSIONS.has(extension)) {
    return "video";
  }

  return undefined;
};

const normalizeHostname = (hostname: string): string => hostname.replace(/^www\./i, "").toLowerCase();

const parseYouTubeTimeToken = (value?: string | null): number | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  const colonParts = trimmed.split(":");
  if (colonParts.length > 1 && colonParts.every((part) => /^\d+$/.test(part))) {
    let multiplier = 1;
    let total = 0;
    for (let index = colonParts.length - 1; index >= 0; index -= 1) {
      total += Number(colonParts[index]) * multiplier;
      multiplier *= 60;
    }
    return total;
  }

  let totalSeconds = 0;
  let matched = false;
  const pattern = /(\d+)(h|m|s)/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(trimmed)) !== null) {
    matched = true;
    const amount = Number(match[1]);
    const unit = match[2]?.toLowerCase();
    if (unit === "h") {
      totalSeconds += amount * 3600;
    } else if (unit === "m") {
      totalSeconds += amount * 60;
    } else if (unit === "s") {
      totalSeconds += amount;
    }
  }
  return matched ? totalSeconds : undefined;
};

const normalizeYouTubeUrl = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const prefixed = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(prefixed);
  } catch {
    return undefined;
  }

  const host = normalizeHostname(url.hostname);
  const pathSegments = url.pathname.split("/").filter(Boolean);
  let videoId: string | undefined;

  if (host === "youtu.be") {
    videoId = pathSegments[0];
  } else if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    if (pathSegments[0] === "watch") {
      videoId = url.searchParams.get("v") ?? undefined;
    } else if (pathSegments[0] === "embed" && pathSegments[1]) {
      videoId = pathSegments[1];
    } else if (pathSegments[0] === "v" && pathSegments[1]) {
      videoId = pathSegments[1];
    } else if (pathSegments[0] === "shorts" && pathSegments[1]) {
      videoId = pathSegments[1];
    } else if (url.searchParams.get("v")) {
      videoId = url.searchParams.get("v") ?? undefined;
    } else if (pathSegments.length === 1) {
      videoId = pathSegments[0];
    }
  } else {
    return undefined;
  }

  videoId = videoId?.trim();
  if (!videoId) {
    return undefined;
  }

  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
  const listParam = url.searchParams.get("list");
  if (listParam) {
    embedUrl.searchParams.set("list", listParam);
  }

  const startCandidates = [url.searchParams.get("start"), url.searchParams.get("t")];
  let startSeconds: number | undefined;
  for (const candidate of startCandidates) {
    const parsed = parseYouTubeTimeToken(candidate);
    if (parsed != null && parsed > 0) {
      startSeconds = parsed;
      break;
    }
  }

  if (startSeconds == null) {
    const hash = url.hash?.replace(/^#/, "");
    if (hash?.startsWith("t=")) {
      startSeconds = parseYouTubeTimeToken(hash.slice(2));
    } else if (hash) {
      startSeconds = parseYouTubeTimeToken(hash);
    }
  }

  if (startSeconds != null && startSeconds > 0) {
    embedUrl.searchParams.set("start", String(startSeconds));
  }

  return embedUrl.toString();
};

export function ResourceFormFields({ fields }: { fields: FieldDescriptor[] }) {
  return (
    <div className="grid gap-4">
      {fields.map((field) => (
        <FieldRenderer key={`${field.type}-${"baseName" in field ? field.baseName : field.name}`} descriptor={field} />
      ))}
    </div>
  );
}

function FieldRenderer({ descriptor }: { descriptor: FieldDescriptor }) {
  switch (descriptor.type) {
    case "multilingual":
      return <MultilingualField descriptor={descriptor} />;
    case "array":
      return <ArrayField descriptor={descriptor} />;
    case "boolean":
      return <BooleanField descriptor={descriptor} />;
    case "select":
      return <SelectField descriptor={descriptor} />;
    case "media-upload":
      return <MediaUploadField descriptor={descriptor} />;
    case "social-links":
      return <SocialLinksField descriptor={descriptor} />;
    default:
      return <SimpleField descriptor={descriptor} />;
  }
}

function SimpleField({ descriptor }: { descriptor: Extract<FieldDescriptor, { type: "text" | "number" | "textarea" | "date" | "time" }> }) {
  const { control } = useFormContext();
  const inputType = descriptor.type === "number" ? "number" : descriptor.type === "date" ? "date" : descriptor.type === "time" ? "time" : "text";
  const Component = descriptor.type === "textarea" ? Textarea : Input;

  return (
    <FormField
      control={control}
      name={descriptor.name as never}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{descriptor.label}</FormLabel>
          <FormControl>
            <Component
              {...field}
              value={field.value ?? ""}
              onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                if (descriptor.type === "number") {
                  const value = event.target.value;
                  field.onChange(value === "" ? undefined : Number(value));
                  return;
                }
                field.onChange(event.target.value);
              }}
              placeholder={descriptor.placeholder}
              className={cn(descriptor.type === "textarea" ? "min-h-[112px]" : "", "resize-none")}
              type={descriptor.type === "textarea" ? undefined : inputType}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function ArrayField({ descriptor }: { descriptor: Extract<FieldDescriptor, { type: "array" }> }) {
  const { control } = useFormContext();
  const [inputValue, setInputValue] = useState("");

  return (
    <FormField
      control={control}
      name={descriptor.name as never}
      render={({ field }) => {
        const values: string[] = Array.isArray(field.value) ? field.value : [];

        const addValue = () => {
          const trimmed = inputValue.trim();
          if (!trimmed) return;
          field.onChange([...values, trimmed]);
          setInputValue("");
        };

        const removeValue = (index: number) => {
          const next = values.filter((_, i) => i !== index);
          field.onChange(next);
        };

        return (
          <FormItem>
            <FormLabel>{descriptor.label}</FormLabel>
            <FormControl>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    placeholder={descriptor.placeholder ?? "Qiymat kiriting"}
                  />
                  <Button type="button" onClick={addValue}>
                    Qo‘shish
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {values.map((value, index) => (
                    <Badge
                      key={`${value}-${index}`}
                      variant="secondary"
                      className="flex items-center gap-2 pr-2"
                    >
                      <span>{value}</span>
                      <button
                        type="button"
                        className="rounded-full bg-primary/10 px-1 text-xs text-primary"
                        onClick={() => removeValue(index)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

function BooleanField({ descriptor }: { descriptor: Extract<FieldDescriptor, { type: "boolean" }> }) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={descriptor.name as never}
      render={({ field }) => (
        <FormItem className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel>{descriptor.label}</FormLabel>
          </div>
          <FormControl>
            <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

function SocialLinksField({ descriptor }: { descriptor: Extract<FieldDescriptor, { type: "social-links" }> }) {
  const formContext = useFormContext<Record<string, unknown>>();
  const { control, getFieldState } = formContext;
  const uploadsRegistry = useEditorUploadsContext();
  const pendingUploadsRef = useRef(new Map<string, UploadedMedia>());
  const fileInputRefs = useRef(new Map<number, HTMLInputElement | null>());
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const discardUploads = useCallback(async () => {
    const entries = Array.from(pendingUploadsRef.current.values());
    pendingUploadsRef.current.clear();
    if (entries.length === 0) return;
    await Promise.allSettled(
      entries.map((entry) =>
        deleteMediaFile({
          path: entry.path,
          url: entry.rawUrl ?? entry.url,
        })
      )
    );
  }, []);

  const commitUploads = useCallback(() => {
    pendingUploadsRef.current.clear();
  }, []);

  useEffect(() => {
    if (!uploadsRegistry) return;
    const unregister = uploadsRegistry.register({
      discardUploads,
      commitUploads,
    });
    return () => {
      unregister();
    };
  }, [uploadsRegistry, discardUploads, commitUploads]);

  const setFileInputRef = useCallback((index: number, node: HTMLInputElement | null) => {
    if (node) {
      fileInputRefs.current.set(index, node);
    } else {
      fileInputRefs.current.delete(index);
    }
  }, []);

  const deletePendingUpload = useCallback(async (url?: string) => {
    if (!url) return;
    const pending = pendingUploadsRef.current.get(url);
    if (!pending) return;
    pendingUploadsRef.current.delete(url);
    try {
      await deleteMediaFile({
        path: pending.path,
        url: pending.rawUrl ?? pending.url,
      });
    } catch (error) {
      const description = error instanceof Error ? error.message : undefined;
      toast.error("Platform rasmni o‘chirishda xatolik", { description });
    }
  }, []);

  return (
    <FormField
      control={control}
      name={descriptor.name as never}
      render={({ field }) => {
        const rawValues = Array.isArray(field.value) ? (field.value as unknown[]) : [];
        const values: SocialLinkValue[] = rawValues
          .map((item) => {
            if (item && typeof item === "object") {
              const record = item as Record<string, unknown>;
              const platform = getRecordString(record, "platform") ?? "";
              const link = getRecordString(record, "link") ?? "";
              return { platform, link };
            }
            if (typeof item === "string") {
              try {
                const parsed = JSON.parse(item) as Record<string, unknown>;
                const platform = getRecordString(parsed, "platform") ?? "";
                const link = getRecordString(parsed, "link") ?? "";
                return { platform, link };
              } catch {
                return { platform: item, link: "" };
              }
            }
            return { platform: "", link: "" };
          })
          .filter((entry) => entry != null);

        const updateValues = (next: SocialLinkValue[]) => {
          field.onChange(next);
          field.onBlur();
        };

        const handleAdd = () => {
          updateValues([...values, { platform: "", link: "" }]);
        };

        const handleRemove = async (index: number) => {
          const target = values[index];
          if (target?.platform) {
            await deletePendingUpload(target.platform);
          }
          const next = values.filter((_, i) => i !== index);
          updateValues(next);
        };

        const openFileDialog = (index: number) => {
          fileInputRefs.current.get(index)?.click();
        };

        const handleFileChange = async (index: number, files: FileList | null) => {
          if (!files || files.length === 0) return;
          const file = files[0];
          setUploadingIndex(index);
          try {
            const uploaded = await uploadMediaFile(descriptor.uploadCategory, file);
            const storedValue = uploaded.rawUrl ?? uploaded.url;
            const previousPlatform = values[index]?.platform;
            if (previousPlatform && previousPlatform !== storedValue) {
              await deletePendingUpload(previousPlatform);
            }
            pendingUploadsRef.current.set(storedValue, uploaded);
            const next = [...values];
            next[index] = {
              ...next[index],
              platform: storedValue,
            };
            updateValues(next);
          } catch (error) {
            const description = error instanceof Error ? error.message : undefined;
            toast.error("Platform rasmni yuklashda xatolik", { description });
          } finally {
            setUploadingIndex((current) => (current === index ? null : current));
            const input = fileInputRefs.current.get(index);
            if (input) {
              input.value = "";
            }
          }
        };

        const handleLinkChange = (index: number, link: string) => {
          const next = [...values];
          next[index] = {
            ...next[index],
            link,
          };
          updateValues(next);
        };

        return (
          <FormItem>
            <FormLabel>{descriptor.label}</FormLabel>
            <div className="space-y-4">
              {descriptor.helperText ? (
                <p className="text-xs text-muted-foreground">{descriptor.helperText}</p>
              ) : null}
              {values.length === 0 ? (
                <p className="text-sm text-muted-foreground">Hozircha ijtimoiy tarmoq qo‘shilmagan.</p>
              ) : (
                values.map((item, index) => {
                  const platformState = getFieldState(`${descriptor.name}.${index}.platform` as never);
                  const linkState = getFieldState(`${descriptor.name}.${index}.link` as never);
                  return (
                    <div
                      key={`${descriptor.name}-${index}`}
                      className="space-y-3 rounded-lg border p-4"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-16 w-16 overflow-hidden rounded-md border bg-muted">
                            {item.platform ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={resolveMediaUrl(item.platform) ?? item.platform}
                                alt="Platform icon"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                Rasm yo‘q
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openFileDialog(index)}
                              disabled={uploadingIndex === index}
                            >
                              {uploadingIndex === index ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Yuklanmoqda...
                                </>
                              ) : (
                                <>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Platforma rasmini yuklash
                                </>
                              )}
                            </Button>
                            {platformState.error ? (
                              <p className="text-xs text-destructive">{platformState.error.message}</p>
                            ) : null}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            void handleRemove(index);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Havola</label>
                        <Input
                          value={item.link}
                          onChange={(event) => handleLinkChange(index, event.target.value)}
                          placeholder="https://"
                          className="mt-1"
                        />
                        {linkState.error ? (
                          <p className="mt-1 text-xs text-destructive">{linkState.error.message}</p>
                        ) : null}
                      </div>
                      <input
                        ref={(node) => setFileInputRef(index, node)}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          void handleFileChange(index, event.target.files);
                        }}
                      />
                    </div>
                  );
                })
              )}
              <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Ijtimoiy tarmoq qo‘shish
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

function MediaUploadField({ descriptor }: { descriptor: Extract<FieldDescriptor, { type: "media-upload" }> }) {
  const form = useFormContext<Record<string, unknown>>();
  const { control, watch, setValue } = form;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadsRegistry = useEditorUploadsContext();
  const pendingUploadsRef = useRef(new Map<string, UploadedMedia>());
  const [isUploading, setIsUploading] = useState(false);

  const mediaTypeField = descriptor.mediaTypeField;
  const mediaTypeValueRaw = mediaTypeField ? watch(mediaTypeField as never) : undefined;
  const mediaTypeValue = typeof mediaTypeValueRaw === "string" ? mediaTypeValueRaw : undefined;
  const manualInputTargets = descriptor.manualInputWhen ?? [];
  const shouldUseManualInput =
    mediaTypeField != null && manualInputTargets.length > 0
      ? manualInputTargets.includes(mediaTypeValue ?? "")
      : false;
  const wasManualRef = useRef(shouldUseManualInput);

  const discardUploads = useCallback(async () => {
    const entries = Array.from(pendingUploadsRef.current.values());
    pendingUploadsRef.current.clear();
    if (entries.length === 0) return;
    await Promise.allSettled(
      entries.map((entry) =>
        deleteMediaFile({
          path: entry.path,
          url: entry.rawUrl ?? entry.url,
        })
      )
    );
  }, []);

  const commitUploads = useCallback(() => {
    pendingUploadsRef.current.clear();
  }, []);

  useEffect(() => {
    if (!uploadsRegistry) return;
    const unregister = uploadsRegistry.register({
      discardUploads,
      commitUploads,
    });
    return () => {
      unregister();
    };
  }, [uploadsRegistry, discardUploads, commitUploads]);

  useEffect(() => {
    if (!mediaTypeField) {
      wasManualRef.current = shouldUseManualInput;
      return;
    }

    if (shouldUseManualInput && !wasManualRef.current) {
      if (pendingUploadsRef.current.size > 0) {
        void discardUploads();
      } else {
        pendingUploadsRef.current.clear();
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setValue(descriptor.name as never, "" as never, {
        shouldDirty: true,
        shouldTouch: true,
      });
    } else if (!shouldUseManualInput && wasManualRef.current) {
      pendingUploadsRef.current.clear();
      setValue(descriptor.name as never, "" as never, {
        shouldDirty: true,
        shouldTouch: true,
      });
    }

    wasManualRef.current = shouldUseManualInput;
  }, [shouldUseManualInput, mediaTypeField, discardUploads, descriptor.name, setValue]);

  const mediaTypeSelector = mediaTypeField ? (
    <FormField
      control={control}
      name={mediaTypeField as never}
      render={({ field: mediaField }) => (
        <FormItem>
          <FormLabel>Media turi</FormLabel>
          <FormControl>
            <Select
              value={(function () {
                const rawValue = mediaField.value as string | undefined;
                if (rawValue && rawValue.length > 0) {
                  return rawValue;
                }
                return "image";
              })()}
              onValueChange={(value) => {
                mediaField.onChange(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Rasm</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  ) : null;

  return (
    <div className="space-y-3">
      {mediaTypeSelector}
      <FormField
        control={control}
        name={descriptor.name as never}
        render={({ field }) => {
          if (shouldUseManualInput) {
            const stringValue =
              typeof field.value === "string"
                ? field.value
                : Array.isArray(field.value)
                  ? field.value[0] ?? ""
                  : "";

            return (
              <FormItem>
                <FormLabel>{descriptor.label}</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    value={stringValue}
                    onChange={(event) => {
                      field.onChange(event.target.value);
                    }}
                    onBlur={(event: FocusEvent<HTMLInputElement>) => {
                      const rawValue = event.target.value ?? "";
                      const trimmed = rawValue.trim();
                      if (!trimmed) {
                        field.onChange("");
                        field.onBlur();
                        return;
                      }
                      const normalized = normalizeYouTubeUrl(trimmed);
                      if (normalized) {
                        if (normalized !== rawValue) {
                          field.onChange(normalized);
                        }
                      } else {
                        toast.error("Yaroqli YouTube havolasini kiriting");
                      }
                      field.onBlur();
                    }}
                    placeholder={descriptor.manualInputPlaceholder ?? "https://"}
                  />
                </FormControl>
                {(descriptor.manualInputHelperText ?? descriptor.helperText) ? (
                  <p className="text-xs text-muted-foreground">
                    {descriptor.manualInputHelperText ?? descriptor.helperText}
                  </p>
                ) : null}
                <FormMessage />
              </FormItem>
            );
          }

          const isSingle = descriptor.mode === "single";
          const toArray = (): string[] => {
            const currentValue = field.value as unknown;
            if (Array.isArray(currentValue)) {
              return currentValue.filter((value): value is string => typeof value === "string" && value.length > 0);
            }
            if (typeof currentValue === "string" && currentValue.length > 0) {
              return [currentValue];
            }
            return [];
          };

          const values = toArray();
          const resolvedMaxFiles = descriptor.maxFiles ?? (isSingle ? 1 : undefined);
          const remainingSlots = resolvedMaxFiles != null ? resolvedMaxFiles - values.length : undefined;
          const isLimitReached = remainingSlots != null ? remainingSlots <= 0 : false;
          const buttonLabel = descriptor.uploadButtonLabel ?? "Rasm";
          const counterLabel = descriptor.counterLabel ?? "rasm";

          const applyValues = (next: string[]) => {
            const sanitized = next.filter((value) => typeof value === "string" && value.length > 0);
            if (isSingle) {
              field.onChange(sanitized[0] ?? "");
            } else {
              field.onChange(sanitized);
            }
            field.onBlur();
          };

          const handleRemove = async (url: string) => {
            const next = values.filter((value) => value !== url);
            applyValues(next);
            const pendingEntry = pendingUploadsRef.current.get(url);
            if (!pendingEntry) {
              return;
            }
            pendingUploadsRef.current.delete(url);
            try {
              await deleteMediaFile({
                path: pendingEntry.path,
                url: pendingEntry.rawUrl ?? pendingEntry.url,
              });
            } catch (error) {
              const description = error instanceof Error ? error.message : undefined;
              toast.error("Media o‘chirishda xatolik", { description });
            }
          };

          const processFiles = async (files: FileList | null) => {
            if (!files || files.length === 0) return;
            const allFiles = Array.from(files);
            let allowedFiles = allFiles;

            if (remainingSlots != null) {
              if (remainingSlots <= 0) {
                toast.error("Rasmlar limiti tugagan", {
                  description: "Yangi rasm qo‘shish uchun avval mavjudlarini o‘chiring.",
                });
                return;
              }
              if (allFiles.length > remainingSlots) {
                toast.error("Rasmlar soni cheklangan", {
                  description: `Faqat ${remainingSlots} ta rasm qo‘shish mumkin.`,
                });
                allowedFiles = allFiles.slice(0, remainingSlots);
              }
            }

            if (allowedFiles.length === 0) {
              return;
            }

            setIsUploading(true);
            const uploadedUrls: string[] = [];
            const failedMessages: string[] = [];

            try {
              for (const file of allowedFiles) {
                try {
                  const inferredType = inferMediaTypeFromFile(file);
                  if (inferredType === "video" && manualInputTargets.includes("video")) {
                    failedMessages.push("Video fayllar uchun YouTube havolasini kiriting.");
                    continue;
                  }
                  const uploaded = await uploadMediaFile(descriptor.uploadCategory, file);
                  const storedValue = uploaded.rawUrl ?? uploaded.url;
                  pendingUploadsRef.current.set(storedValue, uploaded);
                  uploadedUrls.push(storedValue);
                } catch (error) {
                  const description = error instanceof Error ? error.message : undefined;
                  failedMessages.push(description ?? "Yuklab bo‘lmadi");
                }
              }

              if (uploadedUrls.length > 0) {
                applyValues([...values, ...uploadedUrls]);
              }

              if (failedMessages.length > 0) {
                toast.error("Baʼzi rasmlar yuklanmadi", {
                  description: failedMessages[0],
                });
              }
            } finally {
              setIsUploading(false);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }
          };

          return (
            <FormItem>
              <FormLabel>{descriptor.label}</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={descriptor.accept ?? "image/*"}
                    multiple={!isSingle && (resolvedMaxFiles == null || resolvedMaxFiles > 1)}
                    className="hidden"
                    onChange={(event) => {
                      void processFiles(event.target.files);
                    }}
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading || isLimitReached}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Yuklanmoqda...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          {buttonLabel} yuklash
                        </>
                      )}
                    </Button>
                    {resolvedMaxFiles != null ? (
                      <span className="text-xs text-muted-foreground">
                        {values.length}/{resolvedMaxFiles} {counterLabel}
                      </span>
                    ) : null}
                  </div>
                  {descriptor.helperText ? (
                    <p className="text-xs text-muted-foreground">{descriptor.helperText}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-3">
                    {values.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Hozircha media tanlanmagan.</p>
                    ) : (
                      values.map((value, index) => {
                        const pendingEntry = pendingUploadsRef.current.get(value);
                        const resolvedUrl = resolveMediaUrl(value, pendingEntry?.path) ?? value;
                        const isPending = pendingEntry != null;
                        const lowerUrl = resolvedUrl.split("?")[0]?.toLowerCase() ?? "";
                        const isImage = Array.from(IMAGE_EXTENSIONS).some((extension) =>
                          lowerUrl.endsWith(`.${extension}`)
                        );
                        return (
                          <div
                            key={`${value}-${index}`}
                            className="group relative h-28 w-28 overflow-hidden rounded-md border"
                          >
                            {isImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={resolvedUrl} alt="Media preview" className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted p-3 text-center text-xs text-muted-foreground">
                                <FileText className="h-5 w-5" />
                                <a
                                  href={resolvedUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary underline"
                                >
                                  Faylni ko‘rish
                                </a>
                              </div>
                            )}
                            <button
                              type="button"
                              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity hover:bg-black/80 focus-visible:opacity-100 group-hover:opacity-100"
                              onClick={() => {
                                void handleRemove(value);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                            {isPending ? (
                              <span className="absolute left-1 top-1 rounded bg-primary/90 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-primary-foreground">
                                Yangi
                              </span>
                            ) : null}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
}
function SelectField({ descriptor }: { descriptor: Extract<FieldDescriptor, { type: "select" }> }) {
  const { control } = useFormContext();
  const EMPTY_OPTION_VALUE = "__empty__";
  const hasEmptyOption = descriptor.options?.some((option) => option.value === "");

  return (
    <FormField
      control={control}
      name={descriptor.name as never}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{descriptor.label}</FormLabel>
          <FormControl>
            <Select
              onValueChange={(value) => {
                if (hasEmptyOption && value === EMPTY_OPTION_VALUE) {
                  field.onChange(descriptor.valueType === "number" ? undefined : "");
                  return;
                }

                if (descriptor.valueType === "number") {
                  field.onChange(value ? Number(value) : undefined);
                } else {
                  field.onChange(value);
                }
              }}
              value={(function () {
                if (descriptor.valueType === "number") {
                  if (field.value != null) {
                    return String(field.value);
                  }
                  return hasEmptyOption ? EMPTY_OPTION_VALUE : undefined;
                }

                const stringValue = field.value as string | undefined;
                if (stringValue && stringValue !== "") {
                  return stringValue;
                }
                return hasEmptyOption ? EMPTY_OPTION_VALUE : undefined;
              })()}
            >
              <SelectTrigger>
                <SelectValue placeholder={descriptor.placeholder ?? "Tanlang"} />
              </SelectTrigger>
              <SelectContent>
                {descriptor.options?.map((option) => {
                  const optionValue = option.value === "" ? EMPTY_OPTION_VALUE : option.value;
                  return (
                    <SelectItem key={optionValue} value={optionValue}>
                      {option.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function MultilingualField({ descriptor }: { descriptor: Extract<FieldDescriptor, { type: "multilingual" }> }) {
  const { control } = useFormContext();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<typeof languages[number]["code"]>(language);

  useEffect(() => {
    setActiveTab(language);
  }, [language]);
  const fieldType = descriptor.kind ?? "text";

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground">{descriptor.label}</h4>
          <TabsList className="grid h-9 grid-cols-3">
            {languages.map((lang) => (
              <TabsTrigger key={lang.code} value={lang.code} className="text-xs">
                {lang.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {languages.map((lang) => (
          <TabsContent
            key={lang.code}
            value={lang.code}
            className={cn("space-y-2 pt-2", activeTab === lang.code ? "block" : "hidden")}
          >
            <FormField
              control={control}
              name={`${descriptor.baseName}${getLanguageSuffix(lang.code)}` as never}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    {descriptor.label} ({lang.label})
                  </FormLabel>
                  <FormControl>
                    {fieldType === "editor" ? (
                      <RichTextEditor
                        value={(field.value as string) ?? ""}
                        onChange={(content) => field.onChange(content)}
                        placeholder={descriptor.placeholder}
                        onBlur={() => field.onBlur()}
                        uploadCategory={descriptor.uploadCategory}
                      />
                    ) : fieldType === "textarea" ? (
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value)}
                        placeholder={descriptor.placeholder}
                        className="min-h-[120px]"
                      />
                    ) : (
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value)}
                        placeholder={descriptor.placeholder}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
