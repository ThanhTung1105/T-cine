import React, { useState, useEffect } from 'react';
import { MdClose, MdSearch, MdAdd } from 'react-icons/md';
import projectionFormatApi from '../../../api/projectionFormatApi';
import { getErrorMessage } from '../../../utils/helpers';
import { notify, confirmDialog } from '../../../utils/notify';
import styles from './ProjectionFormatManagePage.module.scss';

const ProjectionFormatManagePage = () => {
  const [formats, setFormats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFormat, setEditingFormat] = useState(null);
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});

  const fetchFormats = async () => {
    setLoading(true);
    try {
      const res = await projectionFormatApi.getAll();
      setFormats(Array.isArray(res) ? res : (res.data || []));
    } catch (e) {
      console.error(e);
      notify.error(getErrorMessage(e), 'Không thể lấy danh sách định dạng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormats();
  }, []);

  const handleOpenAddModal = () => {
    setEditingFormat(null);
    setName('');
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (format) => {
    setEditingFormat(format);
    setName(format.name);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFormat(null);
    setName('');
    setErrors({});
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrors({ name: 'Tên định dạng không được để trống.' });
      return;
    }
    if (name.trim().length > 50) {
      setErrors({ name: 'Tên định dạng không được vượt quá 50 ký tự.' });
      return;
    }

    setSaving(true);
    try {
      if (editingFormat) {
        await projectionFormatApi.update(editingFormat.id, { name: name.trim() });
        notify.success('Cập nhật định dạng phòng chiếu thành công');
      } else {
        await projectionFormatApi.create({ name: name.trim() });
        notify.success('Thêm định dạng phòng chiếu thành công');
      }
      handleCloseModal();
      fetchFormats();
    } catch (e) {
      console.error(e);
      if (e.response?.status === 422 && e.response?.data?.errors) {
        const backendErrors = e.response.data.errors;
        const newErrors = {};
        Object.keys(backendErrors).forEach((key) => {
          newErrors[key] = Array.isArray(backendErrors[key]) ? backendErrors[key][0] : backendErrors[key];
        });
        setErrors(newErrors);
        notify.error('Thông tin nhập vào chưa hợp lệ!', 'Thất bại!');
      } else {
        notify.error(getErrorMessage(e), 'Thao tác thất bại!');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingFormat) return;

    const ok = await confirmDialog({
      title: 'Xóa định dạng này?',
      message: `Định dạng "${editingFormat.name}" sẽ bị xóa vĩnh viễn khỏi hệ thống. Lưu ý: Hệ thống sẽ chặn xóa nếu đang có lịch chiếu (Showtimes) sử dụng định dạng này.`,
      confirmText: 'Xóa',
      danger: true,
    });
    if (!ok) return;

    setSaving(true);
    try {
      await projectionFormatApi.delete(editingFormat.id);
      notify.success('Xóa định dạng phòng chiếu thành công');
      handleCloseModal();
      fetchFormats();
    } catch (e) {
      console.error(e);
      notify.error(getErrorMessage(e), 'Xóa thất bại!');
    } finally {
      setSaving(false);
    }
  };

  // Lọc định dạng phía client
  const filteredFormats = formats.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.projectionFormat}>
      <div className={styles.header}>
        <h2>Quản lý Định dạng phòng chiếu</h2>
        <div className={styles.headerRight}>
          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Tìm định dạng..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <button><MdSearch /></button>
          </div>
          <button className={styles.addBtn} onClick={handleOpenAddModal}>
            <MdAdd size={20} /> Thêm Định dạng
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Đang tải...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Tên định dạng</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {filteredFormats.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>
                    Không tìm thấy định dạng nào
                  </td>
                </tr>
              ) : (
                filteredFormats.map(format => (
                  <tr key={format.id} onClick={() => handleOpenEditModal(format)}>
                    <td>{format.id}</td>
                    <td>
                      <span className={styles.formatTag}>{format.name}</span>
                    </td>
                    <td>{new Date(format.created_at).toLocaleString('vi-VN')}</td>
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
              <h3>{editingFormat ? 'Chỉnh sửa định dạng' : 'Thêm Định dạng mới'}</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}><MdClose /></button>
            </div>
            <div className={styles.modalBody}>
              <form className={styles.form} onSubmit={e => e.preventDefault()} noValidate>
                <div className={styles.formGroup}>
                  <label>Tên định dạng phòng chiếu *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => {
                      setName(e.target.value);
                      setErrors({});
                    }}
                    placeholder="Ví dụ: 2D Vietsub, 3D Lồng Tiếng, IMAX..."
                    className={errors.name ? 'inputErrorGlobal' : ''}
                  />
                  {errors.name && <span className="errorTextGlobal">{errors.name}</span>}
                  <small className={styles.helperText}>
                    * Tên định dạng phải là duy nhất và dài tối đa 50 ký tự.
                  </small>
                </div>
              </form>
            </div>
            <div className={styles.modalFooter}>
              {editingFormat && (
                <button
                  type="button"
                  className={styles.deleteBtnModal}
                  onClick={handleDelete}
                  disabled={saving}
                >
                  Xóa
                </button>
              )}
              <button className={styles.cancelBtn} onClick={handleCloseModal}>Hủy</button>
              <button
                className={styles.saveBtn}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Đang lưu...' : editingFormat ? 'Cập Nhật' : 'Thêm Mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectionFormatManagePage;
