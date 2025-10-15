/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserEmail } from '../models/UserEmail';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserEmailControllerService {
  /**
   * @returns UserEmail OK
   * @throws ApiError
   */
  public static get1({
    id,
  }: {
    id: number,
  }): CancelablePromise<UserEmail> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/user-emails/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns UserEmail OK
   * @throws ApiError
   */
  public static update1({
    id,
    requestBody,
  }: {
    id: number,
    requestBody: UserEmail,
  }): CancelablePromise<UserEmail> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/user-emails/{id}',
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
  public static delete1({
    id,
  }: {
    id: number,
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/user-emails/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns UserEmail OK
   * @throws ApiError
   */
  public static list1(): CancelablePromise<Array<UserEmail>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/user-emails',
    });
  }
  /**
   * @returns UserEmail Created
   * @throws ApiError
   */
  public static create1({
    requestBody,
  }: {
    requestBody: UserEmail,
  }): CancelablePromise<UserEmail> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/user-emails',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
