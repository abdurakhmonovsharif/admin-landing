"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import type QuillType from "quill";
import type { Range as RangeStatic } from "quill";

import "quill/dist/quill.snow.css";

import { cn } from "@/lib/utils";
import { useEditorUploadsContext } from "@/contexts/editor-uploads-context";
import { deleteMediaFile, uploadMediaFile, type UploadedMedia } from "@/lib/media-upload";

type QuillInstance = QuillType;
type VideoFormatCtor = typeof import("quill/formats/video").default;
type BlockEmbedCtor = typeof import("quill/blots/block").BlockEmbed;
type TableModuleCtor = typeof import("quill/modules/table").default;
type TableModuleInstance = InstanceType<TableModuleCtor>;

let videoFormatEnhanced = false;
let audioBlotRegistered = false;
let tableModuleRegistered = false;

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ size: ["small", false, "large", "huge"] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
  [{ align: [] }],
  ["blockquote", "code-block"],
  ["link", "image", "video", "table"],
  ["clean"],          
] as const;

const FORMATS = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "script",
  "list",
  "indent",
  "align",
  "blockquote",
  "code-block",
  "link",
  "image",
  "video",
  "audio",
  "table",
  "table-row",
  "table-body",
  "table-container",
] as const;

export type RichTextEditorProps = {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  onBlur?: () => void;
  onFocus?: () => void;
  uploadCategory?: string;
};

