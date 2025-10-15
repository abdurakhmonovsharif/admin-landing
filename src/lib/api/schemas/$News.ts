/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $News = {
  properties: {
    id: {
      type: 'number',
      format: 'int64',
    },
    titleUz: {
      type: 'string',
    },
    titleRu: {
      type: 'string',
    },
    titleEn: {
      type: 'string',
    },
    bodyUz: {
      type: 'string',
    },
    bodyRu: {
      type: 'string',
    },
    bodyEn: {
      type: 'string',
    },
    images: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
    },
    publishedAt: {
      type: 'string',
      format: 'date-time',
    },
  },
} as const;
