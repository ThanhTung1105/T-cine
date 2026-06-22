import React, { useState, useEffect } from 'react';
import { MdAdd, MdClose, MdContentCopy, MdLocalOffer } from 'react-icons/md';
import promotionApi from '../../../api/promotionApi';
import { notify, confirmDialog } from '../../../utils/notify';
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
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    code: '',
    discount_percent: 10,
    max_discount: '',
    valid_from: '',
    valid_to: '',
    usage_limit: '',
  });

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await promotionApi.adminGetAll({ per_page: 100 });
      setPromotions(res.data || []);
    } catch (error) {
      console.error('Lỗi tải mã:', error);
      notify.error('Không tải được danh sách mã giảm giá!', 'Lỗi tải dữ liệu');
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
    setErrors({});
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
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleDelete = async (id) => {
    const ok = await confirmDialog({
      title: 'Xóa mã giảm giá?',
      message: 'Bạn có chắc chắn muốn xóa mã giảm giá này không? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa mã giảm giá',
      danger: true,
    });
    if (!ok) return;

    try {
      await promotionApi.delete(id);
      notify.success('Đã xóa mã giảm giá thành công!', 'Thành công');
      handleCloseModal();
      fetchPromotions();
    } catch {
      notify.error('Xóa mã giảm giá thất bại!', 'Lỗi');
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      notify.success(`Đã sao chép mã ${code} vào bộ nhớ tạm!`, 'Đã sao chép');
    });
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!formData.code.trim()) {
      newErrors.code = 'Vui lòng nhập mã giảm giá';
    }
    if (!formData.discount_percent) {
      newErrors.discount_percent = 'Vui lòng nhập % giảm giá';
    } else if (Number(formData.discount_percent) < 1 || Number(formData.discount_percent) > 100) {
      newErrors.discount_percent = '% giảm giá phải từ 1 đến 100';
    }
    if (!formData.valid_from) {
      newErrors.valid_from = 'Vui lòng chọn ngày bắt đầu';
    }
    if (!formData.valid_to) {
      newErrors.valid_to = 'Vui lòng chọn ngày kết thúc';
    } else if (formData.valid_from && new Date(formData.valid_to) <= new Date(formData.valid_from)) {
      newErrors.valid_to = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
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
        notify.success('Đã cập nhật thông tin mã giảm giá thành công!', 'Thành công');
      } else {
        await promotionApi.create(payload);
        notify.success('Đã thêm mã giảm giá mới thành công!', 'Thành công');
      }

      handleCloseModal();
      fetchPromotions();
    } catch (error) {
      console.error('Lỗi lưu mã:', error);
      const msg = error.response?.data?.errors?.code?.[0]
        || error.response?.data?.message
        || 'Lưu mã giảm giá thất bại!';
      notify.error(msg, 'Lỗi');
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
              </tr>
            </thead>
            <tbody>
               {promotions.length === 0 ? (
                 <tr>
                   <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>
                     Chưa có mã giảm giá nào
                   </td>
                 </tr>
              ) : (
                promotions.map((p) => {
                  const expired = isExpired(p.valid_to);
                  const usedUp = p.usage_limit && p.used_count >= p.usage_limit;
                  const inactive = expired || usedUp;

                  return (
                    <tr key={p.id} className={`${inactive ? styles.rowDisabled : ''} ${styles.clickableRow}`} onClick={() => handleEdit(p)}>
                      <td>
                        <div className={styles.codeCell}>
                          <MdLocalOffer className={styles.codeIcon} />
                          <code>{p.code}</code>
                          <button
                            className={styles.copyBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(p.code);
                            }}
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
              <form className={styles.form} onSubmit={(e) => e.preventDefault()} noValidate>
                <div className={styles.formGroup}>
                  <label>Mã giảm giá *</label>
                  <input
                    type="text" name="code"
                    value={formData.code}
                    onChange={(e) => handleChange({ target: { name: 'code', value: e.target.value.toUpperCase() } })}
                    placeholder="VD: GIAMGIA50"
                    maxLength="50"
                    disabled={!!editing}
                    className={`${styles.codeInput} ${errors.code ? 'inputErrorGlobal' : ''}`}
                  />
                  {errors.code && <span className="errorTextGlobal">{errors.code}</span>}
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
                      className={errors.discount_percent ? 'inputErrorGlobal' : ''}
                    />
                    {errors.discount_percent && <span className="errorTextGlobal">{errors.discount_percent}</span>}
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
                      className={errors.valid_from ? 'inputErrorGlobal' : ''}
                    />
                    {errors.valid_from && <span className="errorTextGlobal">{errors.valid_from}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label>Ngày kết thúc *</label>
                    <input
                      type="date" name="valid_to"
                      value={formData.valid_to} onChange={handleChange}
                      className={errors.valid_to ? 'inputErrorGlobal' : ''}
                    />
                    {errors.valid_to && <span className="errorTextGlobal">{errors.valid_to}</span>}
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
               {editing && (
                 <button type="button" className={styles.deleteBtnModal} onClick={() => handleDelete(editing.id)} disabled={saving}>
                   Xóa Mã Giảm Giá
                 </button>
               )}
               <button className={styles.cancelBtn} onClick={handleCloseModal}>Hủy</button>
               <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                 {saving ? 'Đang lưu...' : editing ? 'Cập Nhật' : 'Lưu Mã'}
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManagePage;
