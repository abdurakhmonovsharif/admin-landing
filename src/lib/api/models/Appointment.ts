/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppointmentService } from './AppointmentService';
export type Appointment = {
  id?: number;
  type?: 'personality' | 'store';
  titleUz?: string;
  titleRu?: string;
  titleEn?: string;
  createdAt?: string;
  updatedAt?: string;
  services?: Array<AppointmentService>;
};

