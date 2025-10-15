/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Journal } from '../models/Journal';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class JournalControllerService {
  /**
   * @returns Journal OK
   * @throws ApiError
   */
  public static get6({
    id,
  }: {
    id: number,
  }): CancelablePromise<Journal> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/journals/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns Journal OK
   * @throws ApiError
   */
  public static update6({
    id,
    requestBody,
  }: {
    id: number,
    requestBody: Journal,
  }): CancelablePromise<Journal> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/journals/{id}',
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
  public static delete6({
    id,
  }: {
    id: number,
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/journals/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns Journal OK
   * @throws ApiError
   */
  public static list6(): CancelablePromise<Array<Journal>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/journals',
    });
  }
  /**
   * @returns Journal Created
   * @throws ApiError
   */
  public static create6({
    requestBody,
  }: {
    requestBody: Journal,
  }): CancelablePromise<Journal> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/journals',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
