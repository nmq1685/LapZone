import React, { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';
import { toast } from 'react-toastify';

const EMPTY_FORM = { name: '', slug: '', description: '', image: '' };

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        setCategories(await getCategories());
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (cat) => { setEditing(cat); setForm({ ...cat }); setShowModal(true); };

    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const autoSlug = (name) => {
        const s = name.toLowerCase()
            .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
            .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
            .replace(/[ìíịỉĩ]/g, 'i')
            .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
            .replace(/[ùúụủũưừứựửữ]/g, 'u')
            .replace(/[ỳýỵỷỹ]/g, 'y')
            .replace(/đ/g, 'd')
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        setForm(prev => ({ ...prev, name, slug: s }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) { toast.error('Vui lòng nhập tên danh mục'); return; }
        setSaving(true);
        try {
            if (editing) {
                await updateCategory(editing.id, form);
                toast.success('Cập nhật danh mục thành công!');
            } else {
                await createCategory(form);
                toast.success('Thêm danh mục thành công!');
            }
            setShowModal(false);
            load();
        } catch {
            toast.error('Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (cat) => {
        if (!window.confirm(`Xoá danh mục "${cat.name}"?`)) return;
        await deleteCategory(cat.id);
        toast.success('Đã xoá danh mục');
        load();
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Quản lý danh mục</h4>
                <button className="btn btn-primary" onClick={openCreate}>
                    <i className="bi bi-plus-lg me-2"></i>Thêm danh mục
                </button>
            </div>

            <div className="row g-3">
                {loading ? (
                    <div className="text-center py-4"><div className="spinner-border spinner-border-sm"></div></div>
                ) : categories.map(cat => (
                    <div key={cat.id} className="col-lg-4 col-md-6">
                        <div className="card border-0 shadow-sm h-100">
                            <div className="position-relative">
                                <img src={cat.image} alt={cat.name} className="card-img-top" style={{ height: 140, objectFit: 'cover' }} />
                            </div>
                            <div className="card-body">
                                <h6 className="fw-bold mb-1">{cat.name}</h6>
                                <code className="small text-muted">{cat.slug}</code>
                                <p className="small text-muted mt-1 mb-3">{cat.description}</p>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-sm btn-outline-primary flex-grow-1" onClick={() => openEdit(cat)}>
                                        <i className="bi bi-pencil me-1"></i>Sửa
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(cat)}>
                                        <i className="bi bi-trash3"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSave}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label small fw-medium">Tên danh mục *</label>
                                        <input type="text" className="form-control" name="name" value={form.name} onChange={e => autoSlug(e.target.value)} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-medium">Slug</label>
                                        <input type="text" className="form-control" name="slug" value={form.slug} onChange={handleChange} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-medium">Mô tả</label>
                                        <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={3} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-medium">URL hình ảnh</label>
                                        <input type="text" className="form-control" name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
                                        {form.image && <img src={form.image} alt="" className="mt-2 rounded-2 w-100" style={{ height: 100, objectFit: 'cover' }} />}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Huỷ</button>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? <span className="spinner-border spinner-border-sm me-2"></span> : null}Lưu
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
