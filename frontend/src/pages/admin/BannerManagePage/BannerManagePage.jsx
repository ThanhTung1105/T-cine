import React, { useState, useRef, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose, MdCloudUpload, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import bannerApi from '../../../api/bannerApi';
import axiosClient from '../../../api/axiosClient';
import { notify, confirmDialog } from '../../../utils/notify';
import styles from './BannerManagePage.module.scss';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${STORAGE_URL}/${img}`;
};

const BannerManagePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    link_url: '',
    position: 0,
    is_active: true,
  });

  const imageInputRef = useRef(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await bannerApi.adminGetAll();
      setBanners(res.data || []);
    } catch (error) {
      console.error('Lỗi tải banner:', error);
      notify.error('Không tải được danh sách banner!', 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'banners');
    const res = await axiosClient.post('/admin/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url;
  };

  const handleOpenModal = () => {
    setEditingBanner(null);
    setFormData({ title: '', link_url: '', position: 0, is_active: true });
    setPreviewImage(null);
    setImageFile(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      link_url: banner.link_url || '',
      position: banner.position ?? 0,
      is_active: !!banner.is_active,
    });
    setPreviewImage(getImageUrl(banner.image_url));
    setImageFile(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setPreviewImage(null);
    setImageFile(null);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirmDialog({
      title: 'Xóa banner quảng cáo?',
      message: 'Bạn có chắc chắn muốn xóa banner này không? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa banner',
      danger: true,
    });
    if (!ok) return;

    try {
      await bannerApi.delete(id);
      notify.success('Đã xóa banner thành công!', 'Thành công');
      fetchBanners();
    } catch (error) {
      notify.error('Xóa banner thất bại!', 'Lỗi');
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      await bannerApi.update(banner.id, { is_active: !banner.is_active });
      notify.success('Cập nhật trạng thái banner thành công!', 'Thành công');
      fetchBanners();
    } catch (error) {
      notify.error('Không thể cập nhật trạng thái banner!', 'Lỗi');
    }
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!editingBanner && !imageFile) {
      newErrors.image = 'Vui lòng tải lên ảnh banner quảng cáo';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      let imageUrl = editingBanner?.image_url || '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const payload = {
        title: formData.title || null,
        image_url: imageUrl,
        link_url: formData.link_url || null,
        position: formData.position ? parseInt(formData.position) : 0,
        is_active: !!formData.is_active,
      };

      if (editingBanner) {
        await bannerApi.update(editingBanner.id, payload);
        notify.success('Đã cập nhật banner thành công!', 'Thành công');
      } else {
        await bannerApi.create(payload);
        notify.success('Đã thêm banner mới thành công!', 'Thành công');
      }

      handleCloseModal();
      fetchBanners();
    } catch (error) {
      console.error('Lỗi lưu banner:', error);
      notify.error('Lưu banner thất bại! ' + (error.response?.data?.message || ''), 'Lỗi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.bannerManage}>
      <div className={styles.header}>
        <div>
          <h2>Quản lý Banner Trang Chủ</h2>
          <p className={styles.subtitle}>
            Banner xuất hiện ở khu vực Hero Carousel đầu trang chủ. Khuyến nghị size <strong>1920×600px</strong>.
          </p>
        </div>
        <button className={styles.addBtn} onClick={handleOpenModal}>
          <MdAdd /> Thêm Banner Mới
        </button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Đang tải...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 100 }}>STT</th>
                <th>Ảnh</th>
                <th>Tiêu đề</th>
                <th>Đường dẫn</th>
                <th style={{ width: 100 }}>Vị trí</th>
                <th style={{ width: 120 }}>Trạng thái</th>
                <th style={{ width: 120 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {banners.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>
                    Chưa có banner nào
                  </td>
                </tr>
              ) : (
                banners.map((banner, idx) => (
                  <tr key={banner.id}>
                    <td>{idx + 1}</td>
                    <td>
                      {banner.image_url ? (
                        <img
                          src={getImageUrl(banner.image_url)}
                          alt={banner.title || 'Banner'}
                          className={styles.bannerThumb}
                        />
                      ) : (
                        <div className={styles.bannerThumb} style={{ background: '#333' }} />
                      )}
                    </td>
                    <td><strong>{banner.title || <span style={{ color: '#999' }}>(Không tiêu đề)</span>}</strong></td>
                    <td>
                      {banner.link_url ? (
                        <a href={banner.link_url} target="_blank" rel="noreferrer" className={styles.linkText}>
                          {banner.link_url}
                        </a>
                      ) : (
                        <span style={{ color: '#999' }}>—</span>
                      )}
                    </td>
                    <td>{banner.position ?? 0}</td>
                    <td>
                      <button
                        className={`${styles.statusToggle} ${banner.is_active ? styles.active : styles.inactive}`}
                        onClick={() => handleToggleActive(banner)}
                        title="Bật/Tắt hiển thị"
                      >
                        {banner.is_active ? <MdVisibility /> : <MdVisibilityOff />}
                        {banner.is_active ? 'Hiện' : 'Ẩn'}
                      </button>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button className={styles.editBtn} title="Sửa" onClick={() => handleEdit(banner)}>
                          <MdEdit />
                        </button>
                        <button className={styles.deleteBtn} title="Xóa" onClick={() => handleDelete(banner.id)}>
                          <MdDelete />
                        </button>
                      </div>
                    </td>
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
              <h3>{editingBanner ? 'Sửa Banner' : 'Thêm Banner Mới'}</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}>
                <MdClose />
              </button>
            </div>

            <div className={styles.modalBody}>
              <form className={styles.form} onSubmit={(e) => e.preventDefault()} noValidate>
                <div className={styles.formGroup}>
                  <label>Ảnh Banner *</label>
                  <div
                    className={`${styles.uploadArea} ${errors.image ? 'inputErrorGlobal' : ''}`}
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
                      type="file"
                      accept="image/*"
                      ref={imageInputRef}
                      onChange={handleImageUpload}
                      hidden
                    />
                  </div>
                  {errors.image && <span className="errorTextGlobal">{errors.image}</span>}
                  <small className={styles.uploadHint}>
                    ⚠️ <strong>Yêu cầu:</strong> Tỉ lệ <strong>ngang 16:5</strong> (khuyến nghị <strong>1920×600px</strong>),
                    định dạng JPG/PNG/WEBP, dung lượng ≤ 10MB. Tránh đặt chữ quá sát viền vì có thể bị che bởi nút điều hướng.
                  </small>
                </div>

                <div className={styles.formGroup}>
                  <label>Tiêu đề (tùy chọn)</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="VD: Khuyến mãi hè 2026"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Đường dẫn khi click (tùy chọn)</label>
                  <input
                    type="text"
                    name="link_url"
                    value={formData.link_url}
                    onChange={handleChange}
                    placeholder="VD: /phim hoặc /tin-moi-va-uu-dai/1"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Vị trí hiển thị</label>
                    <input
                      type="number"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                    />
                    <small className={styles.hint}>Số nhỏ hơn sẽ hiển thị trước</small>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Trạng thái</label>
                    <label className={styles.switchLabel}>
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                      />
                      <span>{formData.is_active ? 'Đang hiển thị' : 'Đã ẩn'}</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>Hủy</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : editingBanner ? 'Cập Nhật' : 'Lưu Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagePage;
