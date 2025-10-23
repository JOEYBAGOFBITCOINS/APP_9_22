/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEMO_MODE?: string
  readonly VITE_SKIP_AUTH?: string
  readonly VITE_AUTO_LOGIN?: string
  readonly VITE_DEFAULT_USER_ROLE?: string
  readonly VITE_DEBUG_MODE?: string
  readonly VITE_APP_MODE?: string
  readonly VITE_API_TIMEOUT?: string
  readonly VITE_ENABLE_MOCK_SERVICES?: string
  readonly VITE_ENABLE_BIOMETRIC_AUTH?: string
  readonly VITE_ENABLE_LOCATION_SERVICES?: string
  readonly VITE_ENABLE_VIN_SCANNER?: string
  readonly VITE_ENABLE_OCR_SCANNER?: string
  readonly VITE_CONSOLE_LOGGING?: string
  readonly VITE_REQUIRE_NAPLETON_EMAIL?: string
  readonly VITE_ENABLE_ANALYTICS?: string
  readonly VITE_ENABLE_ERROR_REPORTING?: string
  readonly VITE_DEVELOPER_MODE?: string
  readonly VITE_SHOW_DEBUG_INFO?: string
  readonly VITE_LOCAL_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}