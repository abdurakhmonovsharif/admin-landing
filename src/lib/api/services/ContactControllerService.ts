/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Contact } from '../models/Contact';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ContactControllerService {
  /**
   * @returns Contact OK
   * @throws ApiError
   */
  public static get10({
    id,
  }: {
    id: number,
  }): CancelablePromise<Contact> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/contacts/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns Contact OK
   * @throws ApiError
   */
  public static update10({
    id,
    requestBody,
  }: {
    id: number,
    requestBody: Contact,
  }): CancelablePromise<Contact> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/contacts/{id}',
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
  public static delete10({
    id,
  }: {
    id: number,
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/contacts/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns Contact OK
   * @throws ApiError
   */
  public static list10(): CancelablePromise<Array<Contact>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/contacts',
    });
  }
  /**
   * @returns Contact Created
   * @throws ApiError
   */
  public static create10({
    requestBody,
  }: {
    requestBody: Contact,
  }): CancelablePromise<Contact> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/contacts',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
