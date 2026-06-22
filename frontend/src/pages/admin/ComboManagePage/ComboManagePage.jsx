import React, { useState, useRef, useEffect } from 'react';
import { MdAdd, MdClose, MdCloudUpload } from 'react-icons/md';
import comboApi from '../../../api/comboApi';
import axiosClient from '../../../api/axiosClient';
import { notify, confirmDialog } from '../../../utils/notify';
import styles from './ComboManagePage.module.scss';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${STORAGE_URL}/${img}`;
};

const ComboManagePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });

  const imageInputRef = useRef(null);

  const fetchCombos = async () => {
    setLoading(true);
    try {
      const res = await comboApi.getAll();
      setCombos(res.data || []);
    } catch (error) {
      console.error('Lỗi tải combo:', error);
      notify.error('Không tải được danh sách combo!', 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCombos(); }, []);

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'combos');
    const res = await axiosClient.post('/admin/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url;
  };

  const handleOpenModal = () => {
    setEditingCombo(null);
    setFormData({ name: '', description: '', price: '' });
    setPreviewImage(null);
    setImageFile(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (combo) => {
    setEditingCombo(combo);
    setFormData({
      name: combo.name || '',
      description: combo.description || '',
      price: combo.price || '',
    });
    setPreviewImage(getImageUrl(combo.image));
    setImageFile(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCombo(null);
    setPreviewImage(null);
    setImageFile(null);
    setErrors({});
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirmDialog({
      title: 'Xóa combo bắp nước?',
      message: 'Bạn có chắc chắn muốn xóa combo này không? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa combo',
      danger: true,
    });
    if (!ok) return;

    try {
      await comboApi.delete(id);
      notify.success('Đã xóa combo bắp nước thành công!', 'Thành công');
      handleCloseModal();
      fetchCombos();
    } catch {
      notify.error('Xóa combo bắp nước thất bại!', 'Lỗi');
    }
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên combo';
    }
    if (!formData.price) {
      newErrors.price = 'Vui lòng nhập giá combo';
    } else if (Number(formData.price) < 0) {
      newErrors.price = 'Giá combo phải lớn hơn hoặc bằng 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      let imageUrl = editingCombo?.image || '';
      if (imageFile) imageUrl = await uploadImage(imageFile);

      const payload = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        image: imageUrl || null,
      };

      if (editingCombo) {
        await comboApi.update(editingCombo.id, payload);
        notify.success('Đã cập nhật thông tin combo thành công!', 'Thành công');
      } else {
        await comboApi.create(payload);
        notify.success('Đã thêm combo bắp nước mới thành công!', 'Thành công');
      }

      handleCloseModal();
      fetchCombos();
    } catch (error) {
      console.error('Lỗi lưu combo:', error);
      notify.error('Lưu combo thất bại! ' + (error.response?.data?.message || ''), 'Lỗi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.comboManage}>
      <div className={styles.header}>
        <div>
          <h2>Quản lý Combo Bắp Nước</h2>
          <p className={styles.subtitle}>
            Combo sẽ được hiển thị khi khách hàng đặt vé để mua thêm.
          </p>
        </div>
        <button className={styles.addBtn} onClick={handleOpenModal}>
          <MdAdd /> Thêm Combo
        </button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Đang tải...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 80 }}>STT</th>
                <th style={{ width: 100 }}>Ảnh</th>
                <th style={{ width: 220 }}>Tên Combo</th>
                <th>Mô tả</th>
                <th style={{ width: 180 }}>Giá</th>
              </tr>
            </thead>
            <tbody>
              {combos.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>
                    Chưa có combo nào
                  </td>
                </tr>
              ) : (
                combos.map((combo, idx) => (
                  <tr key={combo.id} onClick={() => handleEdit(combo)}>
                    <td>{idx + 1}</td>
                    <td>
                      {combo.image ? (
                        <img src={getImageUrl(combo.image)} alt={combo.name} className={styles.comboThumb} />
                      ) : (
                        <div className={styles.comboThumb} style={{ background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#888' }}>
                          No image
                        </div>
                      )}
                    </td>
                    <td><strong>{combo.name}</strong></td>
                    <td>{combo.description || <span style={{ color: '#999' }}>—</span>}</td>
                    <td><span className={styles.priceBadge}>{Number(combo.price).toLocaleString('vi-VN')} VNĐ</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{editingCombo ? 'Sửa Combo' : 'Thêm Combo Mới'}</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}><MdClose /></button>
            </div>

            <div className={styles.modalBody}>
              <form className={styles.form} onSubmit={(e) => e.preventDefault()} noValidate>
                <div className={styles.formRow}>
                  <div className={styles.formGroup} style={{ flex: 2 }}>
                    <label>Tên combo *</label>
                    <input
                      type="text" name="name"
                      value={formData.name} onChange={handleChange}
                      placeholder="VD: Combo Đôi - 2 nước + 1 bắp lớn"
                      className={errors.name ? 'inputErrorGlobal' : ''}
                    />
                    {errors.name && <span className="errorTextGlobal">{errors.name}</span>}
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label>Giá (VNĐ) *</label>
                    <input
                      type="number" name="price"
                      value={formData.price} onChange={handleChange}
                      placeholder="109000" min="0" step="1000"
                      className={errors.price ? 'inputErrorGlobal' : ''}
                    />
                    {errors.price && <span className="errorTextGlobal">{errors.price}</span>}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Mô tả</label>
                  <textarea
                    rows="3" name="description"
                    value={formData.description} onChange={handleChange}
                    placeholder="VD: 1 bắp ngọt 70oz + 2 nước Coca 32oz"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Ảnh combo</label>
                  <div
                    className={styles.uploadArea}
                    onClick={() => imageInputRef.current.click()}
                    style={{ backgroundImage: previewImage ? `url(${previewImage})` : 'none' }}
                  >
                    {!previewImage && (
                      <div className={styles.uploadPlaceholder}>
                        <MdCloudUpload className={styles.uploadIcon} />
                        <span>Click để tải ảnh lên</span>
                      </div>
                    )}
                    <input
                      type="file" accept="image/*" ref={imageInputRef}
                      onChange={handleImageUpload} hidden
                    />
                  </div>
                  <small className={styles.hint}>
                    ⚠️ <strong>Yêu cầu:</strong> Tỉ lệ <strong>vuông 1:1</strong> (khuyến nghị <strong>500×500px</strong>),
                    định dạng JPG/PNG/WEBP, dung lượng ≤ 10MB. Ảnh nền trong suốt sẽ đẹp hơn.
                  </small>
                </div>
              </form>
            </div>

            <div className={styles.modalFooter}>
               {editingCombo && (
                 <button type="button" className={styles.deleteBtnModal} onClick={() => handleDelete(editingCombo.id)} disabled={saving}>
                   Xóa Combo
                 </button>
               )}
               <button className={styles.cancelBtn} onClick={handleCloseModal}>Hủy</button>
               <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                 {saving ? 'Đang lưu...' : editingCombo ? 'Cập Nhật' : 'Lưu Combo'}
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComboManagePage;
