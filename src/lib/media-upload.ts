import { request as apiRequest } from "@/lib/api/core/request";
import { API_BASE_URL, OpenAPI } from "@/lib/api/client";

type UploadResponse = {
  filename?: string;
  path?: string;
  url?: string;
};

export type UploadedMedia = {
  url: string;
  path?: string;
  rawUrl?: string;
};

const sanitizeAbsoluteUrl = (value?: string | null): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed || !/^https?:\/\//i.test(trimmed)) {
    return undefined;
  }
  return trimmed.replace(/\/$/, "");
};

const STATIC_MEDIA_BASE_URL =
  sanitizeAbsoluteUrl(process.env.NEXT_PUBLIC_STORAGE_URL) ??
  sanitizeAbsoluteUrl(API_BASE_URL) ??
  sanitizeAbsoluteUrl(process.env.NEXT_PUBLIC_API_URL_PROD) ??
  sanitizeAbsoluteUrl(process.env.NEXT_PUBLIC_API_URL_LOCAL);

const resolveBaseUrl = (): string | undefined => {
  if (STATIC_MEDIA_BASE_URL) {
    return STATIC_MEDIA_BASE_URL;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  return undefined;
};

export const resolveMediaUrl = (url?: string, path?: string): string | undefined => {
  const base = resolveBaseUrl();

  if (url && url.length > 0) {
    if (/^https?:\/\//i.test(url)) {
      return url;
    }
    const normalized = url.startsWith("/") ? url.slice(1) : url;
    return base ? `${base}/${normalized}` : `/${normalized}`;
  }

  if (path && path.length > 0) {
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    return base ? `${base}/files/${normalizedPath}` : `/files/${normalizedPath}`;
  }

  return undefined;
};

export const uploadMediaFile = async (category: string, file: File): Promise<UploadedMedia> => {
  const response = await apiRequest<UploadResponse>(OpenAPI, {
    method: "POST",
    url: "/api/files/{category}",
    path: { category },
    formData: { file },
    mediaType: "multipart/form-data",
  });

  const resolvedUrl = resolveMediaUrl(response?.url, response?.path);
  if (!resolvedUrl) {
    throw new Error("Serverdan fayl URL topilmadi");
  }

  return {
    url: resolvedUrl,
    path: response?.path,
    rawUrl: response?.url ?? resolvedUrl,
  };
};

export const deleteMediaFile = async (target: { path?: string | null; url?: string | null }): Promise<void> => {
  const value = target.path ?? target.url;
  if (!value) return;

  await apiRequest(OpenAPI, {
    method: "DELETE",
    url: "/api/files",
    query: { path: value },
  });
};
