import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import WarehousesPage from './pages/WarehousesPage';
import ProductionReceiptsPage from './pages/ProductionReceiptsPage';
import SalesOrdersPage from './pages/SalesOrdersPage';
import LogisticsPage from './pages/LogisticsPage';
import WarehouseOutboundPage from './pages/WarehouseOutboundPage';
import InventoryBalancesPage from './pages/InventoryBalancesPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Đang tải...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role?.name)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Đang tải...</div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="warehouses" element={<WarehousesPage />} />
        <Route path="production-receipts" element={<ProductionReceiptsPage />} />
        <Route path="sales-orders" element={<SalesOrdersPage />} />
        <Route path="logistics" element={<LogisticsPage />} />
        <Route path="warehouse-outbound" element={<WarehouseOutboundPage />} />
        <Route path="inventory-balances" element={<InventoryBalancesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="users" element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
