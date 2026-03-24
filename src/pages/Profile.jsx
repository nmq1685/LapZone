import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('info');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSaveInfo = async (e) => {
        e.preventDefault();
        const e2 = {};
        if (!form.name.trim()) e2.name = 'Vui lòng nhập họ tên';
        if (form.phone && !/^0\d{9}$/.test(form.phone)) e2.phone = 'Số điện thoại không hợp lệ';
        setErrors(e2);
        if (Object.keys(e2).length > 0) return;
        setSaving(true);
        try {
            await updateProfile({ name: form.name, phone: form.phone, address: form.address });
            toast.success('Cập nhật hồ sơ thành công!');
        } catch {
            toast.error('Cập nhật thất bại, thử lại sau.');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        const e2 = {};
        if (form.currentPassword !== user.password) e2.currentPassword = 'Mật khẩu hiện tại không đúng';
        if (!form.newPassword) e2.newPassword = 'Vui lòng nhập mật khẩu mới';
        else if (form.newPassword.length < 6) e2.newPassword = 'Mật khẩu ít nhất 6 ký tự';
        if (form.newPassword !== form.confirmPassword) e2.confirmPassword = 'Mật khẩu xác nhận không khớp';
        setErrors(e2);
        if (Object.keys(e2).length > 0) return;
        setSaving(true);
        try {
            await updateProfile({ password: form.newPassword });
            setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
            toast.success('Đổi mật khẩu thành công!');
        } catch {
            toast.error('Đổi mật khẩu thất bại.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="py-4" style={{ background: '#f8fafc', minHeight: '80vh' }}>
            <div className="container" style={{ maxWidth: 700 }}>
                <h3 className="fw-bold mb-4">Hồ sơ cá nhân</h3>

                {/* Avatar + name */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body d-flex align-items-center gap-4 py-4">
                        <div className="avatar-lg d-flex align-items-center justify-content-center rounded-circle" style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #38bdf8, #2563eb)', color: '#fff', fontWeight: 700, fontSize: 28 }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h5 className="fw-bold mb-0">{user?.name}</h5>
                            <p className="text-muted small mb-1">{user?.email}</p>
                            <span className={`badge ${user?.role === 'admin' ? 'bg-warning text-dark' : 'bg-success'}`}>
                                {user?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-0 pt-3 px-4">
                        <ul className="nav nav-tabs border-0">
                            <li className="nav-item">
                                <button className={`nav-link fw-medium ${activeTab === 'info' ? 'active' : 'text-muted'}`} onClick={() => setActiveTab('info')}>
                                    <i className="bi bi-person me-1"></i>Thông tin
                                </button>
                            </li>
                            <li className="nav-item">
                                <button className={`nav-link fw-medium ${activeTab === 'password' ? 'active' : 'text-muted'}`} onClick={() => setActiveTab('password')}>
                                    <i className="bi bi-shield-lock me-1"></i>Đổi mật khẩu
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div className="card-body px-4 py-4">
                        {activeTab === 'info' && (
                            <form onSubmit={handleSaveInfo}>
                                <div className="mb-3">
                                    <label className="form-label small fw-medium">Họ và tên *</label>
                                    <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''}`} name="name" value={form.name} onChange={handleChange} />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-medium">Email</label>
                                    <input type="email" className="form-control bg-light" value={user?.email} readOnly />
                                    <small className="text-muted">Email không thể thay đổi</small>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-medium">Số điện thoại</label>
                                    <input type="tel" className={`form-control ${errors.phone ? 'is-invalid' : ''}`} name="phone" value={form.phone} onChange={handleChange} placeholder="0901234567" />
                                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                                </div>
                                <div className="mb-4">
                                    <label className="form-label small fw-medium">Địa chỉ</label>
                                    <textarea className="form-control" name="address" value={form.address} onChange={handleChange} rows={3} placeholder="Địa chỉ của bạn..." />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang lưu...</> : <><i className="bi bi-save me-2"></i>Lưu thay đổi</>}
                                </button>
                            </form>
                        )}
                        {activeTab === 'password' && (
                            <form onSubmit={handleChangePassword}>
                                {[
                                    { label: 'Mật khẩu hiện tại', name: 'currentPassword' },
                                    { label: 'Mật khẩu mới', name: 'newPassword' },
                                    { label: 'Xác nhận mật khẩu mới', name: 'confirmPassword' },
                                ].map(f => (
                                    <div className="mb-3" key={f.name}>
                                        <label className="form-label small fw-medium">{f.label}</label>
                                        <input type="password" className={`form-control ${errors[f.name] ? 'is-invalid' : ''}`} name={f.name} value={form[f.name]} onChange={handleChange} />
                                        {errors[f.name] && <div className="invalid-feedback">{errors[f.name]}</div>}
                                    </div>
                                ))}
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang lưu...</> : <><i className="bi bi-shield-lock me-2"></i>Đổi mật khẩu</>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
