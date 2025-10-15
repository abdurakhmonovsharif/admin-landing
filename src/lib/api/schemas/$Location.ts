/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Location = {
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
    mapTag: {
      type: 'string',
    },
    openTime: {
      type: 'LocalTime',
    },
    closeTime: {
      type: 'LocalTime',
    },
    workDays: {
      type: 'array',
      contains: {
        type: 'string',
      },
    },
    address: {
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
    services: {
      type: 'array',
      contains: {
        type: 'AppointmentService',
      },
    },
  },
} as const;
