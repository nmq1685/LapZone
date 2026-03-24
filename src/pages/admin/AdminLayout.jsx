import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const navItems = [
        { path: '/admin', icon: 'speedometer2', label: 'Dashboard', exact: true },
        { path: '/admin/products', icon: 'box-seam', label: 'Sản phẩm' },
        { path: '/admin/categories', icon: 'tags', label: 'Danh mục' },
        { path: '/admin/orders', icon: 'bag', label: 'Đơn hàng' },
        { path: '/admin/reviews', icon: 'star', label: 'Đánh giá' },
    ];

    const isActive = (path, exact) => exact ? location.pathname === path : location.pathname.startsWith(path);

    return (
        <div className="admin-layout d-flex" style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
                <div className="sidebar-header">
                    <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
                        <i className="bi bi-laptop fs-4" style={{ color: '#38bdf8' }}></i>
                        {sidebarOpen && <span className="fw-bold" style={{ color: '#38bdf8' }}>LaptopZone</span>}
                    </Link>
                    <button className="btn btn-sm text-white-50" onClick={() => setSidebarOpen(o => !o)}>
                        <i className={`bi bi-chevron-${sidebarOpen ? 'left' : 'right'}`}></i>
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
                        >
                            <i className={`bi bi-${item.icon}`}></i>
                            {sidebarOpen && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <Link to="/" className="sidebar-nav-item">
                        <i className="bi bi-house"></i>
                        {sidebarOpen && <span>Trang chủ</span>}
                    </Link>
                    <button className="sidebar-nav-item btn text-white w-100 text-start" onClick={() => { logout(); navigate('/'); }}>
                        <i className="bi bi-box-arrow-left"></i>
                        {sidebarOpen && <span>Đăng xuất</span>}
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="admin-main flex-grow-1">
                <header className="admin-header">
                    <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-sm d-lg-none" onClick={() => setSidebarOpen(o => !o)}>
                            <i className="bi bi-list fs-5"></i>
                        </button>
                        <h5 className="mb-0 fw-bold">
                            {navItems.find(n => isActive(n.path, n.exact))?.label || 'Admin'}
                        </h5>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <div className="d-flex align-items-center gap-2">
                            <div className="avatar-sm">{user?.name?.charAt(0).toUpperCase()}</div>
                            <span className="small fw-medium d-none d-md-block">{user?.name}</span>
                        </div>
                    </div>
                </header>
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
