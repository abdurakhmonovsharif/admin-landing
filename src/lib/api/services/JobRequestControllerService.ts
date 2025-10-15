/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JobRequest } from '../models/JobRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class JobRequestControllerService {
  /**
   * @returns JobRequest OK
   * @throws ApiError
   */
  public static get7({
    id,
  }: {
    id: number,
  }): CancelablePromise<JobRequest> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/job-requests/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns JobRequest OK
   * @throws ApiError
   */
  public static update7({
    id,
    requestBody,
  }: {
    id: number,
    requestBody: JobRequest,
  }): CancelablePromise<JobRequest> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/job-requests/{id}',
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
  public static delete7({
    id,
  }: {
    id: number,
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/job-requests/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns JobRequest OK
   * @throws ApiError
   */
  public static list7(): CancelablePromise<Array<JobRequest>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/job-requests',
    });
  }
  /**
   * @returns JobRequest Created
   * @throws ApiError
   */
  public static create7({
    requestBody,
  }: {
    requestBody: JobRequest,
  }): CancelablePromise<JobRequest> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/job-requests',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
