/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $ClientDetails = {
  properties: {
    id: {
      type: 'number',
      format: 'int64',
    },
    service: {
      type: 'AppointmentService',
    },
    firstname: {
      type: 'string',
    },
    lastname: {
      type: 'string',
    },
    email: {
      type: 'string',
    },
    phoneNumber: {
      type: 'string',
    },
    address: {
      type: 'string',
    },
    comment: {
      type: 'string',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
  },
} as const;
