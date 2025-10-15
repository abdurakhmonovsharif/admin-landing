/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AppointmentService } from '../models/AppointmentService';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AppointmentServiceControllerService {
  /**
   * @returns AppointmentService OK
   * @throws ApiError
   */
  public static get13({
    id,
  }: {
    id: number,
  }): CancelablePromise<AppointmentService> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/appointment-services/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns AppointmentService OK
   * @throws ApiError
   */
  public static update13({
    id,
    requestBody,
  }: {
    id: number,
    requestBody: AppointmentService,
  }): CancelablePromise<AppointmentService> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/appointment-services/{id}',
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
  public static delete13({
    id,
  }: {
    id: number,
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/appointment-services/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns AppointmentService OK
   * @throws ApiError
   */
  public static list13(): CancelablePromise<Array<AppointmentService>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/appointment-services',
    });
  }
  /**
   * @returns AppointmentService Created
   * @throws ApiError
   */
  public static create13({
    requestBody,
  }: {
    requestBody: AppointmentService,
  }): CancelablePromise<AppointmentService> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/appointment-services',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
