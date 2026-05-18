import React, { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose, MdContentCopy, MdLocalOffer } from 'react-icons/md';
import promotionApi from '../../../api/promotionApi';
import Toast from '../../../components/Toast/Toast';
import styles from './PromotionManagePage.module.scss';

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');
const formatVND = (v) => `${Number(v || 0).toLocaleString('vi-VN')} VNĐ`;

const isExpired = (validTo) => {
  if (!validTo) return false;
  return new Date(validTo) < new Date(new Date().toDateString());
};

const PromotionManagePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discount_percent: 10,
    max_discount: '',
    valid_from: '',
    valid_to: '',
    usage_limit: '',
  });

  const [toast, setToast] = useState({ message: '', type: 'success' });
  const showToast = (message, type = 'success') => setToast({ message, type });
  const closeToast = () => setToast({ message: '', type: 'success' });

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await promotionApi.adminGetAll({ per_page: 100 });
      // API admin/promotions trả về paginate => res.data là array
      setPromotions(res.data || []);
    } catch (error) {
      console.error('Lỗi tải mã:', error);
      showToast('Không tải được danh sách mã giảm giá!', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPromotions(); }, []);

  const handleOpenModal = () => {
    setEditing(null);
    setFormData({
      code: '',
      discount_percent: 10,
      max_discount: '',
      valid_from: '',
      valid_to: '',
      usage_limit: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (promo) => {
    setEditing(promo);
    setFormData({
      code: promo.code || '',
      discount_percent: promo.discount_percent || 10,
      max_discount: promo.max_discount || '',
      valid_from: promo.valid_from ? promo.valid_from.split('T')[0] : '',
      valid_to: promo.valid_to ? promo.valid_to.split('T')[0] : '',
      usage_limit: promo.usage_limit || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditing(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) return;
    try {
      await promotionApi.delete(id);
      showToast('Đã xóa mã giảm giá!', 'success');
      fetchPromotions();
    } catch {
      showToast('Xóa mã thất bại!', 'error');
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      showToast(`Đã sao chép mã ${code}!`, 'success');
    });
  };

  const handleSave = async () => {
    if (!formData.code || !formData.discount_percent || !formData.valid_from || !formData.valid_to) {
      showToast('Vui lòng nhập đầy đủ: Mã, %, ngày bắt đầu/kết thúc!', 'error');
      return;
    }
    if (Number(formData.discount_percent) < 1 || Number(formData.discount_percent) > 100) {
      showToast('% giảm giá phải từ 1-100!', 'error');
      return;
    }
    if (new Date(formData.valid_to) <= new Date(formData.valid_from)) {
      showToast('Ngày kết thúc phải sau ngày bắt đầu!', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        discount_percent: parseInt(formData.discount_percent),
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        valid_from: formData.valid_from,
        valid_to: formData.valid_to,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      };

      if (editing) {
        await promotionApi.update(editing.id, payload);
        showToast('Đã cập nhật mã giảm giá!', 'success');
      } else {
        await promotionApi.create(payload);
        showToast('Đã thêm mã giảm giá mới!', 'success');
      }

      handleCloseModal();
      fetchPromotions();
    } catch (error) {
      console.error('Lỗi lưu mã:', error);
      const msg = error.response?.data?.errors?.code?.[0]
        || error.response?.data?.message
        || 'Lưu mã thất bại!';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.promotionManage}>
      <div className={styles.header}>
        <div>
          <h2>Quản lý Mã Giảm Giá</h2>
          <p className={styles.subtitle}>
            Mã giảm giá khách hàng nhập khi đặt vé. Có thể đính kèm vào sự kiện để khách dễ tìm thấy.
          </p>
        </div>
        <button className={styles.addBtn} onClick={handleOpenModal}>
          <MdAdd /> Thêm Mã Mới
        </button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Đang tải...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã</th>
                <th style={{ width: 100 }}>% Giảm</th>
                <th>Giảm tối đa</th>
                <th>Thời gian hiệu lực</th>
                <th>Lượt dùng</th>
                <th style={{ width: 120 }}>Trạng thái</th>
                <th style={{ width: 140 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>
                    Chưa có mã giảm giá nào
                  </td>
                </tr>
              ) : (
                promotions.map((p) => {
                  const expired = isExpired(p.valid_to);
                  const usedUp = p.usage_limit && p.used_count >= p.usage_limit;
                  const inactive = expired || usedUp;

                  return (
                    <tr key={p.id} className={inactive ? styles.rowDisabled : ''}>
                      <td>
                        <div className={styles.codeCell}>
                          <MdLocalOffer className={styles.codeIcon} />
                          <code>{p.code}</code>
                          <button
                            className={styles.copyBtn}
                            onClick={() => handleCopy(p.code)}
                            title="Sao chép mã"
                          >
                            <MdContentCopy />
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className={styles.percentBadge}>{p.discount_percent}%</span>
                      </td>
                      <td>{p.max_discount ? formatVND(p.max_discount) : <span style={{ color: '#9ca3af' }}>Không giới hạn</span>}</td>
                      <td className={styles.dateCell}>
                        {formatDate(p.valid_from)} → {formatDate(p.valid_to)}
                      </td>
                      <td>
                        <strong>{p.used_count || 0}</strong>
                        <span style={{ color: '#9ca3af' }}> / {p.usage_limit || '∞'}</span>
                      </td>
                      <td>
                        {expired ? (
                          <span className={`${styles.statusBadge} ${styles.expired}`}>Hết hạn</span>
                        ) : usedUp ? (
                          <span className={`${styles.statusBadge} ${styles.usedUp}`}>Hết lượt</span>
                        ) : (
                          <span className={`${styles.statusBadge} ${styles.active}`}>Đang hoạt động</span>
                        )}
                      </td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button className={styles.editBtn} title="Sửa" onClick={() => handleEdit(p)}>
                            <MdEdit />
                          </button>
                          <button className={styles.deleteBtn} title="Xóa" onClick={() => handleDelete(p.id)}>
                            <MdDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{editing ? 'Sửa Mã Giảm Giá' : 'Thêm Mã Giảm Giá Mới'}</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}><MdClose /></button>
            </div>

            <div className={styles.modalBody}>
              <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                <div className={styles.formGroup}>
                  <label>Mã giảm giá *</label>
                  <input
                    type="text" name="code"
                    value={formData.code}
                    onChange={(e) => handleChange({ target: { name: 'code', value: e.target.value.toUpperCase() } })}
                    placeholder="VD: GIAMGIA50"
                    maxLength="50"
                    disabled={!!editing}
                    className={styles.codeInput}
                  />
                  <small className={styles.hint}>
                    Mã sẽ tự động viết HOA. Không được trùng với mã khác. {editing && '(Không thể đổi mã sau khi tạo)'}
                  </small>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>% Giảm giá *</label>
                    <input
                      type="number" name="discount_percent"
                      value={formData.discount_percent} onChange={handleChange}
                      min="1" max="100" placeholder="10"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Số tiền giảm tối đa (VNĐ)</label>
                    <input
                      type="number" name="max_discount"
                      value={formData.max_discount} onChange={handleChange}
                      min="0" step="1000" placeholder="Để trống = không giới hạn"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Ngày bắt đầu *</label>
                    <input
                      type="date" name="valid_from"
                      value={formData.valid_from} onChange={handleChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Ngày kết thúc *</label>
                    <input
                      type="date" name="valid_to"
                      value={formData.valid_to} onChange={handleChange}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Giới hạn lượt dùng</label>
                    <input
                      type="number" name="usage_limit"
                      value={formData.usage_limit} onChange={handleChange}
                      min="1" placeholder="Để trống = không giới hạn"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>Hủy</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : editing ? 'Cập Nhật' : 'Lưu Mã'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
    </div>
  );
};

export default PromotionManagePage;
