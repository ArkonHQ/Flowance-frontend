import {createInsertSchema, createSelectSchema, createUpdateSchema} from "drizzle-zod";
import {users} from "@/lib/db/schema";

// Schema for selecting (reading) a user
export const selectUserSchema = createSelectSchema(users)

//Schema for inserting a new user
export const insertUserSchema = createSelectSchema(users, {
    email: (schema) => schema.email.email(),
    password: (schema) => schema.password.min(8),
})

// Schema for updating a user ( all fields optional )
export const updateUserSchema = createUpdateSchema(users).partial()