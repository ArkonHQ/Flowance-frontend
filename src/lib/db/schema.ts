import {pgTable, text, boolean, timestamp, integer, decimal } from "drizzle-orm/pg-core";


export const users = pgTable('users', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('emailVerified').notNull().default(false),
    password: text('password').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const session = pgTable('sessions', {
    id: text('id').primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    ownerId: text('ownerId').notNull().references(() => users.id , { onDelete: 'cascade' })
})

export const account = pgTable('accounts', {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' } ),
    accountToken: text('account_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
})


export const verification = pgTable('verifications', {
    id: text('id').primaryKey(),
    identifier: text('identifier_id').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('update_at'),
})

export const clients = pgTable('clients', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email'),
    company: text('company'),
    ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const projects = pgTable('projects', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').notNull().default('active'),
    clientId: text('client_id').references(() => clients.id, { onDelete: 'set null' }),
    ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const invoices = pgTable('invoices', {
    id: text('id').primaryKey(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    status: text('status').notNull().default('pending'),
    projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
    clientId: text('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
    ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    issueDate: timestamp('issue_date').notNull(),
    dueDate: timestamp('due_date').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const performance = pgTable('performance', {
    id: text('id').primaryKey(),
    ownerId: text('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    invoiceId: text('invoice_id').references(() => invoices.id, { onDelete: 'set null' }),
    rating: integer('rating'),
    feedback: text('feedback'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})