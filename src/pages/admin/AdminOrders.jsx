import React, { useEffect, useState } from 'react';
import { getOrders, updateOrder, deleteOrder } from '../../services/api';
import { toast } from 'react-toastify';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const STATUSES = ['Pending', 'Processing', 'Shipping', 'Delivered', 'Cancelled'];
const STATUS_COLORS = { Pending: 'warning text-dark', Processing: 'info text-white', Shipping: 'primary', Delivered: 'success', Cancelled: 'danger' };

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    const load = async () => {
        setLoading(true);
        const [ords, usrs] = await Promise.all([getOrders(), import('../../services/api').then(m => m.getUsers())]);
        const userMap = {};
        usrs.forEach(u => { userMap[u.id] = u; });
        setUsers(userMap);
        setOrders(ords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleStatusChange = async (order, newStatus) => {
        await updateOrder(order.id, { ...order, status: newStatus });
        toast.success(`Cập nhật trạng thái đơn #${order.id} → ${newStatus}`);
        load();
    };

    const handleDelete = async (order) => {
        if (!window.confirm(`Xoá đơn hàng #${order.id}?`)) return;
        await deleteOrder(order.id);
        toast.success('Đã xoá đơn hàng');
        load();
    };

    const filtered = statusFilter ? orders.filter(o => o.status === statusFilter) : orders;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Quản lý đơn hàng</h4>
                <div className="d-flex gap-2 align-items-center">
                    <span className="text-muted small">{filtered.length} đơn</span>
                    <select className="form-select form-select-sm" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">Tất cả trạng thái</option>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th className="small text-muted fw-semibold px-4">Mã đơn</th>
                                <th className="small text-muted fw-semibold">Khách hàng</th>
                                <th className="small text-muted fw-semibold">Tổng tiền</th>
                                <th className="small text-muted fw-semibold">Trạng thái</th>
                                <th className="small text-muted fw-semibold">Ngày đặt</th>
                                <th className="small text-muted fw-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-4"><div className="spinner-border spinner-border-sm"></div></td></tr>
                            ) : filtered.map(order => {
                                const u = users[order.userId];
                                const isExp = expandedOrder === order.id;
                                return (
                                    <React.Fragment key={order.id}>
                                        <tr className={isExp ? 'table-active' : ''}>
                                            <td className="px-4 fw-medium">#{order.id}</td>
                                            <td>
                                                <div className="small fw-medium">{order.name || u?.name || 'Khách'}</div>
                                                <div className="small text-muted">{order.phone}</div>
                                            </td>
                                            <td className="small fw-bold" style={{ color: '#2563eb' }}>{formatPrice(order.total)}</td>
                                            <td>
                                                <select
                                                    className={`badge bg-${STATUS_COLORS[order.status]?.split(' ')[0] || 'secondary'} border-0 fw-normal`}
                                                    value={order.status}
                                                    onChange={e => handleStatusChange(order, e.target.value)}
                                                    style={{ cursor: 'pointer', appearance: 'auto' }}
                                                >
                                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </td>
                                            <td className="small text-muted">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                            <td>
                                                <div className="d-flex gap-1">
                                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setExpandedOrder(isExp ? null : order.id)}>
                                                        <i className={`bi bi-chevron-${isExp ? 'up' : 'down'}`}></i>
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(order)}>
                                                        <i className="bi bi-trash3"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExp && (
                                            <tr>
                                                <td colSpan={6} className="p-0">
                                                    <div className="p-3 bg-light">
                                                        <div className="row g-3">
                                                            <div className="col-md-4">
                                                                <strong className="small text-muted">Địa chỉ giao hàng</strong>
                                                                <p className="small mt-1 mb-0">{order.address}</p>
                                                                {order.note && <p className="small text-muted mt-1"><i>Ghi chú: {order.note}</i></p>}
                                                            </div>
                                                            <div className="col-md-8">
                                                                <strong className="small text-muted">Sản phẩm</strong>
                                                                <div className="mt-1">
                                                                    {order.items?.map((item, i) => (
                                                                        <div key={i} className="d-flex gap-2 align-items-center mb-1">
                                                                            <img src={item.image} alt={item.name} className="rounded-2" style={{ width: 40, height: 32, objectFit: 'cover' }} />
                                                                            <span className="small flex-grow-1">{item.name}</span>
                                                                            <span className="small text-muted">{item.quantity} × {formatPrice(item.price)}</span>
                                                                            <span className="small fw-bold" style={{ color: '#2563eb' }}>{formatPrice(item.price * item.quantity)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
