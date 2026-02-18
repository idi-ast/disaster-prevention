import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { authClient, useSession as useBetterAuthSession } from "../config";
import type {
  AuthContextType,
  AuthProvider,
  SignUpCredentials,
  BetterAuthUser,
  Session,
} from "../types";

// Exportar el contexto para poder usarlo en proveedores alternativos (ej: BackdoorAuthProvider)
export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: sessionData, isPending } = useBetterAuthSession();
  const [error, setError] = useState<string | null>(null);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        await authClient.signIn.email({ email, password });
      } catch (err) {
        setError((err as Error).message);
        throw err;
      }
    },
    [],
  );

  const signInWithSocial = useCallback(async (provider: AuthProvider) => {
    setError(null);
    try {
      await authClient.signIn.social({ provider });
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    setError(null);
    try {
      await authClient.signUp.email({
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
      });
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await authClient.signOut();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  const refreshSession = useCallback(async () => {}, []);

  const value: AuthContextType = {
    session: sessionData?.session as Session | null,
    user: sessionData?.user as BetterAuthUser | null,
    isLoading: isPending,
    isAuthenticated: !!sessionData?.session,
    error,
    signIn: {
      email: signInWithEmail,
      social: signInWithSocial,
    },
    signUp,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  }
  return context;
}
