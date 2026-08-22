import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  Database,
  ChevronRight,
  Folder,
  FolderOpen,
  List,
  PlusCircle,
  FileText,
  MessageSquare,
  Users,
  Building,
  Package,
  Truck,
  Settings,
  Sliders,
} from 'lucide-react';
import styles from './Sidebar.module.css';

/**
 * 재귀적 트리 메뉴 데이터 인터페이스
 * - children 항목을 가지면 '폴더(그룹)', path를 가지면 '최하위 페이지 링크'로 동작합니다.
 * - 무제한 Depth(폴더 안의 폴더 중첩)를 지원합니다.
 */
export interface MenuItem {
  id: string;             // 각 메뉴 구분용 고유 키
  name: string;           // 메뉴 및 폴더명
  icon?: React.ReactNode; // 아이콘 (선택)
  path?: string;          // 이동할 페이지 URL (최하위 노드인 경우 지정)
  badge?: string;         // 카운트나 상태 뱃지 (선택)
  children?: MenuItem[];  // 하위 재귀 메뉴 리스트 (폴더인 경우)
}

/**
 * WMS 사이드바 메뉴 구성 데이터
 * 개발자가 폴더-페이지 구조를 자유롭게 재귀적으로 확장할 수 있습니다.
 */
const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    name: '대시보드',
    path: '/dashboard',
    icon: <LayoutDashboard size={18} />,
  },
  {
    id: 'master-group',
    name: '기준정보',
    icon: <Database size={18} />,
    children: [
      { id: 'master-items', name: '품목관리', path: '/master/items', icon: <Package size={16} /> },
      { id: 'master-warehouses', name: '창고관리', path: '/master/warehouses', icon: <Building size={16} /> },
      { id: 'master-suppliers', name: '공급업체(입고처)', path: '/master/suppliers', icon: <Truck size={16} /> },
      { id: 'master-customers', name: '고객사(출고처)', path: '/master/customers', icon: <Users size={16} /> },
    ],
  },
  {
    id: 'system-group',
    name: '시스템관리',
    icon: <Settings size={18} />,
    children: [
      { id: 'system-users', name: '사용자관리', path: '/system/users', icon: <Users size={16} /> },
    ],
  },
  {
    id: 'inventory-group',
    name: '재고',
    icon: <Boxes size={18} />,
    children: [
      { id: 'inventory-list', name: '재고조회', path: '/inventory/list', icon: <List size={16} /> },
      { id: 'stock-movement', name: '재고이동', path: '/inventory/movement', icon: <ArrowUpRight size={16} /> },
      { id: 'stock-adjustment', name: '재고조정', path: '/inventory/adjustment', icon: <Sliders size={16} /> },
      { id: 'stock-history', name: '재고이력', path: '/inventory/history', icon: <FileText size={16} /> },
    ],
  },
  {
    id: 'inbound-group',
    name: '입고',
    icon: <ArrowDownLeft size={18} />,
    children: [
      { id: 'inbound-list', name: '입고목록', path: '/inbound/list', icon: <List size={16} /> },
      { id: 'inbound-create', name: '입고등록', path: '/inbound/create', icon: <PlusCircle size={16} /> },
    ],
  },
  {
    id: 'outbound-group',
    name: '출고',
    icon: <ArrowUpRight size={18} />,
    children: [
      { id: 'outbound-list', name: '출고목록', path: '/outbound/list', icon: <List size={16} /> },
      { id: 'outbound-create', name: '출고등록', path: '/outbound/create', icon: <PlusCircle size={16} /> },
    ],
  },
  {
    id: 'board-group',
    name: '게시판',
    icon: <MessageSquare size={18} />,
    children: [
      { id: 'notice-board', name: '공지사항', path: '/board/notice', icon: <List size={16} /> },
      { id: 'general-board', name: '일반게시판', path: '/board/general', icon: <List size={16} /> },
    ],
  },
];

/**
 * 주어진 메뉴 또는 하위 후손 중 현재 접속 경로(currentPath)와 일치하는 항목이 있는지 검사하는 재귀 유틸리티 함수
 */
const isPathActive = (item: MenuItem, currentPath: string): boolean => {
  if (item.path && item.path === currentPath) return true;
  if (item.children && item.children.length > 0) {
    return item.children.some((child) => isPathActive(child, currentPath));
  }
  return false;
};

interface SidebarItemProps {
  item: MenuItem;
  depth?: number;
}

/**
 * 재귀적 사이드바 아이템 컴포넌트
 */
const SidebarItem: React.FC<SidebarItemProps> = ({ item, depth = 0 }) => {
  const location = useLocation();
  const hasChildren = Boolean(item.children && item.children.length > 0);
  const isParentOfActive = hasChildren && isPathActive(item, location.pathname);

  // 사이드바 접속 시 모든 메뉴 그룹(재고, 입고, 출고 등)이 한눈에 보이도록 기본 펼침 상태로 설정
  const [isOpen, setIsOpen] = useState<boolean>(true);

  useEffect(() => {
    if (isParentOfActive) {
      setIsOpen(true);
    }
  }, [location.pathname, isParentOfActive]);

  const toggleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen((prev) => !prev);
  };

  // 1. 하위 메뉴(children)를 포함하는 폴더 노드인 경우
  if (hasChildren) {
    return (
      <div>
        <button
          type="button"
          onClick={toggleOpen}
          className={`${styles.folderHeader} ${isParentOfActive ? styles.folderHeaderActive : ''}`}
          style={{ paddingLeft: `${0.75 + depth * 0.5}rem` }}
        >
          <div className={styles.folderHeaderContent}>
            {item.icon || (isOpen ? <FolderOpen size={16} /> : <Folder size={16} />)}
            <span>{item.name}</span>
          </div>
          <div className={`${styles.chevronIcon} ${isOpen ? styles.chevronOpen : ''}`}>
            <ChevronRight size={15} />
          </div>
        </button>

        {isOpen && item.children && (
          <div className={`${styles.subGroup} ${depth > 0 ? styles.subGroupIndent : ''}`}>
            {item.children.map((child) => (
              <SidebarItem key={child.id} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 2. 단일 이동 경로(path)가 있는 최하위 페이지 노드인 경우
  if (item.path) {
    return (
      <NavLink
        to={item.path}
        className={({ isActive }) => (isActive ? styles.activeNavLink : styles.navLink)}
        style={{ paddingLeft: `${0.75 + depth * 0.6}rem` }}
      >
        <div className={styles.linkContent}>
          {item.icon}
          <span>{item.name}</span>
        </div>
        {item.badge && <span className={styles.badge}>{item.badge}</span>}
      </NavLink>
    );
  }

  return null;
};

export const Sidebar: React.FC = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sectionTitle}>현장 물류 메뉴</div>

      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <SidebarItem key={item.id} item={item} />
        ))}
      </nav>

      {/* 하단 버전 정보 및 안내 */}
      <div className={styles.footer}>
        <span className={styles.versionTitle}>WMS-Lite v1.0.0</span>
        현장 실무자 관제 뷰
      </div>
    </aside>
  );
};
