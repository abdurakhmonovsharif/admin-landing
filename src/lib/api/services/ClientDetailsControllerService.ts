/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClientDetails } from '../models/ClientDetails';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ClientDetailsControllerService {
  /**
   * @returns ClientDetails OK
   * @throws ApiError
   */
  public static get11({
    id,
  }: {
    id: number,
  }): CancelablePromise<ClientDetails> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/client-details/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns ClientDetails OK
   * @throws ApiError
   */
  public static update11({
    id,
    requestBody,
  }: {
    id: number,
    requestBody: ClientDetails,
  }): CancelablePromise<ClientDetails> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/client-details/{id}',
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
  public static delete11({
    id,
  }: {
    id: number,
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/client-details/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns ClientDetails OK
   * @throws ApiError
   */
  public static list11(): CancelablePromise<Array<ClientDetails>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/client-details',
    });
  }
  /**
   * @returns ClientDetails Created
   * @throws ApiError
   */
  public static create11({
    requestBody,
  }: {
    requestBody: ClientDetails,
  }): CancelablePromise<ClientDetails> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/client-details',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
