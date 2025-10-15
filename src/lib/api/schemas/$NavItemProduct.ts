/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $NavItemProduct = {
  properties: {
    id: {
      type: 'number',
      format: 'int64',
    },
    navitem: {
      type: 'NavItem',
    },
    img: {
      type: 'string',
    },
    link: {
      type: 'string',
    },
    parent: {
      type: 'NavItemProduct',
    },
    children: {
      type: 'array',
      contains: {
        type: 'NavItemProduct',
      },
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
  },
} as const;
