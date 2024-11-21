import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../utils/schema.js'
const sql = process.env.NEXT_PUBLIC_DRIZZLE_DB_URL;
export const db = drizzle(sql,{schema});