import { NextResponse } from "next/server";
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { clients } from '@/lib/db/schema'
import { insertClientSchema } from '@/lib/db/validation'

