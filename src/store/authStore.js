import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setUser: (user) => set({ user }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      getRedirectPath: () => {
        const user = get().user;
        if (!user) return "/login";

        switch (user.role) {
          case "STUDENT":
            return "/student";
          case "WARDEN":
            return "/warden";
          case "ADMIN":
            return "/admin";
          case "CANTEEN_MANAGER":
            return "/canteen";
          case "CARETAKER":
            return "/caretaker";
          default:
            return "/login";
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
