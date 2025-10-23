/**
 * Validation schemas using Zod
 * Provides type-safe validation for forms and API data
 */

import { z } from 'zod';

// Constants for validation
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const MIN_MILEAGE = 0;
const MAX_MILEAGE = 1_000_000;
const MIN_FUEL_AMOUNT = 0.1;
const MAX_FUEL_AMOUNT = 500;
const MIN_FUEL_COST = 0.01;
const MAX_FUEL_COST = 10_000;

/**
 * User validation schemas
 */
export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  .max(MAX_PASSWORD_LENGTH, `Password must be less than ${MAX_PASSWORD_LENGTH} characters`);

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters');

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Signup form schema
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema
});

export type SignupFormData = z.infer<typeof signupSchema>;

/**
 * Vehicle identification schemas
 */
export const vinSchema = z
  .string()
  .length(17, 'VIN must be exactly 17 characters')
  .regex(/^[A-HJ-NPR-Z0-9]{17}$/i, 'Invalid VIN format');

export const stockNumberSchema = z
  .string()
  .min(1, 'Stock number is required')
  .max(50, 'Stock number must be less than 50 characters');

/**
 * Fuel entry schema
 */
export const fuelEntrySchema = z.object({
  stockNumber: stockNumberSchema.optional(),
  vin: vinSchema.optional(),
  mileage: z
    .number()
    .min(MIN_MILEAGE, 'Mileage cannot be negative')
    .max(MAX_MILEAGE, `Mileage cannot exceed ${MAX_MILEAGE.toLocaleString()}`),
  fuelAmount: z
    .number()
    .min(MIN_FUEL_AMOUNT, `Fuel amount must be at least ${MIN_FUEL_AMOUNT} gallons`)
    .max(MAX_FUEL_AMOUNT, `Fuel amount cannot exceed ${MAX_FUEL_AMOUNT} gallons`),
  fuelCost: z
    .number()
    .min(MIN_FUEL_COST, `Fuel cost must be at least $${MIN_FUEL_COST}`)
    .max(MAX_FUEL_COST, `Fuel cost cannot exceed $${MAX_FUEL_COST.toLocaleString()}`),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  receiptPhoto: z.string().optional(),
  vinPhoto: z.string().optional(),
  timestamp: z.date()
}).refine(
  (data) => data.stockNumber || data.vin,
  {
    message: 'Either stock number or VIN is required',
    path: ['stockNumber']
  }
);

export type FuelEntryFormData = z.infer<typeof fuelEntrySchema>;

/**
 * Validation helper function
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}
