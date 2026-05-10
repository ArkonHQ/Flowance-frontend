import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users, clients, projects, invoices, performance } from '@/lib/db/schema';

// User Validation
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// Client Validation
export const insertClientSchema = createInsertSchema(clients);
export const selectClientSchema = createSelectSchema(clients);

// Project Validation
export const insertProjectSchema = createInsertSchema(projects);
export const selectProjectSchema = createSelectSchema(projects);

// Invoice Validation
export const insertInvoiceSchema = createInsertSchema(invoices);
export const selectInvoiceSchema = createSelectSchema(invoices);

// Performance Validation
export const insertPerformanceSchema = createInsertSchema(performance);
export const selectPerformanceSchema = createSelectSchema(performance);
