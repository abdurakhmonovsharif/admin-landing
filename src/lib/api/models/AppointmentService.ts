/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Appointment } from './Appointment';
import type { ClientDetails } from './ClientDetails';
import type { LocalTime } from './LocalTime';
import type { Location } from './Location';
export type AppointmentService = {
  id?: number;
  appointment?: Appointment;
  titleUz?: string;
  titleRu?: string;
  titleEn?: string;
  descriptionUz?: string;
  descriptionRu?: string;
  descriptionEn?: string;
  location?: Location;
  date?: string;
  time?: LocalTime;
  createdAt?: string;
  updatedAt?: string;
  client?: ClientDetails;
};

