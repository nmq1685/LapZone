import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.email) e.email = 'Vui lòng nhập email';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email không hợp lệ';
        if (!form.password) e.password = 'Vui lòng nhập mật khẩu';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const user = await login(form.email, form.password);
            toast.success(`Chào mừng ${user.name}!`);
            navigate(from, { replace: true });
        } catch (err) {
            toast.error(err.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (role) => {
        if (role === 'admin') setForm({ email: 'admin@laptopzone.vn', password: 'admin123' });
        else setForm({ email: 'user@laptopzone.vn', password: 'user123' });
    };

    return (
        <div className="auth-page d-flex align-items-center justify-content-center py-5">
            <div className="auth-card">
                <div className="text-center mb-4">
                    <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3">
                        <i className="bi bi-laptop fs-3" style={{ color: '#38bdf8' }}></i>
                        <span className="fw-bold fs-4" style={{ color: '#0f172a' }}>LaptopZone</span>
                    </Link>
                    <h4 className="fw-bold">Đăng nhập</h4>
                    <p className="text-muted small">Chào mừng bạn quay trở lại!</p>
                </div>

                {/* Demo accounts */}
                <div className="d-flex gap-2 mb-3">
                    <button className="btn btn-outline-primary btn-sm flex-grow-1" onClick={() => fillDemo('user')}>
                        <i className="bi bi-person me-1"></i>Demo User
                    </button>
                    <button className="btn btn-outline-warning btn-sm flex-grow-1" onClick={() => fillDemo('admin')}>
                        <i className="bi bi-shield me-1"></i>Demo Admin
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label small fw-medium">Email</label>
                        <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-envelope text-muted"></i></span>
                            <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" autoComplete="email" />
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="form-label small fw-medium">Mật khẩu</label>
                        <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-lock text-muted"></i></span>
                            <input type={showPass ? 'text' : 'password'} className={`form-control ${errors.password ? 'is-invalid' : ''}`} name="password" value={form.password} onChange={handleChange} placeholder="••••••••" autoComplete="current-password" />
                            <button type="button" className="input-group-text" onClick={() => setShowPass(s => !s)}>
                                <i className={`bi bi-eye${showPass ? '-slash' : ''} text-muted`}></i>
                            </button>
                            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
                        {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang đăng nhập...</> : 'Đăng nhập'}
                    </button>
                </form>

                <p className="text-center mt-3 small text-muted">
                    Chưa có tài khoản? <Link to="/register" className="text-primary fw-medium text-decoration-none">Đăng ký ngay</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
