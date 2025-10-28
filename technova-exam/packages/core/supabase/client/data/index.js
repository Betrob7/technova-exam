import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_API_KEY = import.meta.env.VITE_SUPABASE_API_KEY;

export const client = createClient(SUPABASE_URL, SUPABASE_API_KEY); //Skapar själva Supabase-klienten (client) och exporterar den så att du kan använda den överallt i projektet.
