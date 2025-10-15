import { OpenAPI } from "./index";

const defaultDevBaseUrl = "http://localhost:8080";
const localConfiguredBaseUrl = process.env.NEXT_PUBLIC_API_URL_LOCAL;
const prodConfiguredBaseUrl = process.env.NEXT_PUBLIC_API_URL_PROD;

const fallbackByEnvironment =
  process.env.NODE_ENV === "production"
    ? prodConfiguredBaseUrl ?? localConfiguredBaseUrl ?? defaultDevBaseUrl
    : localConfiguredBaseUrl ?? prodConfiguredBaseUrl ?? defaultDevBaseUrl;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? fallbackByEnvironment;

// Ensure the generated client uses the runtime base URL
OpenAPI.BASE = API_BASE_URL;

export * from "./index";
