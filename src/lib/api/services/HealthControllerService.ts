/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HealthResponse } from '../models/HealthResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class HealthControllerService {
  /**
   * @returns HealthResponse OK
   * @throws ApiError
   */
  public static health(): CancelablePromise<HealthResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/health',
    });
  }
}
