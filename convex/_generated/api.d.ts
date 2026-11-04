/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminAuth from "../adminAuth.js";
import type * as adminGuard from "../adminGuard.js";
import type * as adminProducts from "../adminProducts.js";
import type * as analytics from "../analytics.js";
import type * as auditLog from "../auditLog.js";
import type * as brands from "../brands.js";
import type * as customerAddresses from "../customerAddresses.js";
import type * as customerAuth from "../customerAuth.js";
import type * as customers from "../customers.js";
import type * as delivery from "../delivery.js";
import type * as discounts from "../discounts.js";
import type * as files from "../files.js";
import type * as inventory from "../inventory.js";
import type * as messages from "../messages.js";
import type * as newsletter from "../newsletter.js";
import type * as notifications from "../notifications.js";
import type * as orders from "../orders.js";
import type * as prescriptions from "../prescriptions.js";
import type * as products from "../products.js";
import type * as refillReminders from "../refillReminders.js";
import type * as reviews from "../reviews.js";
import type * as settings from "../settings.js";
import type * as staff from "../staff.js";
import type * as taxonomy from "../taxonomy.js";
import type * as throttle from "../throttle.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminAuth: typeof adminAuth;
  adminGuard: typeof adminGuard;
  adminProducts: typeof adminProducts;
  analytics: typeof analytics;
  auditLog: typeof auditLog;
  brands: typeof brands;
  customerAddresses: typeof customerAddresses;
  customerAuth: typeof customerAuth;
  customers: typeof customers;
  delivery: typeof delivery;
  discounts: typeof discounts;
  files: typeof files;
  inventory: typeof inventory;
  messages: typeof messages;
  newsletter: typeof newsletter;
  notifications: typeof notifications;
  orders: typeof orders;
  prescriptions: typeof prescriptions;
  products: typeof products;
  refillReminders: typeof refillReminders;
  reviews: typeof reviews;
  settings: typeof settings;
  staff: typeof staff;
  taxonomy: typeof taxonomy;
  throttle: typeof throttle;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
