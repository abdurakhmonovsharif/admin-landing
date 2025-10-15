/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NavItemProduct } from './NavItemProduct';
export type NavItem = {
  id?: number;
  nameUz?: string;
  nameRu?: string;
  nameEn?: string;
  slug?: string;
  parent?: NavItem;
  children?: Array<NavItem>;
  products?: Array<NavItemProduct>;
  createdAt?: string;
  updatedAt?: string;
};

