import React, { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';
import cinemaApi from '../../../api/cinemaApi';
import styles from './CinemaManagePage.module.scss';

const CinemaManagePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', city: '', total_screens: '' });

  const fetchCinemas = async () => {
    setLoading(true);
    try {
      const res = await cinemaApi.getAll();
      setCinemas(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCinemas(); }, []);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleOpenModal = () => {
    setEditingCinema(null);
    setFormData({ name: '', address: '', city: '', total_screens: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (cinema) => {
    setEditingCinema(cinema);
    setFormData({ name: cinema.name, address: cinema.address, city: cinema.city || '', total_screens: cinema.total_screens || '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingCinema(null); };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa rạp này?')) return;
    try { await cinemaApi.delete(id); fetchCinemas(); } catch (e) { alert('Xóa rạp thất bại!'); }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.address) { alert('Vui lòng nhập tên và địa chỉ rạp!'); return; }
    setSaving(true);
    try {
      const payload = { ...formData, total_screens: formData.total_screens ? parseInt(formData.total_screens) : null };
      if (editingCinema) { await cinemaApi.update(editingCinema.id, payload); }
      else { await cinemaApi.create(payload); }
      handleCloseModal(); fetchCinemas();
    } catch (e) { alert('Lưu rạp thất bại!'); }
    finally { setSaving(false); }
  };

  return (
    <div className={styles.cinemaManage}>
      <div className={styles.header}>
        <h2>Quản lý Rạp Chiếu Phim</h2>
        <button className={styles.addBtn} onClick={handleOpenModal}><MdAdd /> Thêm Rạp Mới</button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? <p style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Đang tải...</p> : (
          <table className={styles.table}>
            <thead><tr><th>Tên Rạp</th><th>Địa chỉ</th><th>Thành phố</th><th>Số phòng chiếu</th><th>Thao tác</th></tr></thead>
            <tbody>
              {cinemas.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>Chưa có rạp nào</td></tr>
              ) : cinemas.map(cinema => (
                <tr key={cinema.id}>
                  <td><strong>{cinema.name}</strong></td>
                  <td>{cinema.address}</td>
                  <td>{cinema.city || '-'}</td>
                  <td>{cinema.rooms_count ?? cinema.total_screens ?? 0} phòng</td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className={styles.editBtn} title="Sửa" onClick={() => handleEdit(cinema)}><MdEdit /></button>
                      <button className={styles.deleteBtn} title="Xóa" onClick={() => handleDelete(cinema.id)}><MdDelete /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{editingCinema ? 'Sửa Rạp' : 'Thêm Rạp Mới'}</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}><MdClose /></button>
            </div>
            <div className={styles.modalBody}>
              <form className={styles.form} onSubmit={e => e.preventDefault()}>
                <div className={styles.formGroup}><label>Tên Rạp *</label><input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="VD: T-CINE Landmark 81" /></div>
                <div className={styles.formGroup}><label>Địa chỉ *</label><textarea rows="2" name="address" value={formData.address} onChange={handleChange} placeholder="Nhập địa chỉ đầy đủ"></textarea></div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}><label>Thành phố</label><input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="VD: Hà Nội" /></div>
                  <div className={styles.formGroup}><label>Tổng số phòng chiếu</label><input type="number" name="total_screens" value={formData.total_screens} onChange={handleChange} placeholder="5" /></div>
                </div>
              </form>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>Hủy</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu Rạp'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CinemaManagePage;
