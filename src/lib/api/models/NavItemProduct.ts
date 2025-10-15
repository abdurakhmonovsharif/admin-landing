/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NavItem } from './NavItem';
export type NavItemProduct = {
  id?: number;
  navitem?: NavItem;
  img?: string;
  link?: string;
  parent?: NavItemProduct;
  children?: Array<NavItemProduct>;
  createdAt?: string;
};

