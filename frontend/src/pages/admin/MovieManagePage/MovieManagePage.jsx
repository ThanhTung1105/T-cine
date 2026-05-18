import React, { useState, useRef, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose, MdCloudUpload } from 'react-icons/md';
import movieApi from '../../../api/movieApi';
import axiosClient from '../../../api/axiosClient';
import styles from './MovieManagePage.module.scss';

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';

const MovieManagePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [previewPoster, setPreviewPoster] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '', description: '', genre: '', director: '', cast_info: '',
    duration: '', age_rating: 'T13', rating: '', release_date: '',
    status: 'now_showing', trailer_url: '',
  });
  
  const posterInputRef = useRef(null);

  // Load danh sách phim
  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await movieApi.getAll({ per_page: 50 });
      setMovies(res.data || []);
    } catch (error) {
      console.error('Lỗi tải phim:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMovies(); }, []);

  // Upload ảnh lên server
  const uploadImage = async (file, folder = 'movies') => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    const res = await axiosClient.post('/admin/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.url;
  };

  // Mở modal thêm mới
  const handleOpenModal = () => {
    setEditingMovie(null);
    setFormData({
      title: '', description: '', genre: '', director: '', cast_info: '',
      duration: '', age_rating: 'T13', rating: '', release_date: '',
      status: 'now_showing', trailer_url: '',
    });
    setPreviewPoster(null);
    setPosterFile(null);
    setIsModalOpen(true);
  };

  // Mở modal sửa
  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title || '', description: movie.description || '',
      genre: movie.genre || '', director: movie.director || '',
      cast_info: movie.cast_info || '', duration: movie.duration || '',
      age_rating: movie.age_rating || 'T13', rating: movie.rating || '',
      release_date: movie.release_date || '', status: movie.status || 'now_showing',
      trailer_url: movie.trailer_url || '',
    });
    setPreviewPoster(movie.poster ? (movie.poster.startsWith('http') ? movie.poster : `${STORAGE_URL}/${movie.poster}`) : null);
    setPosterFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMovie(null);
    setPreviewPoster(null);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e, setPreview, setFile) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Xóa phim
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa phim này?')) return;
    try {
      await movieApi.delete(id);
      fetchMovies();
    } catch (error) {
      alert('Xóa phim thất bại!');
    }
  };

  // Lưu phim (thêm mới hoặc cập nhật)
  const handleSave = async () => {
    if (!formData.title || !formData.status) {
      alert('Vui lòng nhập tên phim và trạng thái!');
      return;
    }
    setSaving(true);
    try {
      let posterUrl = editingMovie?.poster || '';

      // Upload ảnh mới nếu có
      if (posterFile) posterUrl = await uploadImage(posterFile, 'movies');

      const payload = {
        ...formData,
        poster: posterUrl,
        duration: formData.duration ? parseInt(formData.duration) : null,
        rating: formData.rating ? parseFloat(formData.rating) : null,
      };

      if (editingMovie) {
        await movieApi.update(editingMovie.id, payload);
      } else {
        await movieApi.create(payload);
      }

      handleCloseModal();
      fetchMovies();
    } catch (error) {
      console.error('Lỗi lưu phim:', error);
      alert('Lưu phim thất bại! ' + (error.response?.data?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const statusMap = { now_showing: 'Đang chiếu', coming_soon: 'Sắp chiếu', ended: 'Đã kết thúc' };

  return (
    <div className={styles.movieManage}>
      <div className={styles.header}>
        <h2>Quản lý Phim</h2>
        <button className={styles.addBtn} onClick={handleOpenModal}>
          <MdAdd /> Thêm Phim Mới
        </button>
      </div>

      {/* Bảng danh sách phim */}
      <div className={styles.tableContainer}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Đang tải...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Poster</th>
                <th>Tên phim</th>
                <th>Thể loại</th>
                <th>Thời lượng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {movies.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#aaa' }}>Chưa có phim nào</td></tr>
              ) : movies.map(movie => (
                <tr key={movie.id}>
                  <td>
                    {movie.poster ? (
                      <img src={movie.poster.startsWith('http') ? movie.poster : `${STORAGE_URL}/${movie.poster}`} alt={movie.title} className={styles.posterImg} />
                    ) : (
                      <div className={styles.posterImg} style={{ background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#888' }}>No img</div>
                    )}
                  </td>
                  <td><strong>{movie.title}</strong></td>
                  <td>{movie.genre || '-'}</td>
                  <td>{movie.duration ? `${movie.duration} phút` : '-'}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${movie.status === 'now_showing' ? styles.statusActive : movie.status === 'coming_soon' ? styles.statusUpcoming : ''}`}>
                      {statusMap[movie.status] || movie.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className={styles.editBtn} title="Sửa" onClick={() => handleEdit(movie)}><MdEdit /></button>
                      <button className={styles.deleteBtn} title="Xóa" onClick={() => handleDelete(movie.id)}><MdDelete /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Thêm/Sửa Phim */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{editingMovie ? 'Sửa Phim' : 'Thêm Phim Mới'}</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}><MdClose /></button>
            </div>
            
            <div className={styles.modalBody}>
              <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Tên phim *</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Nhập tên phim" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Trạng thái *</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                      <option value="now_showing">Đang chiếu</option>
                      <option value="coming_soon">Sắp chiếu</option>
                      <option value="ended">Đã kết thúc</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Đạo diễn</label>
                    <input type="text" name="director" value={formData.director} onChange={handleChange} placeholder="Nhập tên đạo diễn" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Diễn viên</label>
                    <input type="text" name="cast_info" value={formData.cast_info} onChange={handleChange} placeholder="Nhập danh sách diễn viên" />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Thể loại</label>
                    <input type="text" name="genre" value={formData.genre} onChange={handleChange} placeholder="VD: Hành động, Viễn tưởng" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Thời lượng (phút)</label>
                    <input type="number" name="duration" value={formData.duration} onChange={handleChange} placeholder="120" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Ngày khởi chiếu</label>
                    <input type="date" name="release_date" value={formData.release_date} onChange={handleChange} />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Độ tuổi</label>
                    <select name="age_rating" value={formData.age_rating} onChange={handleChange}>
                      <option value="P">P - Mọi lứa tuổi</option>
                      <option value="T13">T13</option>
                      <option value="T16">T16</option>
                      <option value="T18">T18</option>
                      <option value="C">C - Cấm</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Điểm đánh giá (0-10)</label>
                    <input type="number" name="rating" value={formData.rating} onChange={handleChange} placeholder="8.5" min="0" max="10" step="0.1" />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Mô tả nội dung</label>
                  <textarea rows="4" name="description" value={formData.description} onChange={handleChange} placeholder="Nhập tóm tắt nội dung phim..."></textarea>
                </div>

                <div className={styles.formGroup}>
                  <label>Link Trailer (Youtube embed)</label>
                  <input type="url" name="trailer_url" value={formData.trailer_url} onChange={handleChange} placeholder="https://www.youtube.com/embed/..." />
                </div>

                {/* Khu vực Upload Poster */}
                <div className={styles.formGroup}>
                  <label>Ảnh Poster phim (Dọc)</label>
                  <div
                    className={styles.uploadArea}
                    onClick={() => posterInputRef.current.click()}
                    style={{ backgroundImage: previewPoster ? `url(${previewPoster})` : 'none' }}
                  >
                    {!previewPoster && (
                      <div className={styles.uploadPlaceholder}>
                        <MdCloudUpload className={styles.uploadIcon} />
                        <span>Click để tải poster lên</span>
                      </div>
                    )}
                    <input
                      type="file" accept="image/*" ref={posterInputRef}
                      onChange={(e) => handleImageUpload(e, setPreviewPoster, setPosterFile)} hidden
                    />
                  </div>
                  <small className={styles.uploadHint}>
                    ⚠️ <strong>Yêu cầu:</strong> Tỉ lệ <strong>dọc 2:3</strong> (khuyến nghị <strong>600×900px</strong>),
                    định dạng JPG/PNG/WEBP, dung lượng ≤ 2MB.
                  </small>
                  <small style={{ color: '#9ca3af', fontSize: '12px', marginTop: 4 }}>
                    Banner quảng cáo trang chủ được quản lý riêng tại mục <strong>Banner trang chủ</strong>.
                  </small>
                </div>

              </form>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>Hủy</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Đang lưu...' : (editingMovie ? 'Cập Nhật' : 'Lưu Phim')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieManagePage;
