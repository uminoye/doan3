import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Box } from 'lucide-react';

export default function InventoryBalancesPage() {
  const [balances, setBalances] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [filter, setFilter] = useState({ warehouseId: '', search: '' });

  const fetch = () => {
    setLoading(true);
    api.get('/inventory/balances', { params: filter })
      .then((res) => { setBalances(res.data.data); setTotal(res.data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [filter]);

  useEffect(() => {
    api.get('/warehouses/active').then((r) => setWarehouses(r.data)).catch(console.error);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Tồn kho hiện tại</h1>

      <div className="flex gap-3 items-center">
        <select className="select-field w-52" value={filter.warehouseId} onChange={(e) => setFilter({ ...filter, warehouseId: e.target.value })}>
          <option value="">Tất cả kho</option>
          {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          <input className="input-field pl-9" placeholder="Tìm sản phẩm..." value={filter.search} onChange={(e) => setFilter({ ...filter, search: e.target.value })} />
        </div>
        <span className="text-sm ml-auto" style={{ color: 'var(--muted)' }}>Tổng: {total}</span>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="table-header">
              <th className="px-3 py-2 text-left">Sản phẩm</th><th className="px-3 py-2 text-left">SKU</th>
              <th className="px-3 py-2 text-left">Kho</th><th className="px-3 py-2 text-right">Tồn kho</th>
              <th className="px-3 py-2 text-left">Trạng thái</th>
            </tr></thead>
            <tbody>
              {balances.map((b) => (
                <tr key={b.id} className="table-row">
                  <td className="px-3 py-2 font-medium">{b.product?.name}</td>
                  <td className="px-3 py-2 font-mono text-xs">{b.product?.sku}</td>
                  <td className="px-3 py-2">{b.warehouse?.name}</td>
                  <td className="px-3 py-2 text-right">
                    <span className={`font-bold ${Number(b.onHandQty) < 50 ? 'text-amber-600' : 'text-green-700'}`}>
                      {Number(b.onHandQty).toLocaleString()} {b.product?.unit}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {Number(b.onHandQty) < 50 ? (
                      <span className="badge bg-amber-100 text-amber-700">Tồn thấp</span>
                    ) : (
                      <span className="badge bg-green-100 text-green-700">Còn hàng</span>
                    )}
                  </td>
                </tr>
              ))}
              {balances.length === 0 && <tr><td colSpan={5} className="text-center py-8" style={{ color: 'var(--muted)' }}>Không có dữ liệu tồn kho</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
