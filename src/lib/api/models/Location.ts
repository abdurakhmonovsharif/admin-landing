/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppointmentService } from './AppointmentService';
import type { LocalTime } from './LocalTime';
export type Location = {
  id?: number;
  nameUz?: string;
  nameRu?: string;
  nameEn?: string;
  mapTag?: string;
  openTime?: LocalTime;
  closeTime?: LocalTime;
  workDays?: Array<string>;
  address?: string;
  images?: Array<string>;
  createdAt?: string;
  updatedAt?: string;
  services?: Array<AppointmentService>;
};

