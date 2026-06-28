import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function StatusBadge({ status }) {
  const map = {
    draft: 'badge-draft',
    submitted: 'badge-submitted',
    logistics_received: 'badge-logistics',
    warehouse_processing: 'badge-warehouse',
    completed: 'badge-completed',
    cancelled: 'badge-cancelled',
    confirmed: 'badge-confirmed',
    pending: 'badge-draft',
    transferred: 'badge-logistics',
  };

  const labels = {
    draft: 'Nháp',
    submitted: 'Đã gửi',
    logistics_received: 'Logistics nhận',
    warehouse_processing: 'Kho xử lý',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
    confirmed: 'Đã xác nhận',
    pending: 'Chờ xử lý',
    transferred: 'Đã chuyển kho',
  };

  return (
    <span className={`badge ${map[status] || 'badge-draft'}`}>
      {labels[status] || status}
    </span>
  );
}
