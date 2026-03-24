import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Vui lòng nhập họ tên';
        if (!form.email) e.email = 'Vui lòng nhập email';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email không hợp lệ';
        if (!form.password) e.password = 'Vui lòng nhập mật khẩu';
        else if (form.password.length < 6) e.password = 'Mật khẩu ít nhất 6 ký tự';
        if (form.password !== form.confirm) e.confirm = 'Mật khẩu xác nhận không khớp';
        if (form.phone && !/^0\d{9}$/.test(form.phone)) e.phone = 'Số điện thoại không hợp lệ';
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
            await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
            toast.success('Đăng ký thành công! Chào mừng bạn đến với LaptopZone!');
            navigate('/');
        } catch (err) {
            toast.error(err.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page d-flex align-items-center justify-content-center py-5">
            <div className="auth-card">
                <div className="text-center mb-4">
                    <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3">
                        <i className="bi bi-laptop fs-3" style={{ color: '#38bdf8' }}></i>
                        <span className="fw-bold fs-4" style={{ color: '#0f172a' }}>LaptopZone</span>
                    </Link>
                    <h4 className="fw-bold">Tạo tài khoản</h4>
                    <p className="text-muted small">Đăng ký để mua sắm dễ dàng hơn</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {[
                        { label: 'Họ và tên', name: 'name', type: 'text', icon: 'person', placeholder: 'Nguyễn Văn A', required: true },
                        { label: 'Email', name: 'email', type: 'email', icon: 'envelope', placeholder: 'email@example.com', required: true },
                        { label: 'Số điện thoại', name: 'phone', type: 'tel', icon: 'phone', placeholder: '0901234567', required: false },
                    ].map(field => (
                        <div className="mb-3" key={field.name}>
                            <label className="form-label small fw-medium">{field.label}{field.required && ' *'}</label>
                            <div className="input-group">
                                <span className="input-group-text"><i className={`bi bi-${field.icon} text-muted`}></i></span>
                                <input
                                    type={field.type}
                                    className={`form-control ${errors[field.name] ? 'is-invalid' : ''}`}
                                    name={field.name}
                                    value={form[field.name]}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                />
                                {errors[field.name] && <div className="invalid-feedback">{errors[field.name]}</div>}
                            </div>
                        </div>
                    ))}

                    <div className="mb-3">
                        <label className="form-label small fw-medium">Mật khẩu *</label>
                        <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-lock text-muted"></i></span>
                            <input type={showPass ? 'text' : 'password'} className={`form-control ${errors.password ? 'is-invalid' : ''}`} name="password" value={form.password} onChange={handleChange} placeholder="Ít nhất 6 ký tự" />
                            <button type="button" className="input-group-text" onClick={() => setShowPass(s => !s)}>
                                <i className={`bi bi-eye${showPass ? '-slash' : ''} text-muted`}></i>
                            </button>
                            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="form-label small fw-medium">Xác nhận mật khẩu *</label>
                        <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-lock-fill text-muted"></i></span>
                            <input type={showPass ? 'text' : 'password'} className={`form-control ${errors.confirm ? 'is-invalid' : ''}`} name="confirm" value={form.confirm} onChange={handleChange} placeholder="Nhập lại mật khẩu" />
                            {errors.confirm && <div className="invalid-feedback">{errors.confirm}</div>}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
                        {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang đăng ký...</> : 'Đăng ký'}
                    </button>
                </form>

                <p className="text-center mt-3 small text-muted">
                    Đã có tài khoản? <Link to="/login" className="text-primary fw-medium text-decoration-none">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
