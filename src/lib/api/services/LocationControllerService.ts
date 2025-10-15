/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Location } from '../models/Location';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LocationControllerService {
  /**
   * @returns Location OK
   * @throws ApiError
   */
  public static get5({
    id,
  }: {
    id: number,
  }): CancelablePromise<Location> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/locations/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns Location OK
   * @throws ApiError
   */
  public static update5({
    id,
    requestBody,
  }: {
    id: number,
    requestBody: Location,
  }): CancelablePromise<Location> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/locations/{id}',
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
  public static delete5({
    id,
  }: {
    id: number,
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/locations/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns Location OK
   * @throws ApiError
   */
  public static list5(): CancelablePromise<Array<Location>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/locations',
    });
  }
  /**
   * @returns Location Created
   * @throws ApiError
   */
  public static create5({
    requestBody,
  }: {
    requestBody: Location,
  }): CancelablePromise<Location> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/locations',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
