/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { News } from '../models/News';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NewsControllerService {
  /**
   * @returns News OK
   * @throws ApiError
   */
  public static get2({
    id,
  }: {
    id: number,
  }): CancelablePromise<News> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/news/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns News OK
   * @throws ApiError
   */
  public static update2({
    id,
    requestBody,
  }: {
    id: number,
    requestBody: News,
  }): CancelablePromise<News> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/news/{id}',
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
  public static delete2({
    id,
  }: {
    id: number,
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/news/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns News OK
   * @throws ApiError
   */
  public static list2(): CancelablePromise<Array<News>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/news',
    });
  }
  /**
   * @returns News Created
   * @throws ApiError
   */
  public static create2({
    requestBody,
  }: {
    requestBody: News,
  }): CancelablePromise<News> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/news',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
