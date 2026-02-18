import { createAuthClient } from "better-auth/react";
import type { AuthConfig } from "../types";

const defaultConfig: AuthConfig = {
  baseUrl: import.meta.env.VITE_AUTH_URL || "http://localhost:8000",
  callbackUrl: import.meta.env.VITE_AUTH_CALLBACK_URL || "/",
};

/**
 * Cliente de Better Auth configurado
 */
export const authClient = createAuthClient({
  baseURL: defaultConfig.baseUrl,
  fetchOptions: {
    credentials: "include",
  },
});

/**
 * Accesos directos al cliente
 */
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;

export { defaultConfig as authConfig };
