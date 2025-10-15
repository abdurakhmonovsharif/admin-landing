/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Gallery } from '../models/Gallery';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GalleryControllerService {
  /**
   * @returns Gallery OK
   * @throws ApiError
   */
  public static get8({
    id,
  }: {
    id: number,
  }): CancelablePromise<Gallery> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/gallery/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns Gallery OK
   * @throws ApiError
   */
  public static update8({
    id,
    requestBody,
  }: {
    id: number,
    requestBody: Gallery,
  }): CancelablePromise<Gallery> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/gallery/{id}',
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
  public static delete8({
    id,
  }: {
    id: number,
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/gallery/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns Gallery OK
   * @throws ApiError
   */
  public static list8(): CancelablePromise<Array<Gallery>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/gallery',
    });
  }
  /**
   * @returns Gallery Created
   * @throws ApiError
   */
  public static create8({
    requestBody,
  }: {
    requestBody: Gallery,
  }): CancelablePromise<Gallery> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/gallery',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
