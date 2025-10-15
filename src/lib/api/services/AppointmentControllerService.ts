/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Appointment } from '../models/Appointment';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AppointmentControllerService {
  /**
   * @returns Appointment OK
   * @throws ApiError
   */
  public static get12({
    id,
  }: {
    id: number,
  }): CancelablePromise<Appointment> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/appointments/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns Appointment OK
   * @throws ApiError
   */
  public static update12({
    id,
    requestBody,
  }: {
    id: number,
    requestBody: Appointment,
  }): CancelablePromise<Appointment> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/appointments/{id}',
      path: {
        'id': id,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * @returns void
   * @throws ApiError
   */
  public static delete12({
    id,
  }: {
    id: number,
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/appointments/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns Appointment OK
   * @throws ApiError
   */
  public static list12(): CancelablePromise<Array<Appointment>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/appointments',
    });
  }
  /**
   * @returns Appointment Created
   * @throws ApiError
   */
  public static create12({
    requestBody,
  }: {
    requestBody: Appointment,
  }): CancelablePromise<Appointment> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/appointments',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
