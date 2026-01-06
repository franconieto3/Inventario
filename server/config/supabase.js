// server/config/supabase.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;

// Cliente estándar (Respeta RLS)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Cliente ADMIN (Ignora RLS - Service Role)
export const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);