import { betterAuth } from "better-auth";
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'
import { users, account, verification, session } from "@/lib/db/schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema:{
            user: users,
            session,
            account,
            verification,
        },
    }),
    emailAndPassword:{
        enabled: true
    }
})