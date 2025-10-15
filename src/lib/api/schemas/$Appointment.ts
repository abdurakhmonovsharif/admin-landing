/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $Appointment = {
  properties: {
    id: {
      type: 'number',
      format: 'int64',
    },
    type: {
      type: 'Enum',
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
