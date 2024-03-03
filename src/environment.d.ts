declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SERVICE_ACCOUNT_EMAIL: string;
      SERVICE_ACCOUNT_KEY: string;
      SHEET_ID: string;
      KEY_BASE64?: string;
      SHEET_NAME?: string;
    }
  }
}
