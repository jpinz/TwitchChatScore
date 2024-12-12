/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly NEXT_PUBLIC_SUPABASE_URL: string
    readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    // more env variables...
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }