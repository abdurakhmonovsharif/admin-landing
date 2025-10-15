/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Contact = {
  properties: {
    id: {
      type: 'number',
      format: 'int64',
    },
    phoneNumber: {
      type: 'string',
    },
    email: {
      type: 'string',
    },
    address: {
      type: 'string',
    },
    socialMedia: {
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
  },
} as const;
