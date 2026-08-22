import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import styles from './MainLayout.module.css';

export const MainLayout: React.FC = () => {
  return (
    <div className={styles.container}>
      {/* 상단 고정 헤더 */}
      <Header />

      {/* 헤더 아래: 좌측 사이드바 + 중앙 본문 영역 */}
      <div className={styles.body}>
        {/* 좌측 사이드 메뉴 */}
        <Sidebar />

        {/* 중앙 컨텐츠 영역 (Outlet) */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
