import React, { useState, useRef, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose, MdCloudUpload } from 'react-icons/md';
import comboApi from '../../../api/comboApi';
import axiosClient from '../../../api/axiosClient';
import Toast from '../../../components/Toast/Toast';
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

  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });

  const [toast, setToast] = useState({ message: '', type: 'success' });
  const imageInputRef = useRef(null);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const closeToast = () => setToast({ message: '', type: 'success' });

  const fetchCombos = async () => {
    setLoading(true);
    try {
      const res = await comboApi.getAll();
      setCombos(res.data || []);
    } catch (error) {
      console.error('Lỗi tải combo:', error);
      showToast('Không tải được danh sách combo!', 'error');
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCombo(null);
    setPreviewImage(null);
    setImageFile(null);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
    if (!window.confirm('Bạn có chắc muốn xóa combo này?')) return;
    try {
      await comboApi.delete(id);
      showToast('Đã xóa combo!', 'success');
      fetchCombos();
    } catch {
      showToast('Xóa combo thất bại!', 'error');
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      showToast('Vui lòng nhập tên và giá combo!', 'error');
      return;
    }
    if (Number(formData.price) < 0) {
      showToast('Giá combo phải lớn hơn 0!', 'error');
      return;
    }

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
        showToast('Đã cập nhật combo!', 'success');
      } else {
        await comboApi.create(payload);
        showToast('Đã thêm combo mới!', 'success');
      }

      handleCloseModal();
      fetchCombos();
    } catch (error) {
      console.error('Lỗi lưu combo:', error);
      showToast('Lưu combo thất bại! ' + (error.response?.data?.message || ''), 'error');
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

      <div className={styles.gridContainer}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#aaa', gridColumn: '1/-1' }}>
            Đang tải...
          </p>
        ) : combos.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#aaa', gridColumn: '1/-1' }}>
            Chưa có combo nào
          </p>
        ) : (
          combos.map((combo) => (
            <div key={combo.id} className={styles.comboCard}>
              <div className={styles.comboImageWrap}>
                {combo.image ? (
                  <img src={getImageUrl(combo.image)} alt={combo.name} className={styles.comboImage} />
                ) : (
                  <div className={styles.comboImagePlaceholder}>No image</div>
                )}
              </div>
              <div className={styles.comboBody}>
                <h4 className={styles.comboName}>{combo.name}</h4>
                {combo.description && (
                  <p className={styles.comboDesc}>{combo.description}</p>
                )}
                <div className={styles.comboPrice}>
                  {Number(combo.price).toLocaleString('vi-VN')} VNĐ
                </div>
                <div className={styles.cardActions}>
                  <button className={styles.editBtn} onClick={() => handleEdit(combo)}>
                    <MdEdit /> Sửa
                  </button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(combo.id)}>
                    <MdDelete /> Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
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
              <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup} style={{ flex: 2 }}>
                    <label>Tên combo *</label>
                    <input
                      type="text" name="name"
                      value={formData.name} onChange={handleChange}
                      placeholder="VD: Combo Đôi - 2 nước + 1 bắp lớn"
                    />
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label>Giá (VNĐ) *</label>
                    <input
                      type="number" name="price"
                      value={formData.price} onChange={handleChange}
                      placeholder="109000" min="0" step="1000"
                    />
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
                    định dạng JPG/PNG/WEBP, dung lượng ≤ 2MB. Ảnh nền trong suốt sẽ đẹp hơn.
                  </small>
                </div>
              </form>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>Hủy</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : editingCombo ? 'Cập Nhật' : 'Lưu Combo'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
    </div>
  );
};

export default ComboManagePage;
