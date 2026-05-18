import React, { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';
import axiosClient from '../../../api/axiosClient';
import movieApi from '../../../api/movieApi';
import cinemaApi from '../../../api/cinemaApi';
import styles from './ShowtimeManagePage.module.scss';

const ShowtimeManagePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSt, setEditingSt] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    movie_id: '', room_id: '', cinema_id: '', start_date: '', start_time: '', duration: 120, base_price: ''
  });

  const fetchShowtimes = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/admin/showtimes', { params: { per_page: 50 } });
      setShowtimes(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchDropdowns = async () => {
    try {
      const [moviesRes, cinemasRes] = await Promise.all([
        movieApi.getAll({ per_page: 100 }),
        cinemaApi.getAll()
      ]);
      setMovies(moviesRes.data || []);
      setCinemas(cinemasRes.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchShowtimes(); fetchDropdowns(); }, []);

  const handleCinemaChange = async (cinemaId) => {
    setFormData(prev => ({ ...prev, cinema_id: cinemaId, room_id: '' }));
    if (cinemaId) {
      try {
        const res = await cinemaApi.getRooms(cinemaId);
        setRooms(res.data || []);
      } catch (e) { setRooms([]); }
    } else { setRooms([]); }
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleOpenModal = () => {
    setEditingSt(null);
    setFormData({ movie_id: '', room_id: '', cinema_id: '', start_date: '', start_time: '', duration: 120, base_price: '' });
    setRooms([]);
    setIsModalOpen(true);
  };

  const handleEdit = (st) => {
    setEditingSt(st);
    const startDt = new Date(st.start_time);
    const cinemaId = st.room?.cinema?.id || st.room?.cinema_id || '';
    setFormData({
      movie_id: st.movie_id || st.movie?.id || '',
      room_id: st.room_id || st.room?.id || '',
      cinema_id: cinemaId,
      start_date: startDt.toISOString().split('T')[0],
      start_time: startDt.toTimeString().slice(0, 5),
      duration: st.movie?.duration || 120,
      base_price: st.base_price || '',
    });
    if (cinemaId) handleCinemaChange(cinemaId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingSt(null); };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa lịch chiếu này?')) return;
    try { await axiosClient.delete(`/admin/showtimes/${id}`); fetchShowtimes(); }
    catch (e) { alert('Xóa thất bại!'); }
  };

  const handleSave = async () => {
    if (!formData.movie_id || !formData.room_id || !formData.start_date || !formData.start_time || !formData.base_price) {
      alert('Vui lòng điền đầy đủ thông tin!'); return;
    }
    setSaving(true);
    try {
      const startDateTime = `${formData.start_date} ${formData.start_time}:00`;
      const endDate = new Date(`${formData.start_date}T${formData.start_time}`);
      endDate.setMinutes(endDate.getMinutes() + parseInt(formData.duration || 120));
      const endDateTime = endDate.toISOString().replace('T', ' ').slice(0, 19);

      const payload = {
        movie_id: parseInt(formData.movie_id),
        room_id: parseInt(formData.room_id),
        start_time: startDateTime,
        end_time: endDateTime,
        base_price: parseFloat(formData.base_price),
      };

      if (editingSt) { await axiosClient.put(`/admin/showtimes/${editingSt.id}`, payload); }
      else { await axiosClient.post('/admin/showtimes', payload); }
      handleCloseModal(); fetchShowtimes();
    } catch (e) { alert('Lưu thất bại! ' + (e.response?.data?.message || '')); }
    finally { setSaving(false); }
  };

  const formatDateTime = (dt) => {
    if (!dt) return '-';
    const d = new Date(dt);
    return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className={styles.showtimeManage}>
      <div className={styles.header}>
        <h2>Quản lý Lịch chiếu</h2>
        <button className={styles.addBtn} onClick={handleOpenModal}><MdAdd /> Thêm Lịch chiếu</button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? <p style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Đang tải...</p> : (
          <table className={styles.table}>
            <thead><tr><th>Phim</th><th>Rạp</th><th>Phòng chiếu</th><th>Thời gian chiếu</th><th>Giá vé</th><th>Thao tác</th></tr></thead>
            <tbody>
              {showtimes.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>Chưa có lịch chiếu</td></tr>
              ) : showtimes.map(st => (
                <tr key={st.id}>
                  <td><strong>{st.movie?.title || 'N/A'}</strong></td>
                  <td>{st.room?.cinema?.name || 'N/A'}</td>
                  <td>{st.room?.name || 'N/A'}</td>
                  <td><span className={styles.timeTag}>{formatDateTime(st.start_time)}</span></td>
                  <td>{Number(st.base_price).toLocaleString('vi-VN')} VNĐ</td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className={styles.editBtn} title="Sửa" onClick={() => handleEdit(st)}><MdEdit /></button>
                      <button className={styles.deleteBtn} title="Xóa" onClick={() => handleDelete(st.id)}><MdDelete /></button>
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
              <h3>{editingSt ? 'Sửa Lịch chiếu' : 'Thêm Lịch chiếu mới'}</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}><MdClose /></button>
            </div>
            <div className={styles.modalBody}>
              <form className={styles.form} onSubmit={e => e.preventDefault()}>
                <div className={styles.formGroup}>
                  <label>Chọn Phim *</label>
                  <select name="movie_id" value={formData.movie_id} onChange={(e) => { handleChange(e); const m = movies.find(m => m.id == e.target.value); if (m) setFormData(prev => ({...prev, duration: m.duration || 120})); }}>
                    <option value="">-- Lựa chọn Phim --</option>
                    {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Chọn Rạp *</label>
                    <select name="cinema_id" value={formData.cinema_id} onChange={(e) => handleCinemaChange(e.target.value)}>
                      <option value="">-- Lựa chọn Rạp --</option>
                      {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phòng chiếu *</label>
                    <select name="room_id" value={formData.room_id} onChange={handleChange}>
                      <option value="">-- Lựa chọn Phòng --</option>
                      {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}><label>Ngày chiếu *</label><input type="date" name="start_date" value={formData.start_date} onChange={handleChange} /></div>
                  <div className={styles.formGroup}><label>Giờ chiếu *</label><input type="time" name="start_time" value={formData.start_time} onChange={handleChange} /></div>
                </div>
                <div className={styles.formGroup}>
                  <label>Giá vé mặc định (VNĐ) *</label>
                  <input type="number" name="base_price" value={formData.base_price} onChange={handleChange} placeholder="90000" />
                  <small className={styles.helperText}>Ghế VIP +30%, Couple +50% tự tính.</small>
                </div>
              </form>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>Hủy</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu Lịch chiếu'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowtimeManagePage;
