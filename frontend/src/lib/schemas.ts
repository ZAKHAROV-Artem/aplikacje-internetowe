import { z } from "zod";

// ============================================================================
// COMMON VALIDATION SCHEMAS
// ============================================================================

/**
 * Common validation patterns used across the application
 */
export const commonSchemas = {
  // Email validation
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  // Phone number validation (E.164 format)
  phone: z
    .string()
    .min(4, "Enter your phone number")
    .regex(/^\d+$/, "Digits only"),

  // Dial code validation
  dialCode: z.string().min(1, "Dial code is required"),

  // Name validation
  firstName: z.string().trim().min(1, "Please enter your first name"),
  lastName: z.string().trim().min(1, "Please enter your last name"),

  // Address validation
  street: z.string().trim().min(1, "Please enter your street address"),
  city: z.string().trim().min(1, "Please enter your city"),
  state: z.string().trim().min(1, "Please select your state"),
  zip: z
    .string()
    .trim()
    .min(5, "Please enter a valid ZIP code (at least 5 digits)")
    .regex(/^\d{5}(-\d{4})?$/, "Please enter a valid ZIP code format"),

  // Date validation
  date: z.date(),

  // Part of day validation
  partOfDay: z.enum(["AM", "PM"]),

  // Route ID validation
  routeId: z.string().min(1, "Please select a route"),

  // Notes validation (optional)
  notes: z.string().default(""),
} as const;

// ============================================================================
// FORM SCHEMAS
// ============================================================================

/**
 * Email authentication form schema
 */
export const emailAuthSchema = z.object({
  email: commonSchemas.email,
});

/**
 * Phone authentication form schema
 */
export const phoneAuthSchema = z.object({
  phone: commonSchemas.phone,
  dialCode: commonSchemas.dialCode,
});

/**
 * Password authentication form schema
 */
export const passwordLoginSchema = z.object({
  email: commonSchemas.email,
  password: z.string().min(1, "Password is required"),
});

/**
 * Onboarding form schema for user profile setup
 */
export const onboardingSchema = z.object({
  firstName: commonSchemas.firstName,
  lastName: commonSchemas.lastName,
  street: commonSchemas.street,
  city: commonSchemas.city,
  stateVal: commonSchemas.state,
  zip: commonSchemas.zip,
});

/**
 * Address edit form schema
 */
export const addressEditSchema = z.object({
  address: commonSchemas.street,
  city: commonSchemas.city,
  state: commonSchemas.state,
  zip: commonSchemas.zip,
});

/**
 * Update user form schema
 */
export const updateUserSchema = z.object({
  firstName: commonSchemas.firstName,
  lastName: commonSchemas.lastName,
  role: z.enum(["ADMIN", "COMPANY_MANAGER", "USER"], {
    required_error: "Please select a role",
  }),
});

// ============================================================================
// INFERRED TYPES
// ============================================================================

/**
 * TypeScript types inferred from Zod schemas
 */
export type EmailAuthFormValues = z.infer<typeof emailAuthSchema>;
export type PhoneAuthFormValues = z.infer<typeof phoneAuthSchema>;
export type PasswordLoginFormValues = z.infer<typeof passwordLoginSchema>;
export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
export type AddressEditFormValues = z.infer<typeof addressEditSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Generic API response wrapper that matches the backend response structure
 * {
 *   "success": boolean,
 *   "data": T
 * }
 */
export type ApiResponse<T = unknown> = {
  success: boolean;
  data: T;
};

/**
 * Alias used in places where we previously modeled an extra envelope.
 * The backend returns { success, data: T } so this is identical to ApiResponse.
 */
export type ApiResponseData<T = unknown> = ApiResponse<T>;

// ============================================================================
// DOMAIN TYPES
// ============================================================================

/**
 * Address type used throughout the application
 */
export type Address = {
  street: string;
  city: string;
  state: string;
  zip: string;
};

/**
 * Customer information type
 */
export type Customer = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
};

/**
 * Order type for pickup requests
 */
export type Order = {
  id: string;
  firstName: string;
  lastName: string;
  address: Address;
  customerID: string;
  phone: string;
  pickupDate: string; // ISO date string
  dropoffDate: string; // ISO date string
  status?: "pending" | "scheduled" | "completed" | "cancelled";
  createdAt?: string;
};

/**
 * Order creation payload type
 */
export type OrderCreatePayload = {
  firstName: string;
  lastName: string;
  address:
    | Address
    | {
        name?: string;
        address?: string;
        city?: string;
        state?: string;
        zip?: string;
      };
  phone: string;
  pickupDate: string;
  dropoffDate: string;
  notes?: string;
  customer?: Customer;
};

