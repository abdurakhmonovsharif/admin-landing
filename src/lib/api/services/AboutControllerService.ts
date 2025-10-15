/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { About } from '../models/About';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AboutControllerService {
  /**
   * @returns About OK
   * @throws ApiError
   */
  public static get14({
    id,
  }: {
    id: number,
  }): CancelablePromise<About> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/about-sections/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns About OK
   * @throws ApiError
   */
  public static update14({
    id,
    requestBody,
  }: {
    id: number,
    requestBody: About,
  }): CancelablePromise<About> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/about-sections/{id}',
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
  public static delete14({
    id,
  }: {
    id: number,
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/about-sections/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns About OK
   * @throws ApiError
   */
  public static list14(): CancelablePromise<Array<About>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/about-sections',
    });
  }
  /**
   * @returns About Created
   * @throws ApiError
   */
  public static create14({
    requestBody,
  }: {
    requestBody: About,
  }): CancelablePromise<About> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/about-sections',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
