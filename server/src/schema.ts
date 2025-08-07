
import { z } from 'zod';

// User schema for mock authentication
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  created_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Login input schema
export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export type LoginInput = z.infer<typeof loginInputSchema>;

// Auth response schema
export const authResponseSchema = z.object({
  user: userSchema,
  token: z.string()
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

// Product schema with proper numeric handling
export const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  stock_quantity: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Product = z.infer<typeof productSchema>;

// Input schema for creating products
export const createProductInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  price: z.number().positive(),
  stock_quantity: z.number().int().nonnegative()
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;

// Input schema for updating products
export const updateProductInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  price: z.number().positive().optional(),
  stock_quantity: z.number().int().nonnegative().optional()
});

export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;

// Input schema for getting a single product
export const getProductInputSchema = z.object({
  id: z.number()
});

export type GetProductInput = z.infer<typeof getProductInputSchema>;

// Input schema for deleting a product
export const deleteProductInputSchema = z.object({
  id: z.number()
});

export type DeleteProductInput = z.infer<typeof deleteProductInputSchema>;
