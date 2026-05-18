import React, { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose, MdEventSeat } from 'react-icons/md';
import cinemaApi from '../../../api/cinemaApi';
import axiosClient from '../../../api/axiosClient';
import styles from './RoomManagePage.module.scss';

const RoomManagePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState('');
  const [selectedRoomForSeat, setSelectedRoomForSeat] = useState(null);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({ name: '', capacity: '' });

  const fetchCinemas = async () => {
    try {
      const res = await cinemaApi.getAll();
      const list = res.data || [];
      setCinemas(list);
      if (list.length > 0 && !selectedCinema) {
        setSelectedCinema(String(list[0].id));
      }
    } catch (e) { console.error(e); }
  };

  const fetchRooms = async (cinemaId) => {
    if (!cinemaId) return;
    setLoading(true);
    try {
      const res = await cinemaApi.getRooms(cinemaId);
      setRooms(res.data || []);
    } catch (e) { setRooms([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCinemas(); }, []);
  useEffect(() => { if (selectedCinema) fetchRooms(selectedCinema); }, [selectedCinema]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleOpenModal = () => {
    setEditingRoom(null);
    setFormData({ name: '', capacity: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({ name: room.name, capacity: room.capacity || '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingRoom(null); };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Bạn có chắc muốn xóa phòng chiếu này?')) return;
    try {
      await axiosClient.delete(`/admin/cinemas/${selectedCinema}/rooms/${roomId}`);
      fetchRooms(selectedCinema);
    } catch (e) { alert('Xóa phòng thất bại!'); }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.capacity) { alert('Vui lòng nhập tên và sức chứa!'); return; }
    setSaving(true);
    try {
      const payload = { name: formData.name, capacity: parseInt(formData.capacity) };
      if (editingRoom) {
        await axiosClient.put(`/admin/cinemas/${selectedCinema}/rooms/${editingRoom.id}`, payload);
      } else {
        await axiosClient.post(`/admin/cinemas/${selectedCinema}/rooms`, payload);
      }
      handleCloseModal(); fetchRooms(selectedCinema);
    } catch (e) { alert('Lưu phòng thất bại!'); }
    finally { setSaving(false); }
  };

  const handleOpenSeatModal = (room) => { setSelectedRoomForSeat(room); setIsSeatModalOpen(true); };
  const handleCloseSeatModal = () => { setIsSeatModalOpen(false); setSelectedRoomForSeat(null); };

  const cinemaName = cinemas.find(c => String(c.id) === selectedCinema)?.name || '';

  return (
    <div className={styles.roomManage}>
      <div className={styles.header}>
        <h2>Quản lý Phòng Chiếu</h2>
        <button className={styles.addBtn} onClick={handleOpenModal}><MdAdd /> Thêm Phòng Mới</button>
      </div>

      <div className={styles.filterSection}>
        <label>Chọn Rạp để xem phòng chiếu:</label>
        <select value={selectedCinema} onChange={(e) => setSelectedCinema(e.target.value)} className={styles.cinemaSelect}>
          {cinemas.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
        </select>
      </div>

      <div className={styles.tableContainer}>
        {loading ? <p style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Đang tải...</p> : (
          <table className={styles.table}>
            <thead><tr><th>Tên Phòng</th><th>Sức chứa</th><th>Số ghế</th><th>Thao tác</th></tr></thead>
            <tbody>
              {rooms.length > 0 ? rooms.map(room => (
                <tr key={room.id}>
                  <td><strong>{room.name}</strong></td>
                  <td>{room.capacity || '-'} ghế</td>
                  <td>{room.seats_count ?? '-'}</td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className={styles.seatBtn} title="Xem ghế" onClick={() => handleOpenSeatModal(room)}><MdEventSeat /></button>
                      <button className={styles.editBtn} title="Sửa" onClick={() => handleEdit(room)}><MdEdit /></button>
                      <button className={styles.deleteBtn} title="Xóa" onClick={() => handleDelete(room.id)}><MdDelete /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className={styles.emptyState}>Rạp này hiện chưa có phòng chiếu nào.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{editingRoom ? 'Sửa Phòng Chiếu' : 'Thêm Phòng Chiếu'}</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}><MdClose /></button>
            </div>
            <div className={styles.modalBody}>
              <form className={styles.form} onSubmit={e => e.preventDefault()}>
                <div className={styles.formGroup}>
                  <label>Trực thuộc Rạp</label>
                  <input type="text" value={cinemaName} disabled />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}><label>Tên Phòng *</label><input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="VD: Phòng 1" /></div>
                  <div className={styles.formGroup}><label>Sức chứa (ghế) *</label><input type="number" name="capacity" value={formData.capacity} onChange={handleChange} placeholder="120" /></div>
                </div>
              </form>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseModal}>Hủy</button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu Phòng'}</button>
            </div>
          </div>
        </div>
      )}

      {isSeatModalOpen && selectedRoomForSeat && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.seatModal}`}>
            <div className={styles.modalHeader}>
              <h3>Sơ đồ ghế: {selectedRoomForSeat.name} ({cinemaName})</h3>
              <button className={styles.closeBtn} onClick={handleCloseSeatModal}><MdClose /></button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.seatGuide}>
                <div className={styles.legend}>
                  <div className={styles.legendItem}><div className={`${styles.seatBox} ${styles.seatStandard}`}></div> Ghế Thường</div>
                  <div className={styles.legendItem}><div className={`${styles.seatBox} ${styles.seatVip}`}></div> Ghế VIP</div>
                  <div className={styles.legendItem}><div className={`${styles.seatBox} ${styles.seatCouple}`}></div> Ghế Đôi</div>
                </div>
              </div>
              <div className={styles.screenArea}><div className={styles.screen}>MÀN HÌNH</div></div>
              <div className={styles.seatGridContainer}>
                {selectedRoomForSeat.seats && selectedRoomForSeat.seats.length > 0 ? (
                  <div className={styles.seatGrid}>
                    {Object.entries(selectedRoomForSeat.seats.reduce((acc, seat) => {
                      if (!acc[seat.row]) acc[seat.row] = [];
                      acc[seat.row].push(seat);
                      return acc;
                    }, {})).sort().map(([row, seats]) => (
                      <div key={row} className={styles.seatRow}>
                        <span className={styles.rowLabel}>{row}</span>
                        {seats.sort((a, b) => a.column_num - b.column_num).map(seat => (
                          <div key={seat.id} className={`${styles.seatBox} ${seat.type === 'vip' ? styles.seatVip : seat.type === 'couple' ? styles.seatCouple : styles.seatStandard}`} title={`${seat.row}${seat.column_num}`}>
                            {seat.column_num}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: '#aaa', padding: '30px' }}>Phòng này chưa có ghế. Vui lòng tạo ghế qua Seeder hoặc API.</p>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseSeatModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagePage;
