import React, { useState, useRef, useEffect } from 'react';
import {
  MdAdd, MdEdit, MdDelete, MdClose, MdCloudUpload,
  MdVisibility, MdVisibilityOff,
} from 'react-icons/md';
import eventApi from '../../../api/eventApi';
import promotionApi from '../../../api/promotionApi';
import axiosClient from '../../../api/axiosClient';
import Toast from '../../../components/Toast/Toast';
import styles from './EventManagePage.module.scss';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

const CATEGORIES = [
  { value: 'promotion', label: 'Ưu Đãi' },
  { value: 'member', label: 'Thành Viên' },
  { value: 'news', label: 'Tin Tức' },
];

const categoryLabel = (v) => CATEGORIES.find((c) => c.value === v)?.label || v;

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${STORAGE_URL}/${img}`;
};

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');

const EventManagePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [promotions, setPromotions] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'promotion',
    promotion_id: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const [toast, setToast] = useState({ message: '', type: 'success' });
  const imageInputRef = useRef(null);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const closeToast = () => setToast({ message: '', type: 'success' });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventApi.adminGetAll();
      const data = Array.isArray(res) ? res : res.data || [];
      setEvents(data);
    } catch (error) {
      console.error('Lỗi tải sự kiện:', error);
      showToast('Không tải được danh sách sự kiện!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchPromotions = async () => {
    try {
      const res = await promotionApi.adminGetAll({ per_page: 100 });
      setPromotions(res.data || []);
    } catch (error) {
      console.error('Lỗi tải mã giảm giá:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchPromotions();
  }, []);

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'events');
    const res = await axiosClient.post('/admin/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.url;
  };

  const handleOpenModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '', description: '', content: '',
      category: 'promotion', promotion_id: '',
      start_date: '', end_date: '', is_active: true,
    });
    setPreviewImage(null);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      content: event.content || '',
      category: event.category || 'promotion',
      promotion_id: event.promotion_id || '',
      start_date: event.start_date ? event.start_date.split('T')[0] : '',
      end_date: event.end_date ? event.end_date.split('T')[0] : '',
      is_active: !!event.is_active,
    });
    setPreviewImage(getImageUrl(event.image));
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    setPreviewImage(null);
    setImageFile(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
    if (!window.confirm('Bạn có chắc muốn xóa sự kiện này?')) return;
    try {
      await eventApi.delete(id);
      showToast('Đã xóa sự kiện!', 'success');
      fetchEvents();
    } catch (error) {
      showToast('Xóa sự kiện thất bại!', 'error');
    }
  };

  const handleToggleActive = async (event) => {
    try {
      await eventApi.update(event.id, { is_active: !event.is_active });
      fetchEvents();
    } catch {
      showToast('Không thể cập nhật trạng thái!', 'error');
    }
  };

  const handleSave = async () => {
    if (!formData.title) {
      showToast('Vui lòng nhập tiêu đề sự kiện!', 'error');
      return;
    }
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      showToast('Ngày bắt đầu phải nhỏ hơn ngày kết thúc!', 'error');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = editingEvent?.image || '';
      if (imageFile) imageUrl = await uploadImage(imageFile);

      const payload = {
        title: formData.title,
        description: formData.description || null,
        content: formData.content || null,
        image: imageUrl || null,
        category: formData.category,
        promotion_id: formData.promotion_id || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_active: !!formData.is_active,
      };

      if (editingEvent) {
        await eventApi.update(editingEvent.id, payload);
        showToast('Đã cập nhật sự kiện!', 'success');
      } else {
        await eventApi.create(payload);
        showToast('Đã thêm sự kiện mới!', 'success');
      }

      handleCloseModal();
      fetchEvents();
    } catch (error) {
      console.error('Lỗi lưu sự kiện:', error);
      showToast('Lưu sự kiện thất bại! ' + (error.response?.data?.message || ''), 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredEvents = filterCategory === 'all'
    ? events
    : events.filter((e) => e.category === filterCategory);

  return (
    <div className={styles.eventManage}>
      <div className={styles.header}>
        <div>
          <h2>Quản lý Sự Kiện / Ưu Đãi</h2>
          <p className={styles.subtitle}>
            Hiển thị tại trang chủ (mục <strong>Tin Mới & Ưu Đãi</strong>) và trang <em>/tin-moi-va-uu-dai</em>.
          </p>
        </div>
        <button className={styles.addBtn} onClick={handleOpenModal}>
          <MdAdd /> Thêm Sự Kiện
        </button>
      </div>

      {/* Filter category */}
      <div className={styles.filterBar}>
        <button
          className={`${styles.filterChip} ${filterCategory === 'all' ? styles.active : ''}`}
          onClick={() => setFilterCategory('all')}
        >
          Tất cả ({events.length})
        </button>
        {CATEGORIES.map((c) => {
          const count = events.filter((e) => e.category === c.value).length;
          return (
            <button
              key={c.value}
              className={`${styles.filterChip} ${filterCategory === c.value ? styles.active : ''}`}
              onClick={() => setFilterCategory(c.value)}
            >
              {c.label} ({count})
            </button>
          );
        })}
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Đang tải...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: 130 }}>Ảnh</th>
                <th>Tiêu đề</th>
                <th style={{ width: 120 }}>Danh mục</th>
                <th style={{ width: 140 }}>Mã KM</th>
                <th style={{ width: 200 }}>Thời gian</th>
                <th style={{ width: 110 }}>Trạng thái</th>
                <th style={{ width: 110 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>
                    Chưa có sự kiện nào
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td>
                      {event.image ? (
                        <img
                          src={getImageUrl(event.image)}
                          alt={event.title}
                          className={styles.eventThumb}
                        />
                      ) : (
                        <div className={styles.eventThumb} style={{ background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#888' }}>
                          No img
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>{event.title}</strong>
                      {event.description && (
                        <p className={styles.descPreview}>{event.description}</p>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.catBadge} ${styles[event.category]}`}>
                        {categoryLabel(event.category)}
                      </span>
                    </td>
                    <td>
                      {event.promotion ? (
                        <div className={styles.promoCell}>
                          <code>{event.promotion.code}</code>
                          <span className={styles.promoPercent}>-{event.promotion.discount_percent}%</span>
                        </div>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td className={styles.dateCell}>
                      {event.start_date || event.end_date
                        ? `${formatDate(event.start_date)} → ${formatDate(event.end_date)}`
                        : <span style={{ color: '#999' }}>Không thời hạn</span>}
                    </td>
                    <td>
                      <button
                        className={`${styles.statusToggle} ${event.is_active ? styles.active : styles.inactive}`}
                        onClick={() => handleToggleActive(event)}
                        title="Bật/Tắt hiển thị"
                      >
                        {event.is_active ? <MdVisibility /> : <MdVisibilityOff />}
                        {event.is_active ? 'Hiện' : 'Ẩn'}
                      </button>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button className={styles.editBtn} title="Sửa" onClick={() => handleEdit(event)}>
                          <MdEdit />
                        </button>
                        <button className={styles.deleteBtn} title="Xóa" onClick={() => handleDelete(event.id)}>
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
              <h3>{editingEvent ? 'Sửa Sự Kiện' : 'Thêm Sự Kiện Mới'}</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}><MdClose /></button>
            </div>

            <div className={styles.modalBody}>
              <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup} style={{ flex: 2 }}>
                    <label>Tiêu đề *</label>
                    <input
                      type="text" name="title"
                      value={formData.title} onChange={handleChange}
                      placeholder="VD: Ưu đãi học sinh sinh viên - Giảm 40%"
                    />
                  </div>
                  <div className={styles.formGroup} style={{ flex: 1 }}>
                    <label>Danh mục *</label>
                    <select name="category" value={formData.category} onChange={handleChange}>
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Mô tả ngắn</label>
                  <textarea
                    rows="2" name="description"
                    value={formData.description} onChange={handleChange}
                    placeholder="Mô tả ngắn hiển thị trong card..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Nội dung chi tiết</label>
                  <textarea
                    rows="5" name="content"
                    value={formData.content} onChange={handleChange}
                    placeholder="Nội dung đầy đủ hiển thị ở trang chi tiết sự kiện..."
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Ngày bắt đầu</label>
                    <input
                      type="date" name="start_date"
                      value={formData.start_date} onChange={handleChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Ngày kết thúc</label>
                    <input
                      type="date" name="end_date"
                      value={formData.end_date} onChange={handleChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Trạng thái</label>
                    <label className={styles.switchLabel}>
                      <input
                        type="checkbox" name="is_active"
                        checked={formData.is_active} onChange={handleChange}
                      />
                      <span>{formData.is_active ? 'Đang hiển thị' : 'Đã ẩn'}</span>
                    </label>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Đính kèm Mã Giảm Giá (tùy chọn)</label>
                  <select
                    name="promotion_id"
                    value={formData.promotion_id}
                    onChange={handleChange}
                  >
                    <option value="">— Không đính kèm —</option>
                    {promotions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} — Giảm {p.discount_percent}%
                        {p.max_discount ? ` (tối đa ${Number(p.max_discount).toLocaleString('vi-VN')}đ)` : ''}
                      </option>
                    ))}
                  </select>
                  <small className={styles.hintInfo}>
                    💡 Mã được chọn sẽ hiển thị ở trang chi tiết sự kiện để khách hàng sao chép & dùng khi đặt vé.
                    Tạo mã mới tại trang <strong>Quản lý Mã Giảm Giá</strong>.
                  </small>
                </div>

                <div className={styles.formGroup}>
                  <label>Ảnh sự kiện</label>
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
                    ⚠️ <strong>Yêu cầu:</strong> Tỉ lệ <strong>16:10</strong> (khuyến nghị <strong>800×500px</strong>),
                    định dạng JPG/PNG/WEBP, dung lượng ≤ 2MB.
                  </small>
                </div>
              </form>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>Hủy</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : editingEvent ? 'Cập Nhật' : 'Lưu Sự Kiện'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
    </div>
  );
};

export default EventManagePage;