/**
 * Pickup route type
 */
export type PickupRoute = {
  id: string;
  name: string;
  zipCodes: string[];
  weekdays: string[];
  startTimeMins: number;
  endTimeMins: number;
  pricelistId: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
};

/**
 * Pickup address type
 */
export type PickupAddress = {
  id: string;
  magnoliCustomerId: string | null;
  customerId: string;
  name: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string | null;
  owner: string;
  active: boolean;
  default: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * Pickup request type
 */
export type PickupRequest = {
  id: string;
  magnoliCustomerId?: string | null;
  customerId: string;
  addressId: string;
  routeId: string;
  routeOverride: boolean;
  status: string; // e.g. "new", "scheduled", etc.
  orderDate: string; // ISO datetime
  dueDate: string; // ISO datetime
  metadata?: {
    notes?: string | null;
    pickupPartOfDay?: string | null;
    dropoffPartOfDay?: string | null;
  };
  driverId: string | null;
  detailedById?: string | null;
  updatedAt: string; // ISO datetime
  route?: PickupRoute;
  address?: PickupAddress;
  customer?: Customer;
  magnoliCustomer?: { id: string; name: string };
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Utility type for form state management
 */
export type FormState<T> = {
  values: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
};

/**
 * Utility type for API error handling
 */
export type ApiError = {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
};

/**
 * Utility type for navigation state
 */
export type NavigationState = {
  from?: string;
  initialValues?: Record<string, unknown>;
  formValues?: Record<string, unknown>;
  restoreForm?: Record<string, unknown>;
};

// ============================================================================
// CRM ORDERS RESPONSE TYPES
// ============================================================================

/**
 * Customer information in CRM orders response
 */
export type CrmCustomer = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
};

/**
 * Address information in CRM orders response
 */
export type CrmAddress = {
  id: string;
  name: string;
  address1: string;
  address2?: string | null;
  city: string;
  state: string;
  zip: string;
};

/**
 * Route information in CRM orders response
 */
export type CrmRoute = {
  id: string;
  name: string;
  // Add other route properties as needed
};

/**
 * Pickup request in CRM orders response
 */
export type CrmPickupRequest = {
  id: string;
  magnoliCustomerId?: string | null;
  customerId: string;
  addressId: string;
  routeId?: string | null;
  routeOverride: boolean;
  status: string;
  createdAt: string;
  dueDate: string | null;
  pickupDate?: string | null;
  metadata?: Record<string, unknown> | null;
  driverId?: string | null;
  detailedById?: string | null;
  updatedAt: string;
  magnoliCustomer?: { id: string; name: string };
  customer?: CrmCustomer;
  address?: CrmAddress;
  route?: CrmRoute | null;
};

/**
 * Order in CRM orders response (placeholder - structure may vary)
 */
export type CrmOrder = {
  id: string;
  // Add order properties as needed
};

/**
 * Drop-off request in CRM orders response (placeholder - structure may vary)
 */
export type CrmDropOffRequest = {
  id: string;
  // Add drop-off request properties as needed
};

/**
 * Single record in CRM orders response
 */
export type CrmOrderRecord = {
  id: string;
  type: "pickupRequest" | "pickupRequestWithOrder" | "order";
  pickupRequest?: CrmPickupRequest | null;
  order?: CrmOrder | null;
  dropOffRequest?: CrmDropOffRequest | null;
  customer: CrmCustomer;
  address: CrmAddress;
  route?: CrmRoute | null;
  createdAt: string;
};

/**
 * CRM orders response data structure
 */
export type CrmOrdersData = {
  records: CrmOrderRecord[];
  total: number;
  pickupRequestCount: number;
  orderCount: number;
  linkedCount: number;
};

/**
 * CRM orders API response wrapper
 */
export type CrmOrdersResponse = ApiResponse<{
  status: "success" | "error";
  message: string;
  data: CrmOrdersData;
}>;

// ============================================================================
// EVENT TYPES
// ============================================================================

/**
 * Event creation input interface
 */
export interface EventCreateInput {
  id?: string;
  type: string;
  payload?: unknown | null;
  status?: string;
  attempts?: number;
  lastError?: string | null;
  customerId?: string | null;
  createdAt?: string | Date;
  receivedAt?: string | Date;
}

// ============================================================================
// SCHEMA EXPORTS
// ============================================================================

/**
 * All schemas exported for easy importing
 */
export const schemas = {
  emailAuth: emailAuthSchema,
  phoneAuth: phoneAuthSchema,
  passwordLogin: passwordLoginSchema,
  onboarding: onboardingSchema,
  addressEdit: addressEditSchema,
  updateUser: updateUserSchema,
} as const;

// All types are exported individually above for easy importing
