import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark sticky-top" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', boxShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
                    <div className="brand-icon">
                        <i className="bi bi-laptop"></i>
                    </div>
                    <div>
                        <span className="fw-bold fs-5" style={{ color: '#38bdf8' }}>Laptop</span>
                        <span className="fw-bold fs-5 text-white">Zone</span>
                    </div>
                </Link>

                <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navMenu">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <NavLink className="nav-link fw-medium" to="/">Trang chủ</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-link fw-medium" to="/products">Sản phẩm</NavLink>
                        </li>
                        <li className="nav-item dropdown">
                            <span className="nav-link fw-medium dropdown-toggle" role="button" data-bs-toggle="dropdown">
                                Danh mục
                            </span>
                            <ul className="dropdown-menu dropdown-menu-dark border-0 shadow-lg">
                                <li><Link className="dropdown-item" to="/products?category=1"><i className="bi bi-controller me-2 text-danger"></i>Gaming</Link></li>
                                <li><Link className="dropdown-item" to="/products?category=2"><i className="bi bi-briefcase me-2 text-primary"></i>Văn phòng</Link></li>
                                <li><Link className="dropdown-item" to="/products?category=3"><i className="bi bi-phone me-2 text-info"></i>Siêu mỏng</Link></li>
                                <li><Link className="dropdown-item" to="/products?category=4"><i className="bi bi-mortarboard me-2 text-success"></i>Sinh viên</Link></li>
                                <li><Link className="dropdown-item" to="/products?category=5"><i className="bi bi-palette me-2 text-warning"></i>Đồ họa</Link></li>
                            </ul>
                        </li>
                    </ul>

                    <div className="d-flex align-items-center gap-3">
                        {/* Cart */}
                        <Link to="/cart" className="btn btn-outline-light btn-sm position-relative">
                            <i className="bi bi-cart3 fs-5"></i>
                            {cartCount > 0 && (
                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User menu */}
                        {user ? (
                            <div className="dropdown">
                                <button className="btn btn-sm d-flex align-items-center gap-2 text-white border border-secondary rounded-pill px-3" data-bs-toggle="dropdown">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 28, height: 28, background: '#38bdf8', color: '#0f172a', fontWeight: 700, fontSize: 13 }}>
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="fw-medium" style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                                    <i className="bi bi-chevron-down small"></i>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark border-0 shadow-lg mt-1">
                                    {user.role === 'admin' && (
                                        <>
                                            <li><Link className="dropdown-item" to="/admin"><i className="bi bi-speedometer2 me-2 text-warning"></i>Admin Panel</Link></li>
                                            <li><hr className="dropdown-divider border-secondary" /></li>
                                        </>
                                    )}
                                    <li><Link className="dropdown-item" to="/profile"><i className="bi bi-person me-2 text-info"></i>Hồ sơ cá nhân</Link></li>
                                    <li><Link className="dropdown-item" to="/orders"><i className="bi bi-bag me-2 text-success"></i>Đơn hàng của tôi</Link></li>
                                    <li><hr className="dropdown-divider border-secondary" /></li>
                                    <li>
                                        <button className="dropdown-item text-danger" onClick={handleLogout}>
                                            <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        ) : (
                            <div className="d-flex gap-2">
                                <Link to="/login" className="btn btn-outline-light btn-sm fw-medium">Đăng nhập</Link>
                                <Link to="/register" className="btn btn-sm fw-medium" style={{ background: '#38bdf8', color: '#0f172a' }}>Đăng ký</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;
