import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

// 기준정보 (Master)
import { ItemManagementPage } from '../pages/master/ItemManagementPage';
import { WarehouseManagementPage } from '../pages/master/WarehouseManagementPage';
import { SupplierManagementPage } from '../pages/master/SupplierManagementPage';
import { CustomerManagementPage } from '../pages/master/CustomerManagementPage';
import { UserManagementPage } from '../pages/master/UserManagementPage';

// 재고 (Inventory)
import { InventoryListPage } from '../pages/inventory/InventoryListPage';
import { StockMovementPage } from '../pages/inventory/StockMovementPage';
import { StockAdjustmentPage } from '../pages/inventory/StockAdjustmentPage';
import { StockHistoryPage } from '../pages/inventory/StockHistoryPage';

// 입고 (Inbound)
import { InboundListPage } from '../pages/inbound/InboundListPage';
import { InboundCreatePage } from '../pages/inbound/InboundCreatePage';
import { InboundDetailPage } from '../pages/inbound/InboundDetailPage';

// 출고 (Outbound)
import { OutboundListPage } from '../pages/outbound/OutboundListPage';
import { OutboundCreatePage } from '../pages/outbound/OutboundCreatePage';
import { OutboundDetailPage } from '../pages/outbound/OutboundDetailPage';

// 게시판 (Board)
import { NoticeBoardPage } from '../pages/board/NoticeBoardPage';
import { GeneralBoardPage } from '../pages/board/GeneralBoardPage';

// 마이페이지 (MyPage)
import { MyPage } from '../pages/mypage/MyPage';

// 보호된 라우트 가드 (인증된 사용자만 접근 가능)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// 미인증 라우트 가드 (로그인한 사용자는 대시보드로 자동 리다이렉트)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        {/* 루트 접속 시 로그인 여부에 따른 리다이렉트 */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />

        {/* 독립 로그인 페이지 */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* 헤더 + 좌측 사이드바가 포함된 메인 레이아웃 라우트 그룹 */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* 기준정보 */}
          <Route path="/master/items" element={<ItemManagementPage />} />
          <Route path="/master/warehouses" element={<WarehouseManagementPage />} />
          <Route path="/master/suppliers" element={<SupplierManagementPage />} />
          <Route path="/master/customers" element={<CustomerManagementPage />} />

          {/* 시스템관리 */}
          <Route path="/system/users" element={<UserManagementPage />} />

          {/* 재고 */}
          <Route path="/inventory/list" element={<InventoryListPage />} />
          <Route path="/inventory/movement" element={<StockMovementPage />} />
          <Route path="/inventory/adjustment" element={<StockAdjustmentPage />} />
          <Route path="/inventory/history" element={<StockHistoryPage />} />

          {/* 입고 */}
          <Route path="/inbound/list" element={<InboundListPage />} />
          <Route path="/inbound/create" element={<InboundCreatePage />} />
          <Route path="/inbound/detail" element={<Navigate to="/inbound/list" replace />} />
          <Route path="/inbound/detail/:id" element={<InboundDetailPage />} />

          {/* 출고 */}
          <Route path="/outbound/list" element={<OutboundListPage />} />
          <Route path="/outbound/create" element={<OutboundCreatePage />} />
          <Route path="/outbound/detail" element={<Navigate to="/outbound/list" replace />} />
          <Route path="/outbound/detail/:id" element={<OutboundDetailPage />} />

          {/* 게시판 */}
          <Route path="/board/notice" element={<NoticeBoardPage />} />
          <Route path="/board/general" element={<GeneralBoardPage />} />

          {/* 마이페이지 */}
          <Route path="/mypage" element={<MyPage />} />
        </Route>

        {/* 404 라우트 */}
        <Route
          path="*"
          element={
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <h2>404 Not Found</h2>
              <p>존재하지 않는 페이지입니다.</p>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
