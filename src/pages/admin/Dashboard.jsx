import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getOrders, getUsers, getReviews } from '../../services/api';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const STATUS_COLORS = { Pending: 'warning', Processing: 'info', Shipping: 'primary', Delivered: 'success', Cancelled: 'danger' };

const Dashboard = () => {
    const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, reviews: 0, revenue: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const [products, orders, users, reviews] = await Promise.all([
                getProducts(), getOrders(), getUsers(), getReviews(),
            ]);
            const revenue = orders.filter(o => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0);
            setStats({ products: products.length, orders: orders.length, users: users.length, reviews: reviews.length, revenue });
            setRecentOrders(orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8));
            setLoading(false);
        };
        load();
    }, []);

    const statCards = [
        { label: 'Sản phẩm', value: stats.products, icon: 'box-seam', color: '#3b82f6', bg: '#eff6ff', link: '/admin/products' },
        { label: 'Đơn hàng', value: stats.orders, icon: 'bag', color: '#22c55e', bg: '#f0fdf4', link: '/admin/orders' },
        { label: 'Người dùng', value: stats.users, icon: 'people', color: '#a855f7', bg: '#faf5ff', link: '#' },
        { label: 'Đánh giá', value: stats.reviews, icon: 'star', color: '#f59e0b', bg: '#fffbeb', link: '/admin/reviews' },
    ];

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="spinner-border" style={{ color: '#38bdf8' }}></div>
        </div>
    );

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Dashboard</h4>
                <span className="text-muted small">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            {/* Stats */}
            <div className="row g-3 mb-4">
                {statCards.map(card => (
                    <div key={card.label} className="col-xl-3 col-md-6">
                        <Link to={card.link} className="text-decoration-none">
                            <div className="card border-0 shadow-sm h-100 stat-card">
                                <div className="card-body d-flex align-items-center gap-3">
                                    <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
                                        <i className={`bi bi-${card.icon}`}></i>
                                    </div>
                                    <div>
                                        <div className="small text-muted">{card.label}</div>
                                        <div className="fw-bold fs-3">{card.value.toLocaleString('vi-VN')}</div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Revenue */}
            <div className="card border-0 shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', color: 'white' }}>
                <div className="card-body d-flex align-items-center gap-4 py-4">
                    <div className="stat-icon" style={{ background: 'rgba(56,189,248,0.2)', color: '#38bdf8', width: 56, height: 56 }}>
                        <i className="bi bi-currency-dollar fs-4"></i>
                    </div>
                    <div>
                        <div className="small opacity-75">Doanh thu (đơn thành công)</div>
                        <div className="fw-bold" style={{ fontSize: '2rem', color: '#38bdf8' }}>{formatPrice(stats.revenue)}</div>
                    </div>
                </div>
            </div>

            {/* Recent orders */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-0">Đơn hàng gần đây</h6>
                    <Link to="/admin/orders" className="btn btn-sm btn-outline-primary">Xem tất cả</Link>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead style={{ background: '#f8fafc' }}>
                                <tr>
                                    <th className="small text-muted fw-semibold px-4">Mã đơn</th>
                                    <th className="small text-muted fw-semibold">Khách hàng</th>
                                    <th className="small text-muted fw-semibold">Tổng tiền</th>
                                    <th className="small text-muted fw-semibold">Trạng thái</th>
                                    <th className="small text-muted fw-semibold">Ngày đặt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td className="px-4 small fw-medium">#{order.id}</td>
                                        <td className="small">{order.name || `User #${order.userId}`}</td>
                                        <td className="small fw-medium" style={{ color: '#2563eb' }}>{formatPrice(order.total)}</td>
                                        <td>
                                            <span className={`badge bg-${STATUS_COLORS[order.status] || 'secondary'} ${order.status === 'Pending' ? 'text-dark' : ''}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="small text-muted">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
