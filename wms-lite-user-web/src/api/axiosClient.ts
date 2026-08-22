import axios from 'axios';
import toast from 'react-hot-toast';

import { useAuthStore } from '../stores/useAuthStore';

// Vite Dev Server Proxy('/api') 자동 우회 지원
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request 인터셉터: JWT 토큰 자동 전송
axiosClient.interceptors.request.use(
  (config) => {
    try {
      const authData = localStorage.getItem('wms-lite-user-auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        const token = parsed.state?.accessToken;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // 로컬스토리지 파싱 실패 무시
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response 인터셉터: 토큰 자동 갱신(Reissue) 및 백엔드 장애/네트워크 에러 통합 처리
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 네트워크 연결 에러 (백엔드 서버 미실행 등)
    if (!error.response) {
      console.warn('[Backend Offline] 백엔드 API 서버(http://localhost:8080) 미연결 상태입니다.');
      return Promise.reject({
        isNetworkError: true,
        message: '백엔드 API 서버와 통신할 수 없습니다. (서버 미실행 또는 네트워크/CORS 오류)',
      });
    }

    const status = error.response.status;
    const currentToken = useAuthStore.getState().accessToken;

    // mock-jwt 토큰이거나 데모 모드일 때는 강제 로그아웃/리다이렉트 안 함 (무한 튕김 방지)
    const isMockToken = currentToken && currentToken.startsWith('mock-jwt-');

    // 401 Unauthorized 발생 시 처리
    if (status === 401 && !isMockToken) {
      // 만약 토큰 재발급 요청 자체가 401 실패한 경우
      if (originalRequest && originalRequest.url?.includes('/api/members/reissue')) {
        useAuthStore.getState().logout();
        toast.error('세션이 만료되었습니다. 다시 로그인해 주세요.', { id: 'session-expired' });
        return Promise.reject(error.response.data || error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(axiosClient(originalRequest));
              }
            },
            reject: (err: any) => {
              reject(err);
            },
          });
        });
      }

      if (originalRequest) {
        originalRequest._retry = true;
      }
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken || refreshToken.startsWith('mock-jwt-')) {
        isRefreshing = false;
        // 데모 환경이 아닌 실제 유효하지 않은 토큰일 때만 로그아웃
        if (!isMockToken) {
          useAuthStore.getState().logout();
          toast.error('인증 세션이 만료되었습니다. 다시 로그인해 주세요.', { id: 'session-expired' });
        }
        return Promise.reject(error.response.data || error);
      }

      try {
        const res = await axios.post(`${BASE_URL}/api/members/reissue`, { refreshToken });
        const { accessToken: newAccessToken } = res.data;

        useAuthStore.getState().setAuth(res.data);

        processQueue(null, newAccessToken);
        isRefreshing = false;

        if (originalRequest) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        }
      } catch (reissueError: any) {
        processQueue(reissueError, null);
        isRefreshing = false;

        useAuthStore.getState().logout();
        toast.error('인증 세션이 만료되었습니다. 다시 로그인해 주세요.', { id: 'session-expired' });
        return Promise.reject(reissueError.response?.data || reissueError);
      }
    }

    // 일반 에러 메시지 알림 (중복 팝업 방지 ID 적용)
    if (status === 401) {
      console.warn('인증 권한 없음 (401)');
    } else if (status === 403) {
      toast.error('해당 요청에 대한 작업 권한이 부족합니다.', { id: 'auth-403-error' });
    } else if (status === 409) {
      toast.error('이미 존재하는 데이터입니다.', { id: 'data-409-error' });
    } else if (status >= 500) {
      toast.error('백엔드 서버 내부 오류가 발생했습니다. (500)', { id: 'backend-500-error' });
    }

    return Promise.reject(error.response.data || error);
  }
);