export function RichTextEditor({
  value,
  onChange,
  className,
  placeholder,
  onBlur,
  onFocus,
  uploadCategory,
}: RichTextEditorProps) {
  const normalizedValue = value ?? "";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<QuillInstance | null>(null);
  const lastHtmlRef = useRef<string>("");
  const initialValueRef = useRef(normalizedValue);
  const [isReady, setIsReady] = useState(false);
  const onChangeRef = useRef(onChange);
  const onFocusRef = useRef(onFocus);
  const onBlurRef = useRef(onBlur);
  const uploadsRegistry = useEditorUploadsContext();
  const pendingUploadsRef = useRef(new Map<string, UploadedMedia>());
  const hasCommittedRef = useRef(false);

  const modules = useMemo(
    () => ({
      toolbar: { container: TOOLBAR_OPTIONS },
      history: { delay: 500, maxStack: 200, userOnly: true },
      clipboard: { matchVisual: true },
      table: true,
    }),
    []
  );

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onFocusRef.current = onFocus;
  }, [onFocus]);

  useEffect(() => {
    onBlurRef.current = onBlur;
  }, [onBlur]);

  const sanitizeHtml = useCallback((html: string) => {
    if (!html) return "";
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    const hasMedia = wrapper.querySelector("img,video,iframe,audio") !== null;
    const hasTable = wrapper.querySelector("table") !== null;
    const text = wrapper.textContent?.replace(/\u00a0/g, " ").trim() ?? "";
    if (!hasMedia && !hasTable && text.length === 0) {
      return "";
    }
    return html;
  }, []);

  const deleteUploadedFile = useCallback(async (entry: UploadedMedia) => {
    try {
      await deleteMediaFile({ path: entry.path, url: entry.rawUrl ?? entry.url });
    } catch (error) {
      console.error("Failed to delete uploaded file", error);
      const description = error instanceof Error ? error.message : undefined;
      toast.error("Faylni o'chirishda xatolik", { description });
    }
  }, []);

  const removeUploadByUrl = useCallback(
    async (url: string) => {
      const entry = pendingUploadsRef.current.get(url);
      if (!entry) return;
      pendingUploadsRef.current.delete(url);
      await deleteUploadedFile(entry);
    },
    [deleteUploadedFile]
  );

  const cleanupRemovedUploads = useCallback(
    (html: string) => {
      const uploads = Array.from(pendingUploadsRef.current.keys());
      uploads.forEach((url) => {
        if (!html.includes(url)) {
          void removeUploadByUrl(url);
        }
      });
    },
    [removeUploadByUrl]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      const categoryRaw = uploadCategory?.trim();
      const category = categoryRaw && categoryRaw.length > 0 ? categoryRaw : "general";

      try {
        const uploaded = await uploadMediaFile(category, file);

        pendingUploadsRef.current.set(uploaded.url, uploaded);
        hasCommittedRef.current = false;

        return uploaded.url;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Fayl yuklashda xatolik yuz berdi");
      }
    },
    [uploadCategory]
  );

  const pickFileAndInsert = useCallback(
    (accept: string, embed: "image" | "video") => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = accept;
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        const quill = quillRef.current;
        if (!quill) return;

        try {
          const fileUrl = await uploadFile(file);
          const range = quill.getSelection(true);
          const index = range ? range.index : quill.getLength();

          if (embed === "image" || file.type.startsWith("image/")) {
            quill.insertEmbed(index, "image", fileUrl, "user");
            quill.setSelection(index + 1, 0, "silent");
            return;
          }

          if (file.type.startsWith("audio/")) {
            quill.insertEmbed(index, "audio", { src: fileUrl, title: file.name }, "user");
            quill.setSelection(index + 1, 0, "silent");
            return;
          }

          quill.insertEmbed(index, "video", fileUrl, "user");
          quill.setSelection(index + 1, 0, "silent");
        } catch (error) {
          console.error("Failed to upload file", error);
          const description = error instanceof Error ? error.message : undefined;
          toast.error("Faylni yuklashda xatolik", {
            description,
          });
        }
      };
      input.click();
    },
    [uploadFile]
  );

  const discardUploads = useCallback(async () => {
    const uploads = Array.from(pendingUploadsRef.current.values());
    pendingUploadsRef.current.clear();
    if (uploads.length === 0) return;
    await Promise.allSettled(uploads.map((entry) => deleteUploadedFile(entry)));
  }, [deleteUploadedFile]);

  const commitUploads = useCallback(() => {
    hasCommittedRef.current = true;
    pendingUploadsRef.current.clear();
  }, []);

  useEffect(() => {
    if (!uploadsRegistry) return;
    const handle = {
      discardUploads,
      commitUploads,
    };
    return uploadsRegistry.register(handle);
  }, [uploadsRegistry, discardUploads, commitUploads]);

  useEffect(() => {
    let isMounted = true;
    const container = containerRef.current;
    let quillInstance: QuillInstance;
    let cleanupHandlers: (() => void) | undefined;

    (async () => {
      const [{ default: Quill }, { default: TableModule }] = await Promise.all([
        import("quill"),
        import("quill/modules/table"),
      ]);

      if (!tableModuleRegistered) {
        TableModule.register();
        Quill.register("modules/table", TableModule, true);
        tableModuleRegistered = true;
      }

      if (!videoFormatEnhanced) {
        const BaseVideo = Quill.import("formats/video") as VideoFormatCtor;
        class EnhancedVideo extends BaseVideo {
          static create(value: string) {
            if (typeof value === "string" && value.startsWith("data:")) {
              const node = document.createElement("video");
              node.classList.add("ql-video");
              node.setAttribute("controls", "");
              node.setAttribute("playsinline", "");
              node.setAttribute("src", value);
              return node;
            }
            return super.create(value);
          }

          static value(node: HTMLElement) {
            if (node.tagName === "VIDEO") {
              return node.getAttribute("src") ?? "";
            }
            return super.value(node);
          }
        }
        Quill.register(EnhancedVideo, true);
        videoFormatEnhanced = true;
      }

      if (!audioBlotRegistered) {
        const BlockEmbed = Quill.import("blots/block/embed") as BlockEmbedCtor;
        class AudioBlot extends BlockEmbed {
          static blotName = "audio";
          static tagName = "audio";
          static className = "ql-audio";

          static create(value: { src: string; title?: string } | string) {
            const node = super.create() as HTMLAudioElement;
            node.setAttribute("controls", "");
            node.setAttribute("preload", "metadata");
            const payload = typeof value === "string" ? { src: value } : value;
            node.setAttribute("src", payload.src);
            if (payload.title) {
              node.setAttribute("title", payload.title);
            }
            return node;
          }

          static value(node: HTMLElement) {
            return node.getAttribute("src") ?? "";
          }
        }

        Quill.register(AudioBlot, true);
        audioBlotRegistered = true;
      }
      if (!isMounted || !container) return;

      container.innerHTML = "";

      quillInstance = new Quill(container, {
        theme: "snow",
        modules,
        formats: [...FORMATS],
        placeholder: placeholder ?? "",
      });

      quillRef.current = quillInstance;

      quillInstance.root.style.minHeight = "200px";
      quillInstance.root.style.padding = "1rem";
      quillInstance.root.style.fontSize = "14px";
      quillInstance.root.style.lineHeight = "1.6";

      const toolbar = quillInstance.getModule("toolbar") as { addHandler?: (name: string, handler: () => void) => void; container?: HTMLElement } | undefined;
      const tableModule = quillInstance.getModule("table") as TableModuleInstance | undefined;
      toolbar?.addHandler?.("image", () => pickFileAndInsert("image/*", "image"));
      toolbar?.addHandler?.("video", () => pickFileAndInsert("video/*,audio/*", "video"));
      toolbar?.addHandler?.("table", () => {
        if (!tableModule) return;
        if (typeof window === "undefined") return;
        const [table] = tableModule.getTable();
        if (!table) {
          const sizeInput = window.prompt(
            "Jadval o'lchamini kiriting (qator x ustun, masalan 3x4)",
            "2x2"
          );
          if (!sizeInput) return;
          const normalized = sizeInput.toLowerCase().replace(/\s+/g, "");
          const match = normalized.match(/^(\d+)(?:x|,)(\d+)$/);
          if (!match) {
            return;
          }
          let rows = Number.parseInt(match[1], 10);
          let columns = Number.parseInt(match[2], 10);
          if (!Number.isFinite(rows) || !Number.isFinite(columns)) return;
          rows = Math.min(Math.max(rows, 1), 20);
          columns = Math.min(Math.max(columns, 1), 20);
          tableModule.insertTable(rows, columns);
          return;
        }

        const action = window.prompt(
          [
            "Jadval amali tanlang:",
            "1 - Qator yuqoriga qo'shish",
            "2 - Qator pastga qo'shish",
            "3 - Ustun chapga qo'shish",
            "4 - Ustun o'ngga qo'shish",
            "5 - Qatorni o'chirish",
            "6 - Ustunni o'chirish",
            "7 - Jadvalni o'chirish",
          ].join("\n"),
          "1"
        );
        switch (action) {
          case "1":
            tableModule.insertRowAbove();
            break;
          case "2":
            tableModule.insertRowBelow();
            break;
          case "3":
            tableModule.insertColumnLeft();
            break;
          case "4":
            tableModule.insertColumnRight();
            break;
          case "5":
            tableModule.deleteRow();
            break;
          case "6":
            tableModule.deleteColumn();
            break;
          case "7":
            tableModule.deleteTable();
            break;
          default:
            break;
        }
      });

      const handleTextChange = (_delta: unknown, _oldDelta: unknown, source: string) => {
        if (source !== "user") return;
        const html = quillInstance.root.innerHTML;
        const sanitized = sanitizeHtml(html);
        lastHtmlRef.current = sanitized;
        onChangeRef.current(sanitized);
        cleanupRemovedUploads(sanitized);
      };

      const handleSelectionChange = (range: RangeStatic | null, oldRange: RangeStatic | null, source: string) => {
        if (source !== "user") return;
        if (range && !oldRange) {
          onFocusRef.current?.();
        }
        if (!range && oldRange) {
          onBlurRef.current?.();
        }
      };

      quillInstance.on("text-change", handleTextChange);
      quillInstance.on("selection-change", handleSelectionChange);

      const initialContent = sanitizeHtml(initialValueRef.current);
      if (initialContent) {
        quillInstance.clipboard.dangerouslyPasteHTML(initialContent, "silent");
      } else {
        quillInstance.setText("", "silent");
      }
      lastHtmlRef.current = sanitizeHtml(quillInstance.root.innerHTML);

      cleanupHandlers = () => {
        quillInstance.off("text-change", handleTextChange);
        quillInstance.off("selection-change", handleSelectionChange);
      };

      setIsReady(true);
    })();

    return () => {
      isMounted = false;
      cleanupHandlers?.();
      quillRef.current = null;
      if (container) {
        container.innerHTML = "";
      }
      setIsReady(false);
    };
  }, [modules, pickFileAndInsert, placeholder, sanitizeHtml, cleanupRemovedUploads]);

  useEffect(() => {
    if (!isReady) return;
    const quill = quillRef.current;
    if (!quill) return;

    const root = quill.root;

    const insertFiles = async (files: File[], startIndex?: number) => {
      const editor = quillRef.current;
      if (!editor) return;
      let index = startIndex ?? editor.getSelection(true)?.index ?? editor.getLength();

      for (const file of files) {
        if (!file) continue;
        try {
          const fileUrl = await uploadFile(file);
          if (file.type.startsWith("image/")) {
            editor.insertEmbed(index, "image", fileUrl, "user");
          } else if (file.type.startsWith("audio/")) {
            editor.insertEmbed(index, "audio", { src: fileUrl, title: file.name }, "user");
          } else {
            editor.insertEmbed(index, "video", fileUrl, "user");
          }
          index += 1;
        } catch (error) {
          console.error("Failed to upload file from clipboard", error);
          const description = error instanceof Error ? error.message : undefined;
          toast.error("Faylni yuklashda xatolik", { description });
        }
      }

      editor.setSelection(index, 0, "silent");
      editor.focus();
      return index;
    };

    const handlePaste = (event: ClipboardEvent) => {
      const clipboardData = event.clipboardData;
      if (!clipboardData) return;
      const fileItems = Array.from(clipboardData.items ?? []).filter((item) => item.kind === "file");
      if (fileItems.length === 0) return;

      const files = fileItems
        .map((item) => item.getAsFile())
        .filter((file): file is File => Boolean(file));
      if (files.length === 0) return;

      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") {
        event.stopImmediatePropagation();
      }
      const editor = quillRef.current;
      if (!editor) return;

      const selection = editor.getSelection(true);
      const startIndex = selection ? selection.index : editor.getLength();
      const plainText = clipboardData.getData("text/plain");

      void (async () => {
        const nextIndex = await insertFiles(files, startIndex);
        if (plainText && plainText.trim().length > 0 && quillRef.current) {
          const editorInstance = quillRef.current;
          const insertionIndex = typeof nextIndex === "number" ? nextIndex : startIndex;
          editorInstance.insertText(insertionIndex, plainText, "user");
          editorInstance.setSelection(insertionIndex + plainText.length, 0, "silent");
        }
      })();
    };

    const handleDrop = (event: DragEvent) => {
      const dataTransfer = event.dataTransfer;
      if (!dataTransfer) return;
      const files = Array.from(dataTransfer.files ?? []);
      if (files.length === 0) return;

      event.preventDefault();
      dataTransfer.dropEffect = "copy";
      const editor = quillRef.current;
      if (!editor) return;

      editor.focus();
      const selection = editor.getSelection(true);
      const startIndex = selection ? selection.index : editor.getLength();

      void insertFiles(files, startIndex);
    };

    const handleDragOver = (event: DragEvent) => {
      if (!event.dataTransfer) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    };

    const pasteCapture = true;
    root.addEventListener("paste", handlePaste, pasteCapture);
    root.addEventListener("drop", handleDrop);
    root.addEventListener("dragover", handleDragOver);

    return () => {
      root.removeEventListener("paste", handlePaste, pasteCapture);
      root.removeEventListener("drop", handleDrop);
      root.removeEventListener("dragover", handleDragOver);
    };
  }, [isReady, uploadFile]);

  useEffect(() => {
    return () => {
      if (!hasCommittedRef.current) {
        void discardUploads();
      }
    };
  }, [discardUploads]);

  useEffect(() => {
    if (placeholder == null) return;
    const quill = quillRef.current;
    if (!quill) return;
    quill.root.setAttribute("data-placeholder", placeholder);
  }, [placeholder]);

  useEffect(() => {
    if (!isReady) {
      initialValueRef.current = normalizedValue;
    }
  }, [isReady, normalizedValue]);

  useEffect(() => {
    if (!isReady) return;
    const quill = quillRef.current;
    if (!quill) return;

    const sanitized = sanitizeHtml(normalizedValue);
    if (sanitized === lastHtmlRef.current) return;

    if (!sanitized) {
      quill.setText("", "silent");
      lastHtmlRef.current = "";
      return;
    }

    const selection = quill.getSelection();
    quill.clipboard.dangerouslyPasteHTML(sanitized, "silent");
    if (selection) {
      const length = quill.getLength();
      const index = Math.min(selection.index, Math.max(length - 1, 0));
      quill.setSelection(index, selection.length, "silent");
    }
    lastHtmlRef.current = sanitizeHtml(quill.root.innerHTML);
  }, [isReady, normalizedValue, sanitizeHtml]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div ref={containerRef} className="quill-editor" />
      </div>
    </div>
  );
}
