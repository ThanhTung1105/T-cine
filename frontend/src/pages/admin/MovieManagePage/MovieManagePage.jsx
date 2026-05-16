import React, { useState, useRef } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose, MdCloudUpload } from 'react-icons/md';
import styles from './MovieManagePage.module.scss';

const MovieManagePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewPoster, setPreviewPoster] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);
  
  const posterInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // Mock data phim
  const [movies] = useState([
    { id: 1, title: 'Mai', genre: 'Tâm lý, Tình cảm', duration: '120 phút', status: 'Đang chiếu', poster: 'https://cdn.galaxycine.vn/media/2024/2/9/mai-500_1707447477943.jpg' },
    { id: 2, title: 'Đào, Phở và Piano', genre: 'Lịch sử, Chiến tranh', duration: '100 phút', status: 'Đang chiếu', poster: 'https://cdn.galaxycine.vn/media/2024/2/19/dao-pho-piano-500_1708328154141.jpg' },
    { id: 3, title: 'Kung Fu Panda 4', genre: 'Hoạt hình, Hài', duration: '94 phút', status: 'Sắp chiếu', poster: 'https://cdn.galaxycine.vn/media/2024/2/23/kfp4-500_1708655823159.jpg' },
  ]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPreviewPoster(null);
    setPreviewBanner(null);
  };

  const handleImageUpload = (e, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
            {movies.map(movie => (
              <tr key={movie.id}>
                <td>
                  <img src={movie.poster} alt={movie.title} className={styles.posterImg} />
                </td>
                <td><strong>{movie.title}</strong></td>
                <td>{movie.genre}</td>
                <td>{movie.duration}</td>
                <td>
                  <span className={`${styles.statusBadge} ${movie.status === 'Đang chiếu' ? styles.statusActive : styles.statusUpcoming}`}>
                    {movie.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <button className={styles.editBtn} title="Sửa"><MdEdit /></button>
                    <button className={styles.deleteBtn} title="Xóa"><MdDelete /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm Phim */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Thêm Phim Mới</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}><MdClose /></button>
            </div>
            
            <div className={styles.modalBody}>
              <form className={styles.form}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Tên phim</label>
                    <input type="text" placeholder="Nhập tên phim" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Bí danh (Slug)</label>
                    <input type="text" placeholder="ten-phim" />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Đạo diễn</label>
                    <input type="text" placeholder="Nhập tên đạo diễn" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Diễn viên</label>
                    <input type="text" placeholder="Nhập danh sách diễn viên" />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Thể loại</label>
                    <select>
                      <option>Hành động</option>
                      <option>Tình cảm</option>
                      <option>Kinh dị</option>
                      <option>Hoạt hình</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Thời lượng (phút)</label>
                    <input type="number" placeholder="120" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Ngày khởi chiếu</label>
                    <input type="date" />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Mô tả nội dung</label>
                  <textarea rows="4" placeholder="Nhập tóm tắt nội dung phim..."></textarea>
                </div>

                <div className={styles.formGroup}>
                  <label>Link Trailer (Youtube)</label>
                  <input type="url" placeholder="https://youtube.com/watch?v=..." />
                </div>

                {/* Khu vực Upload Ảnh */}
                <div className={styles.uploadSection}>
                  <div className={styles.uploadBox}>
                    <label>Ảnh Poster (Dọc)</label>
                    <div 
                      className={styles.uploadArea} 
                      onClick={() => posterInputRef.current.click()}
                      style={{ backgroundImage: previewPoster ? `url(${previewPoster})` : 'none' }}
                    >
                      {!previewPoster && (
                        <div className={styles.uploadPlaceholder}>
                          <MdCloudUpload className={styles.uploadIcon} />
                          <span>Click để tải ảnh lên</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={posterInputRef} 
                        onChange={(e) => handleImageUpload(e, setPreviewPoster)} 
                        hidden 
                      />
                    </div>
                  </div>

                  <div className={styles.uploadBox}>
                    <label>Ảnh Banner (Ngang)</label>
                    <div 
                      className={`${styles.uploadArea} ${styles.bannerArea}`} 
                      onClick={() => bannerInputRef.current.click()}
                      style={{ backgroundImage: previewBanner ? `url(${previewBanner})` : 'none' }}
                    >
                      {!previewBanner && (
                        <div className={styles.uploadPlaceholder}>
                          <MdCloudUpload className={styles.uploadIcon} />
                          <span>Click để tải ảnh lên</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={bannerInputRef} 
                        onChange={(e) => handleImageUpload(e, setPreviewBanner)} 
                        hidden 
                      />
                    </div>
                  </div>
                </div>

              </form>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>Hủy</button>
              <button className={styles.saveBtn} onClick={handleCloseModal}>Lưu Phim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieManagePage;
