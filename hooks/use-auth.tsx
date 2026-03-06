"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import axios from "axios";
import type { Permission } from "@/lib/permissions";

interface AuthUser {
  id: string;
  phone: string;
  name: string | null;
  role: number;
}

interface AuthState {
  user: AuthUser | null;
  permissions: Permission[];
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  hasPermission: (permission: Permission) => boolean;
  isAdmin: boolean;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    permissions: [],
    isLoading: true,
  });

  const fetchAuth = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/auth/me");
      setState({
        user: data.user,
        permissions: data.permissions,
        isLoading: false,
      });
    } catch {
      setState({ user: null, permissions: [], isLoading: false });
    }
  }, []);

  useEffect(() => {
    fetchAuth();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAuth();
      }
    };

    const handleFocus = () => {
      fetchAuth();
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchAuth]);

  const hasPermission = useCallback(
    (permission: Permission) => state.permissions.includes(permission),
    [state.permissions],
  );

  const isAdmin = state.user?.role === 1;

  return (
    <AuthContext.Provider
      value={{ ...state, hasPermission, isAdmin, refetch: fetchAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
