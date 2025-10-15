/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export const $AppointmentService = {
  properties: {
    id: {
      type: 'number',
      format: 'int64',
    },
    appointment: {
      type: 'Appointment',
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
    descriptionUz: {
      type: 'string',
    },
    descriptionRu: {
      type: 'string',
    },
    descriptionEn: {
      type: 'string',
    },
    location: {
      type: 'Location',
    },
    date: {
      type: 'string',
      format: 'date',
    },
    time: {
      type: 'LocalTime',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
    },
    client: {
      type: 'ClientDetails',
    },
  },
} as const;
