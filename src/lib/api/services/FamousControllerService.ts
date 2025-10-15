/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Famous } from '../models/Famous';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FamousControllerService {
  /**
   * @returns Famous OK
   * @throws ApiError
   */
  public static get9({
    id,
  }: {
    id: number,
  }): CancelablePromise<Famous> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/famous/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns Famous OK
   * @throws ApiError
   */
  public static update9({
    id,
    requestBody,
  }: {
    id: number,
    requestBody: Famous,
  }): CancelablePromise<Famous> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/famous/{id}',
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
  public static delete9({
    id,
  }: {
    id: number,
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/famous/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns Famous OK
   * @throws ApiError
   */
  public static list9(): CancelablePromise<Array<Famous>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/famous',
    });
  }
  /**
   * @returns Famous Created
   * @throws ApiError
   */
  public static create9({
    requestBody,
  }: {
    requestBody: Famous,
  }): CancelablePromise<Famous> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/famous',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
