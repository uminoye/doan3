import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Package, Users, Warehouse, Factory,
  ShoppingCart, Truck, LogOut, ChevronRight, BarChart3, Box
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'sales', 'logistics', 'warehouse', 'factory'] },
  { path: '/products', label: 'Sản phẩm', icon: Package, roles: ['admin'] },
  { path: '/customers', label: 'Khách hàng', icon: Users, roles: ['admin', 'sales'] },
  { path: '/warehouses', label: 'Kho', icon: Warehouse, roles: ['admin'] },
  { path: '/production-receipts', label: 'Nhập kho', icon: Factory, roles: ['admin', 'factory', 'warehouse'] },
  { path: '/sales-orders', label: 'Đơn hàng', icon: ShoppingCart, roles: ['admin', 'sales'] },
  { path: '/logistics', label: 'Logistics', icon: Truck, roles: ['admin', 'logistics'] },
  { path: '/warehouse-outbound', label: 'Xuất kho', icon: Warehouse, roles: ['admin', 'warehouse'] },
  { path: '/inventory-balances', label: 'Tồn kho', icon: Box, roles: ['admin', 'warehouse', 'factory'] },
  { path: '/reports', label: 'Báo cáo', icon: BarChart3, roles: ['admin', 'warehouse', 'factory'] },
  { path: '/users', label: 'Người dùng', icon: Users, roles: ['admin'] },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabels = {
    admin: 'Quản trị',
    sales: 'Kinh doanh',
    logistics: 'Logistics',
    warehouse: 'Kho',
    factory: 'Nhà máy',
  };

  const visibleNav = NAV_ITEMS.filter((item) =>
    item.roles.includes(user?.role?.name)
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col" style={{ background: 'var(--surface)', borderRight: '1px solid var(--line)' }}>
        {/* Logo */}
        <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg, #a63d40, #1d6f5f)', color: '#fff' }}>
          <h1 className="text-lg font-bold leading-tight">Hệ thống<br />Xuất Nhập Tồn</h1>
          <p className="text-xs mt-1 opacity-80">Quản lý kho thông minh</p>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--line)' }}>
          <p className="font-semibold text-sm truncate">{user?.fullName}</p>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            {roleLabels[user?.role?.name] || user?.role?.name}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {visibleNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition ${
                  isActive
                    ? 'font-semibold text-white'
                    : 'hover:bg-gray-100'
                }`
              }
              style={({ isActive }) =>
                isActive ? { background: 'var(--brand)' } : {}
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-3 border-t" style={{ borderColor: 'var(--line)' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
