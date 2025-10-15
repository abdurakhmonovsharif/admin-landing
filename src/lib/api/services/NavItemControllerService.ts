/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NavItem } from '../models/NavItem';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NavItemControllerService {
  /**
   * @returns NavItem OK
   * @throws ApiError
   */
  public static get3({
    id,
  }: {
    id: number,
  }): CancelablePromise<NavItem> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/nav-items/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns NavItem OK
   * @throws ApiError
   */
  public static update3({
    id,
    requestBody,
  }: {
    id: number,
    requestBody: NavItem,
  }): CancelablePromise<NavItem> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/nav-items/{id}',
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
  public static delete3({
    id,
  }: {
    id: number,
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/nav-items/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns NavItem OK
   * @throws ApiError
   */
  public static list3(): CancelablePromise<Array<NavItem>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/nav-items',
    });
  }
  /**
   * @returns NavItem Created
   * @throws ApiError
   */
  public static create3({
    requestBody,
  }: {
    requestBody: NavItem,
  }): CancelablePromise<NavItem> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/nav-items',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
