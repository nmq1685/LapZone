import React, { useEffect, useState, useRef } from 'react';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '../../services/api';
import { toast } from 'react-toastify';

const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const EMPTY_FORM = {
    name: '', brand: '', categoryId: '', price: '', oldPrice: '', description: '',
    specs: { cpu: '', ram: '', storage: '', display: '', gpu: '', battery: '', weight: '', os: '' },
    images: [''], stock: '', visible: true, featured: false, tags: [],
};

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [imgMode, setImgMode] = useState('url'); // 'url' or 'file'
    const fileInputRef = useRef(null);

    const load = async () => {
        setLoading(true);
        const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
        setProducts(prods);
        setCategories(cats);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setImgMode('url');
        setShowModal(true);
    };

    const openEdit = (product) => {
        setEditing(product);
        setForm({
            ...product,
            price: product.price,
            oldPrice: product.oldPrice || '',
            stock: product.stock,
            images: product.images?.length ? product.images : [''],
            specs: product.specs || EMPTY_FORM.specs,
        });
        setImgMode('url');
        setShowModal(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSpecChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, specs: { ...prev.specs, [name]: value } }));
    };

    const handleImageChange = (idx, value) => {
        setForm(prev => {
            const imgs = [...prev.images];
            imgs[idx] = value;
            return { ...prev, images: imgs };
        });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setForm(prev => ({ ...prev, images: [reader.result, ...prev.images.slice(1)] }));
        };
        reader.readAsDataURL(file);
    };

    const addImageField = () => setForm(prev => ({ ...prev, images: [...prev.images, ''] }));
    const removeImageField = (idx) => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

    const handleTagToggle = (tag) => {
        setForm(prev => ({
            ...prev,
            tags: prev.tags?.includes(tag) ? prev.tags.filter(t => t !== tag) : [...(prev.tags || []), tag],
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name || !form.price || !form.categoryId) { toast.error('Vui lòng điền đầy đủ thông tin bắt buộc'); return; }
        setSaving(true);
        try {
            const payload = {
                ...form,
                categoryId: Number(form.categoryId),
                price: Number(form.price),
                oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
                stock: Number(form.stock) || 0,
                images: form.images.filter(Boolean),
                rating: editing?.rating || 0,
                reviewCount: editing?.reviewCount || 0,
                createdAt: editing?.createdAt || new Date().toISOString(),
            };
            if (editing) {
                await updateProduct(editing.id, payload);
                toast.success('Cập nhật sản phẩm thành công!');
            } else {
                await createProduct(payload);
                toast.success('Thêm sản phẩm thành công!');
            }
            setShowModal(false);
            load();
        } catch {
            toast.error('Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (product) => {
        if (!window.confirm(`Xoá sản phẩm "${product.name}"?`)) return;
        await deleteProduct(product.id);
        toast.success('Đã xoá sản phẩm');
        load();
    };

    const toggleVisible = async (product) => {
        await updateProduct(product.id, { ...product, visible: !product.visible });
        load();
    };

    const filtered = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Quản lý sản phẩm</h4>
                <button className="btn btn-primary" onClick={openCreate}>
                    <i className="bi bi-plus-lg me-2"></i>Thêm sản phẩm
                </button>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body pb-0">
                    <div className="d-flex gap-2 mb-3">
                        <input className="form-control" style={{ maxWidth: 300 }} placeholder="Tìm kiếm sản phẩm..." value={search} onChange={e => setSearch(e.target.value)} />
                        <span className="badge bg-secondary d-flex align-items-center">{filtered.length} sản phẩm</span>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th className="small text-muted fw-semibold px-4">Sản phẩm</th>
                                <th className="small text-muted fw-semibold">Danh mục</th>
                                <th className="small text-muted fw-semibold">Giá</th>
                                <th className="small text-muted fw-semibold">Tồn kho</th>
                                <th className="small text-muted fw-semibold">Hiển thị</th>
                                <th className="small text-muted fw-semibold">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-4"><div className="spinner-border spinner-border-sm"></div></td></tr>
                            ) : filtered.map(p => (
                                <tr key={p.id}>
                                    <td className="px-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <img src={p.images?.[0]} alt={p.name} className="rounded-2" style={{ width: 48, height: 38, objectFit: 'cover', background: '#f1f5f9' }} />
                                            <div>
                                                <div className="small fw-medium">{p.name}</div>
                                                <div className="small text-muted">{p.brand}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="small">{categories.find(c => c.id === p.categoryId)?.name || '-'}</td>
                                    <td className="small fw-medium" style={{ color: '#2563eb' }}>{formatPrice(p.price)}</td>
                                    <td><span className={`badge ${p.stock > 5 ? 'bg-success' : p.stock > 0 ? 'bg-warning text-dark' : 'bg-danger'}`}>{p.stock}</span></td>
                                    <td>
                                        <div className="form-check form-switch mb-0">
                                            <input className="form-check-input" type="checkbox" checked={p.visible} onChange={() => toggleVisible(p)} />
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(p)}><i className="bi bi-pencil"></i></button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p)}><i className="bi bi-trash3"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-xl modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">{editing ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSave}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        {/* Basic Info */}
                                        <div className="col-md-8">
                                            <label className="form-label small fw-medium">Tên sản phẩm *</label>
                                            <input type="text" className="form-control" name="name" value={form.name} onChange={handleChange} required />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-medium">Thương hiệu</label>
                                            <input type="text" className="form-control" name="brand" value={form.brand} onChange={handleChange} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-medium">Danh mục *</label>
                                            <select className="form-select" name="categoryId" value={form.categoryId} onChange={handleChange} required>
                                                <option value="">-- Chọn danh mục --</option>
                                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-medium">Giá bán (VND) *</label>
                                            <input type="number" className="form-control" name="price" value={form.price} onChange={handleChange} required min={0} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-medium">Giá gốc (VND)</label>
                                            <input type="number" className="form-control" name="oldPrice" value={form.oldPrice} onChange={handleChange} min={0} />
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-medium">Tồn kho</label>
                                            <input type="number" className="form-control" name="stock" value={form.stock} onChange={handleChange} min={0} />
                                        </div>
                                        <div className="col-md-4 d-flex flex-column gap-2 justify-content-end">
                                            <div className="form-check form-switch">
                                                <input className="form-check-input" type="checkbox" name="visible" checked={form.visible} onChange={handleChange} id="visibleCheck" />
                                                <label className="form-check-label small" htmlFor="visibleCheck">Hiển thị</label>
                                            </div>
                                            <div className="form-check form-switch">
                                                <input className="form-check-input" type="checkbox" name="featured" checked={form.featured} onChange={handleChange} id="featuredCheck" />
                                                <label className="form-check-label small" htmlFor="featuredCheck">Nổi bật</label>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-medium">Tags</label>
                                            <div className="d-flex gap-2 flex-wrap">
                                                {['new', 'hot', 'sale', 'bestseller'].map(tag => (
                                                    <button key={tag} type="button" className={`btn btn-xs ${form.tags?.includes(tag) ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => handleTagToggle(tag)}>{tag}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-medium">Mô tả</label>
                                            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={3} />
                                        </div>

                                        {/* Images */}
                                        <div className="col-12">
                                            <label className="form-label small fw-medium">Hình ảnh</label>
                                            <div className="d-flex gap-2 mb-2">
                                                <button type="button" className={`btn btn-xs ${imgMode === 'url' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setImgMode('url')}>
                                                    <i className="bi bi-link-45deg me-1"></i>URL
                                                </button>
                                                <button type="button" className={`btn btn-xs ${imgMode === 'file' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setImgMode('file')}>
                                                    <i className="bi bi-upload me-1"></i>Tải file
                                                </button>
                                            </div>
                                            {imgMode === 'file' && (
                                                <div className="mb-2">
                                                    <input type="file" ref={fileInputRef} className="form-control form-control-sm" accept="image/*" onChange={handleFileUpload} />
                                                    <small className="text-muted">File ảnh sẽ được chuyển thành Base64</small>
                                                </div>
                                            )}
                                            {form.images.map((img, idx) => (
                                                <div key={idx} className="d-flex gap-2 mb-2 align-items-center">
                                                    {img && <img src={img} alt="" className="rounded-2" style={{ width: 48, height: 38, objectFit: 'cover', background: '#f1f5f9' }} />}
                                                    <input type="text" className="form-control form-control-sm" placeholder="URL hình ảnh..." value={img} onChange={e => handleImageChange(idx, e.target.value)} />
                                                    {form.images.length > 1 && (
                                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeImageField(idx)}><i className="bi bi-x"></i></button>
                                                    )}
                                                </div>
                                            ))}
                                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={addImageField}>
                                                <i className="bi bi-plus me-1"></i>Thêm ảnh
                                            </button>
                                        </div>

                                        {/* Specs */}
                                        <div className="col-12">
                                            <label className="form-label small fw-medium">Thông số kỹ thuật</label>
                                            <div className="row g-2">
                                                {Object.keys(EMPTY_FORM.specs).map(key => (
                                                    <div className="col-md-3" key={key}>
                                                        <label className="form-label small text-muted text-uppercase">{key}</label>
                                                        <input type="text" className="form-control form-control-sm" name={key} value={form.specs?.[key] || ''} onChange={handleSpecChange} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Huỷ</button>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang lưu...</> : <><i className="bi bi-save me-2"></i>Lưu</>}
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

export default AdminProducts;
