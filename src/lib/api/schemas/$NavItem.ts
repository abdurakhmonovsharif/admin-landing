/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $NavItem = {
  properties: {
    id: {
      type: 'number',
      format: 'int64',
    },
    nameUz: {
      type: 'string',
    },
    nameRu: {
      type: 'string',
    },
    nameEn: {
      type: 'string',
    },
    slug: {
      type: 'string',
    },
    parent: {
      type: 'NavItem',
    },
    children: {
      type: 'array',
      contains: {
        type: 'NavItem',
      },
    },
    products: {
      type: 'array',
      contains: {
        type: 'NavItemProduct',
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
  },
} as const;
