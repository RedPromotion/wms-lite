import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastBar } from './components/ToastBar.tsx';
import App from './App.tsx';
import './index.css';

// React Query 클라이언트 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // 창 포커스 시 자동 재요청 비활성화
      retry: 1, // 실패 시 1회 재시도
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ToastBar />
    </QueryClientProvider>
  </StrictMode>
);
