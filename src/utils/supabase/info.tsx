/* Supabase Configuration - Reads from environment variables */

// Read from environment variables or use fallback values
const getSupabaseConfig = () => {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'egqlnqnejygrnzzcaymz';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVncWxucW5lanlncm56emNheW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3OTEyMTUsImV4cCI6MjA3NDM2NzIxNX0.ignoDGZPWjPyBpu2pJsHdOkQS_obD1LXbBZpOKFETi4';

  // Warn in development if using fallback values
  if (import.meta.env.DEV && !import.meta.env.VITE_SUPABASE_PROJECT_ID) {
    console.warn('⚠️ Using fallback Supabase credentials. Set VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY in .env');
  }

  return { projectId, anonKey };
};

const config = getSupabaseConfig();

export const projectId = config.projectId;
export const publicAnonKey = config.anonKey;