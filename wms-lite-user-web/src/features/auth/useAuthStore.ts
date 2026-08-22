import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginResponse, UserAuthInfo } from './auth';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserAuthInfo | null;
  isAuthenticated: boolean;
  setAuth: (response: LoginResponse) => void;
  clearAuth: () => void;
  logout: () => void; // alias for clearAuth
  login: (response: LoginResponse) => void; // alias for setAuth
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setAuth: (response: LoginResponse) => {
        set({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: {
            memberId: response.memberId,
            loginId: response.loginId,
            name: response.name,
            department: response.department,
            role: response.role,
          },
          isAuthenticated: true,
        });
      },

      login: (response: LoginResponse) => {
        set({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: {
            memberId: response.memberId,
            loginId: response.loginId,
            name: response.name,
            department: response.department,
            role: response.role,
          },
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'wms-lite-user-auth', // localStorage 키 (axiosClient에서 이 키를 파싱해 Bearer 토큰 첨부)
    }
  )
);
