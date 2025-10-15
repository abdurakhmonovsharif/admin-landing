/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Vacancy } from '../models/Vacancy';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VacancyControllerService {
  /**
   * @returns Vacancy OK
   * @throws ApiError
   */
  public static get({
    id,
  }: {
    id: number,
  }): CancelablePromise<Vacancy> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/vacancies/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns Vacancy OK
   * @throws ApiError
   */
  public static update({
    id,
    requestBody,
  }: {
    id: number,
    requestBody: Vacancy,
  }): CancelablePromise<Vacancy> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/vacancies/{id}',
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
  public static delete({
    id,
  }: {
    id: number,
  }): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/vacancies/{id}',
      path: {
        'id': id,
      },
    });
  }
  /**
   * @returns Vacancy OK
   * @throws ApiError
   */
  public static list(): CancelablePromise<Array<Vacancy>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/vacancies',
    });
  }
  /**
   * @returns Vacancy Created
   * @throws ApiError
   */
  public static create({
    requestBody,
  }: {
    requestBody: Vacancy,
  }): CancelablePromise<Vacancy> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/vacancies',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
