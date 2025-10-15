/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HelloResponse } from '../models/HelloResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class HelloControllerService {
  /**
   * @returns HelloResponse OK
   * @throws ApiError
   */
  public static hello(): CancelablePromise<HelloResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/',
    });
  }
}
