import React, { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';
import axiosClient from '../../../api/axiosClient';
import movieApi from '../../../api/movieApi';
import cinemaApi from '../../../api/cinemaApi';
import projectionFormatApi from '../../../api/projectionFormatApi';
import { getErrorMessage } from '../../../utils/helpers';
import { notify, confirmDialog } from '../../../utils/notify';
import styles from './ShowtimeManagePage.module.scss';

const formatTimeOnly = (dtStr) => {
  if (!dtStr || typeof dtStr !== 'string') return '-';
  const parts = dtStr.split(' ');
  if (parts.length === 2) {
    return parts[1].slice(0, 5); // returns "HH:mm"
  }
  if (dtStr.includes('T')) {
    const timePart = dtStr.split('T')[1];
    if (timePart) return timePart.slice(0, 5);
  }
  try {
    const d = new Date(dtStr);
    if (!isNaN(d.getTime())) {
      const pad = (n) => String(n).padStart(2, '0');
      return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
  } catch (e) {}
  return '-';
};

const getTodayString = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const getShowtimeStatus = (startTimeStr, endTimeStr) => {
  if (!startTimeStr) return 'ended';
  const now = new Date();
  const start = new Date(startTimeStr.replace(' ', 'T'));
  const end = endTimeStr 
    ? new Date(endTimeStr.replace(' ', 'T'))
    : new Date(start.getTime() + 120 * 60 * 1000);
    
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'ongoing';
  return 'ended';
};

const statusConfig = {
  upcoming: { label: 'Sắp diễn ra', classKey: 'statusUpcoming' },
  ongoing: { label: 'Đang diễn ra', classKey: 'statusOngoing' },
  ended: { label: 'Đã diễn ra', classKey: 'statusEnded' }
};

const ShowtimeManagePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSt, setEditingSt] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [movieFilter, setMovieFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    movie_id: '', room_id: '', cinema_id: '', start_date: '', start_time: '09:00', duration: 120, projection_format_id: '',
  });
  const [projectionFormats, setProjectionFormats] = useState([]);
  const [roomSchedules, setRoomSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

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
      const [moviesRes, cinemasRes, formatsRes] = await Promise.all([
        movieApi.getAll({ per_page: 100 }),
        cinemaApi.getAll(),
        projectionFormatApi.getAll()
      ]);
      setMovies(moviesRes.data || []);
      setCinemas(cinemasRes.data || []);
      setProjectionFormats(Array.isArray(formatsRes) ? formatsRes : (formatsRes.data || []));
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchShowtimes(); fetchDropdowns(); }, []);

  const fetchRoomSchedules = async (cinemaId, date) => {
    if (!cinemaId || !date) {
      setRoomSchedules([]);
      return;
    }
    setLoadingSchedules(true);
    try {
      const res = await axiosClient.get(`/cinemas/${cinemaId}/showtimes`, { params: { date } });
      setRoomSchedules(res.data || []);
    } catch (e) {
      console.error('[ShowtimeManagePage] fetchRoomSchedules error:', e);
      setRoomSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

  useEffect(() => {
    fetchRoomSchedules(formData.cinema_id, formData.start_date);
  }, [formData.cinema_id, formData.start_date]);

  const handleCinemaChange = async (cinemaId, targetRoomId = '') => {
    setFormData(prev => ({ ...prev, cinema_id: cinemaId, room_id: targetRoomId }));
    setErrors(prev => ({ ...prev, cinema_id: '', room_id: '' }));
    if (cinemaId) {
      try {
        const res = await cinemaApi.getRooms(cinemaId);
        setRooms(res.data || []);
      } catch (e) { setRooms([]); }
    } else { setRooms([]); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'room_id') {
      setFormData(prev => ({ ...prev, room_id: value, projection_format_id: '' }));
      setErrors(prev => ({ ...prev, room_id: '', projection_format_id: '' }));
    } else if (name === 'start_date') {
      setFormData(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, start_date: '', start_time: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTimeChange = (type, value) => {
    const [h, m] = (formData.start_time || "09:00").split(":");
    const newTime = type === 'hour' ? `${value}:${m}` : `${h}:${value}`;
    setFormData(prev => ({ ...prev, start_time: newTime }));
    setErrors(prev => ({ ...prev, start_date: '', start_time: '' }));
  };

  const handleOpenModal = () => {
    setEditingSt(null);
    setFormData({ movie_id: '', room_id: '', cinema_id: '', start_date: '', start_time: '09:00', duration: 120, projection_format_id: projectionFormats[0]?.id || '' });
    setRooms([]);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (st) => {
    setEditingSt(st);
    
    let datePart = '';
    let timePart = '';
    if (st.start_time && typeof st.start_time === 'string') {
      const parts = st.start_time.split(' ');
      if (parts.length === 2) {
        datePart = parts[0];
        timePart = parts[1].slice(0, 5);
      }
    }
    
    if (!datePart || !timePart) {
      const startDt = new Date(st.start_time);
      const pad = (n) => String(n).padStart(2, '0');
      datePart = `${startDt.getFullYear()}-${pad(startDt.getMonth() + 1)}-${pad(startDt.getDate())}`;
      timePart = `${pad(startDt.getHours())}:${pad(startDt.getMinutes())}`;
    }

    const cinemaId = st.room?.cinema?.id || st.room?.cinema_id || '';
    setFormData({
      movie_id: st.movie_id || st.movie?.id || '',
      room_id: st.room_id || st.room?.id || '',
      cinema_id: cinemaId,
      start_date: datePart,
      start_time: timePart,
      duration: st.movie?.duration || 120,
      projection_format_id: st.projection_format_id || st.projection_format?.id || '',
    });
    setErrors({});
    if (cinemaId) handleCinemaChange(cinemaId, st.room_id || st.room?.id || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSt(null);
    setErrors({});
  };

  const handleDelete = async (id) => {
    const ok = await confirmDialog({
      title: 'Xóa lịch chiếu?',
      message: 'Lịch chiếu sẽ bị xóa. Các đơn đặt vé đã tạo cho lịch này có thể bị ảnh hưởng.',
      confirmText: 'Xóa',
      danger: true,
    });
    if (!ok) return;
    try {
      await axiosClient.delete(`/admin/showtimes/${id}`);
      notify.success('Đã xóa lịch chiếu');
      handleCloseModal();
      fetchShowtimes();
    } catch (e) {
      console.error('[ShowtimeManagePage] delete error:', e);
      notify.error(getErrorMessage(e), 'Xóa thất bại');
    }
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!formData.movie_id) newErrors.movie_id = 'Vui lòng chọn phim';
    if (!formData.cinema_id) newErrors.cinema_id = 'Vui lòng chọn rạp';
    if (!formData.room_id) newErrors.room_id = 'Vui lòng chọn phòng chiếu';
    if (!formData.start_date) newErrors.start_date = 'Vui lòng chọn ngày chiếu';
    if (!formData.start_time) {
      newErrors.start_date = newErrors.start_date || 'Vui lòng chọn giờ chiếu';
      newErrors.start_time = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      // Tạo Date trong local time để tránh lệch UTC khi serialize end_time
      const startDate = new Date(`${formData.start_date}T${formData.start_time}:00`);
      if (isNaN(startDate.getTime())) {
        setErrors({ start_date: 'Ngày/giờ chiếu không hợp lệ' });
        setSaving(false);
        return;
      }

      // Ràng buộc thời gian chiếu ở tương lai
      const now = new Date();
      if (startDate < now) {
        const originalTimeStr = editingSt ? (editingSt.start_time || '').replace(' ', 'T').slice(0, 16) : null;
        const currentTimeStr = `${formData.start_date}T${formData.start_time}`;
        if (!editingSt || currentTimeStr !== originalTimeStr) {
          setErrors({ start_date: 'Thời gian chiếu phải ở tương lai (lớn hơn hoặc bằng thời gian hiện tại)' });
          setSaving(false);
          return;
        }
      }
      const endDate = new Date(startDate.getTime() + parseInt(formData.duration || 120) * 60 * 1000);

      // Format "YYYY-MM-DD HH:mm:ss" theo local time (không dùng toISOString để khỏi đổi sang UTC)
      const pad = (n) => String(n).padStart(2, '0');
      const fmt = (d) =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
        `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

      const payload = {
        movie_id: parseInt(formData.movie_id),
        room_id: parseInt(formData.room_id),
        start_time: fmt(startDate),
        end_time:   fmt(endDate),
        projection_format_id: parseInt(formData.projection_format_id),
      };

      if (editingSt) {
        await axiosClient.put(`/admin/showtimes/${editingSt.id}`, payload);
        notify.success('Đã cập nhật lịch chiếu');
      } else {
        await axiosClient.post('/admin/showtimes', payload);
        notify.success('Đã thêm lịch chiếu');
      }
      handleCloseModal();
      fetchShowtimes();
    } catch (e) {
      console.error('[ShowtimeManagePage] save error:', e);
      if (e.response?.status === 422 && e.response?.data?.errors) {
        const backendErrors = e.response.data.errors;
        const newErrors = {};
        Object.keys(backendErrors).forEach((key) => {
          const msg = Array.isArray(backendErrors[key]) ? backendErrors[key][0] : backendErrors[key];
          if (key === 'start_time' || key === 'end_time') {
            newErrors.start_date = msg;
            newErrors.start_time = true;
          } else {
            newErrors[key] = msg;
          }
        });
        setErrors(newErrors);
        notify.error('Lịch chiếu chưa hợp lệ. Vui lòng kiểm tra báo đỏ!', 'Lỗi nhập liệu');
      } else {
        notify.error(getErrorMessage(e), 'Lưu thất bại');
      }
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (dt) => {
    if (!dt) return '-';
    const d = new Date(dt);
    return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const filteredShowtimes = showtimes.filter(st => {
    const matchMovie = movieFilter === 'all' || String(st.movie_id || st.movie?.id) === movieFilter;
    let matchDate = true;
    if (dateFilter && st.start_time) {
      const parts = st.start_time.split(' ');
      matchDate = parts[0] === dateFilter;
    }
    const status = getShowtimeStatus(st.start_time, st.end_time);
    const matchStatus = statusFilter === 'all' || status === statusFilter;
    return matchMovie && matchDate && matchStatus;
  });

  return (
    <div className={styles.showtimeManage}>
      <div className={styles.header}>
        <h2>Quản lý Lịch chiếu</h2>
        <div className={styles.headerActions}>
          <div className={styles.filterWrapper}>
            <label htmlFor="dateFilter" className={styles.filterLabel}>Lọc theo ngày:</label>
            <input
              type="date"
              id="dateFilter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={styles.statusFilterSelect}
              style={{ maxWidth: '160px' }}
            />
          </div>
          <div className={styles.filterWrapper}>
            <label htmlFor="movieFilter" className={styles.filterLabel}>Lọc theo phim:</label>
            <select
              id="movieFilter"
              value={movieFilter}
              onChange={(e) => setMovieFilter(e.target.value)}
              className={styles.statusFilterSelect}
              style={{ maxWidth: '250px' }}
            >
              <option value="all">Tất cả phim</option>
              {movies.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterWrapper}>
            <label htmlFor="statusFilter" className={styles.filterLabel}>Trạng thái:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.statusFilterSelect}
              style={{ maxWidth: '160px' }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="ongoing">Đang diễn ra</option>
              <option value="ended">Đã diễn ra</option>
            </select>
          </div>
          <button className={styles.addBtn} onClick={handleOpenModal}><MdAdd /> Thêm Lịch chiếu</button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? <p style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Đang tải...</p> : (
          <table className={styles.table}>
            <thead><tr><th>Phim</th><th>Rạp</th><th>Phòng chiếu</th><th>Định dạng</th><th>Thời gian chiếu</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {filteredShowtimes.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>Không tìm thấy lịch chiếu phù hợp</td></tr>
              ) : filteredShowtimes.map(st => (
                <tr key={st.id} onClick={() => handleEdit(st)}>
                  <td><strong>{st.movie?.title || 'N/A'}</strong></td>
                  <td>{st.room?.cinema?.name || 'N/A'}</td>
                  <td>{st.room?.name || 'N/A'}</td>
                  <td><span className={styles.formatTag}>{st.projection_format?.name || st.projection_format || '2D Vietsub'}</span></td>
                  <td><span className={styles.timeTag}>{formatDateTime(st.start_time)}</span></td>
                  <td>
                    {(() => {
                      const status = getShowtimeStatus(st.start_time, st.end_time);
                      const config = statusConfig[status];
                      return (
                        <span className={`${styles.statusBadge} ${styles[config.classKey]}`}>
                          {config.label}
                        </span>
                      );
                    })()}
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
              <h3>{editingSt ? 'Chi Tiết Lịch Chiếu' : 'Thêm Lịch chiếu mới'}</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}><MdClose /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalSplitLayout}>
                <div className={styles.formColumn}>
                  <form className={styles.form} onSubmit={e => e.preventDefault()} noValidate>
                    <div className={styles.formGroup}>
                      <label>Chọn Phim *</label>
                      <select name="movie_id" value={formData.movie_id} onChange={(e) => { handleChange(e); const m = movies.find(m => m.id == e.target.value); if (m) setFormData(prev => ({...prev, duration: m.duration || 120})); }} className={errors.movie_id ? 'inputErrorGlobal' : ''}>
                        <option value="">-- Lựa chọn Phim --</option>
                        {movies.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                      </select>
                      {errors.movie_id && <span className="errorTextGlobal">{errors.movie_id}</span>}
                    </div>
                    <div className={styles.formGroup}>
                      <label>Định dạng / Phụ đề *</label>
                      <select name="projection_format_id" value={formData.projection_format_id} onChange={handleChange} disabled={!formData.room_id} className={errors.projection_format_id ? 'inputErrorGlobal' : ''}>
                        <option value="">-- Lựa chọn định dạng --</option>
                        {(rooms.find(r => String(r.id) === String(formData.room_id))?.projection_formats || []).map(fmt => (
                          <option key={fmt.id} value={fmt.id}>{fmt.name}</option>
                        ))}
                      </select>
                      {!formData.room_id && (
                        <small style={{ color: '#9ca3af', fontStyle: 'italic', display: 'block', marginTop: '4px', fontSize: '11px' }}>
                          Vui lòng chọn phòng chiếu trước để chọn định dạng phù hợp.
                        </small>
                      )}
                      {errors.projection_format_id && <span className="errorTextGlobal">{errors.projection_format_id}</span>}
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Chọn Rạp *</label>
                        <select name="cinema_id" value={formData.cinema_id} onChange={(e) => handleCinemaChange(e.target.value)} className={errors.cinema_id ? 'inputErrorGlobal' : ''}>
                          <option value="">-- Lựa chọn Rạp --</option>
                          {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {errors.cinema_id && <span className="errorTextGlobal">{errors.cinema_id}</span>}
                      </div>
                      <div className={styles.formGroup}>
                        <label>Phòng chiếu *</label>
                        <select name="room_id" value={formData.room_id} onChange={handleChange} className={errors.room_id ? 'inputErrorGlobal' : ''}>
                          <option value="">-- Lựa chọn Phòng --</option>
                          {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        {errors.room_id && <span className="errorTextGlobal">{errors.room_id}</span>}
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Ngày chiếu *</label>
                        <input
                          type="date"
                          name="start_date"
                          value={formData.start_date}
                          onChange={handleChange}
                          className={errors.start_date ? 'inputErrorGlobal' : ''}
                          min={getTodayString()}
                        />
                        {errors.start_date && <span className="errorTextGlobal">{errors.start_date}</span>}
                      </div>
                      <div className={styles.formGroup}>
                        <label>Giờ chiếu *</label>
                        <div className={styles.timeSelectRow}>
                          <select 
                            value={formData.start_time ? formData.start_time.split(':')[0] : '09'} 
                            onChange={(e) => handleTimeChange('hour', e.target.value)}
                            className={`${styles.timeSelect} ${errors.start_time ? 'inputErrorGlobal' : ''}`}
                          >
                            {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                              <option key={h} value={h}>{h} giờ</option>
                            ))}
                          </select>
                          <span className={styles.timeColon}>:</span>
                          <select 
                            value={formData.start_time ? formData.start_time.split(':')[1] : '00'} 
                            onChange={(e) => handleTimeChange('minute', e.target.value)}
                            className={`${styles.timeSelect} ${errors.start_time ? 'inputErrorGlobal' : ''}`}
                          >
                            {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                              <option key={m} value={m}>{m} phút</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <small className={styles.helperText} style={{ color: '#0284c7', display: 'block', marginBottom: '12px' }}>
                      💡 <strong>Quy định:</strong> Hệ thống tự động cộng thêm <strong>15 phút dọn dẹp</strong> sau khi phim kết thúc. Bạn không thể xếp suất chiếu tiếp theo đè lên khoảng thời gian dọn dẹp này.
                    </small>
                    <small className={styles.helperText}>
                      Giá vé được lấy tự động từ <strong>Bảng giá vé</strong> theo loại ghế và ngày chiếu (T2-T6 ngày thường / T7-CN cuối tuần / Lễ). Sửa giá ở trang <strong>"Bảng giá vé"</strong>.
                    </small>
                  </form>
                </div>

                <div className={styles.scheduleColumn}>
                  <h4>Tình trạng phòng chiếu trong ngày</h4>
                  {formData.cinema_id && formData.start_date ? (
                    loadingSchedules ? (
                      <p className={styles.placeholderText}>Đang tải lịch phòng...</p>
                    ) : roomSchedules.length === 0 ? (
                      <p className={styles.placeholderText}>Không tìm thấy dữ liệu phòng.</p>
                    ) : (
                      <div className={styles.scheduleList}>
                        {roomSchedules.map(room => (
                          <div 
                            key={room.id} 
                            className={`${styles.roomScheduleCard} ${room.id == formData.room_id ? styles.selectedRoomCard : ''}`}
                          >
                            <h5 className={styles.roomNameTitle}>
                              {room.name} <span className={styles.capacityText}>({room.capacity || 0} ghế)</span>
                            </h5>
                            <div className={styles.timeline}>
                              {room.showtimes && room.showtimes.length > 0 ? (
                                room.showtimes.map(st => {
                                  const start = formatTimeOnly(st.start_time);
                                  const end = formatTimeOnly(st.end_time);
                                  return (
                                    <div key={st.id} className={styles.timelineItem}>
                                      <span className={styles.timeRange}>{start} - {end}</span>
                                      <span className={styles.movieTitle}>{st.movie?.title || 'Chưa rõ phim'}</span>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className={styles.emptyTimeline}>Trống lịch cả ngày</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <p className={styles.placeholderText}>
                      Vui lòng chọn <strong>Rạp</strong> và <strong>Ngày chiếu</strong> để kiểm tra tình trạng trống phòng.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              {editingSt && (
                <button
                  type="button"
                  className={styles.deleteBtnModal}
                  onClick={() => handleDelete(editingSt.id)}
                  disabled={saving}
                >
                  Xóa Lịch Chiếu
                </button>
              )}
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
