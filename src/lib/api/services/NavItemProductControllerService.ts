/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NavItemProduct } from '../models/NavItemProduct';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NavItemProductControllerService {
  /**
   * @returns NavItemProduct OK
   * @throws ApiError
   */
  public static get4({
    id,
  }: {
    id: number,
  }): CancelablePromise<NavItemProduct> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/nav-item-products/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns NavItemProduct OK
   * @throws ApiError
   */
  public static update4({
    id,
    requestBody,
  }: {
    id: number,
    requestBody: NavItemProduct,
  }): CancelablePromise<NavItemProduct> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/nav-item-products/{id}',
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
  public static delete4({
    id,
  }: {
    id: number,
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/nav-item-products/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns NavItemProduct OK
   * @throws ApiError
   */
  public static list4(): CancelablePromise<Array<NavItemProduct>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/nav-item-products',
    });
  }
  /**
   * @returns NavItemProduct Created
   * @throws ApiError
   */
  public static create4({
    requestBody,
  }: {
    requestBody: NavItemProduct,
  }): CancelablePromise<NavItemProduct> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/nav-item-products',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
