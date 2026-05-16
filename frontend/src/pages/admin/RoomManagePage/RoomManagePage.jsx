import React, { useState } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose, MdEventSeat } from 'react-icons/md';
import styles from './RoomManagePage.module.scss';

const RoomManagePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState('1'); // Mặc định chọn rạp 1
  const [selectedRoomForSeat, setSelectedRoomForSeat] = useState(null);

  // Mock Data Rạp
  const cinemas = [
    { id: '1', name: 'T-CINE Landmark 81' },
    { id: '2', name: 'T-CINE Giga Mall' },
    { id: '3', name: 'T-CINE Aeon Tân Phú' },
  ];

  // Mock Data Phòng Chiếu (giả lập chỉ hiện phòng của rạp được chọn)
  const allRooms = [
    { id: 1, cinemaId: '1', name: 'Phòng 1', type: 'Standard', rowCount: 10, colCount: 12, totalSeats: 120, status: 'Hoạt động' },
    { id: 2, cinemaId: '1', name: 'Phòng 2', type: 'VIP', rowCount: 8, colCount: 10, totalSeats: 80, status: 'Hoạt động' },
    { id: 3, cinemaId: '1', name: 'Phòng 3', type: 'IMAX', rowCount: 12, colCount: 15, totalSeats: 180, status: 'Bảo trì' },
    { id: 4, cinemaId: '2', name: 'Phòng 1', type: 'Standard', rowCount: 10, colCount: 12, totalSeats: 120, status: 'Hoạt động' },
  ];

  const filteredRooms = allRooms.filter(room => room.cinemaId === selectedCinema);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenSeatModal = (room) => {
    setSelectedRoomForSeat(room);
    setIsSeatModalOpen(true);
  };
  const handleCloseSeatModal = () => {
    setIsSeatModalOpen(false);
    setSelectedRoomForSeat(null);
  };

  return (
    <div className={styles.roomManage}>
      <div className={styles.header}>
        <h2>Quản lý Phòng Chiếu</h2>
        <button className={styles.addBtn} onClick={handleOpenModal}>
          <MdAdd /> Thêm Phòng Mới
        </button>
      </div>

      {/* Bộ lọc Rạp Cha */}
      <div className={styles.filterSection}>
        <label>Chọn Rạp để xem phòng chiếu:</label>
        <select 
          value={selectedCinema} 
          onChange={(e) => setSelectedCinema(e.target.value)}
          className={styles.cinemaSelect}
        >
          {cinemas.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên Phòng</th>
              <th>Loại Phòng</th>
              <th>Sơ đồ ghế (Hàng x Cột)</th>
              <th>Tổng ghế</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.length > 0 ? (
              filteredRooms.map(room => (
                <tr key={room.id}>
                  <td><strong>{room.name}</strong></td>
                  <td><span className={styles.typeBadge}>{room.type}</span></td>
                  <td>{room.rowCount} x {room.colCount}</td>
                  <td>{room.totalSeats} ghế</td>
                  <td>
                    <span className={`${styles.statusBadge} ${room.status === 'Hoạt động' ? styles.statusActive : styles.statusMaintenance}`}>
                      {room.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className={styles.seatBtn} title="Quản lý Sơ đồ ghế" onClick={() => handleOpenSeatModal(room)}>
                        <MdEventSeat />
                      </button>
                      <button className={styles.editBtn} title="Sửa"><MdEdit /></button>
                      <button className={styles.deleteBtn} title="Xóa"><MdDelete /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className={styles.emptyState}>Rạp này hiện chưa có phòng chiếu nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm/Sửa Phòng */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Thêm Phòng Chiếu</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}><MdClose /></button>
            </div>
            
            <div className={styles.modalBody}>
              <form className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Trực thuộc Rạp</label>
                  <select defaultValue={selectedCinema} disabled>
                    {cinemas.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <small className={styles.helperText}>Phòng chiếu sẽ được thêm vào rạp bạn đang chọn ở ngoài.</small>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Tên Phòng</label>
                    <input type="text" placeholder="VD: Phòng 1, Cinema 02..." />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Loại Phòng</label>
                    <select>
                      <option>Standard (Tiêu chuẩn)</option>
                      <option>VIP</option>
                      <option>IMAX</option>
                      <option>3D</option>
                    </select>
                  </div>
                </div>

                <div className={styles.seatConfigSection}>
                  <h4>Cấu hình sơ đồ ghế cơ bản</h4>
                  <p>Hệ thống sẽ tự động tạo ma trận ghế dựa trên Hàng và Cột.</p>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Số lượng Hàng (Ngang)</label>
                      <input type="number" placeholder="VD: 10" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Số lượng Cột (Dọc)</label>
                      <input type="number" placeholder="VD: 12" />
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Trạng thái</label>
                  <select>
                    <option>Hoạt động</option>
                    <option>Bảo trì</option>
                  </select>
                </div>
              </form>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>Hủy</button>
              <button className={styles.saveBtn} onClick={handleCloseModal}>Lưu Phòng Chiếu</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quản lý Sơ đồ ghế */}
      {isSeatModalOpen && selectedRoomForSeat && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.seatModal}`}>
            <div className={styles.modalHeader}>
              <h3>Cấu hình Sơ đồ ghế: {selectedRoomForSeat.name} (Rạp {cinemas.find(c => c.id === selectedRoomForSeat.cinemaId)?.name})</h3>
              <button className={styles.closeBtn} onClick={handleCloseSeatModal}><MdClose /></button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.seatGuide}>
                <div className={styles.legend}>
                  <div className={styles.legendItem}><div className={`${styles.seatBox} ${styles.seatStandard}`}></div> Ghế Thường</div>
                  <div className={styles.legendItem}><div className={`${styles.seatBox} ${styles.seatVip}`}></div> Ghế VIP</div>
                  <div className={styles.legendItem}><div className={`${styles.seatBox} ${styles.seatCouple}`}></div> Ghế Đôi</div>
                  <div className={styles.legendItem}><div className={`${styles.seatBox} ${styles.seatBroken}`}></div> Ghế Hỏng/Trống</div>
                </div>
                <p className={styles.helperText}>* Click vào một ghế bất kỳ để thay đổi loại ghế.</p>
              </div>

              <div className={styles.screenArea}>
                <div className={styles.screen}>MÀN HÌNH</div>
              </div>

              <div className={styles.seatGridContainer}>
                <div className={styles.seatGrid}>
                  {Array.from({ length: selectedRoomForSeat.rowCount }).map((_, rowIndex) => (
                    <div key={rowIndex} className={styles.seatRow}>
                      <span className={styles.rowLabel}>{String.fromCharCode(65 + rowIndex)}</span>
                      {Array.from({ length: selectedRoomForSeat.colCount }).map((_, colIndex) => {
                        // Giả lập một vài ghế VIP ở giữa, một vài ghế hỏng
                        let seatTypeClass = styles.seatStandard;
                        if (rowIndex > 3 && rowIndex < 7 && colIndex > 2 && colIndex < 9) seatTypeClass = styles.seatVip;
                        if (rowIndex === 2 && colIndex === 5) seatTypeClass = styles.seatBroken;
                        if (rowIndex === selectedRoomForSeat.rowCount - 1) seatTypeClass = styles.seatCouple;

                        return (
                          <div 
                            key={`${rowIndex}-${colIndex}`} 
                            className={`${styles.seatBox} ${seatTypeClass}`}
                            title={`${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`}
                          >
                            {colIndex + 1}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseSeatModal}>Hủy</button>
              <button className={styles.saveBtn} onClick={handleCloseSeatModal}>Lưu Sơ đồ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagePage;
