import React, { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose, MdEventSeat, MdAutoFixHigh, MdDeleteSweep, MdInfoOutline } from 'react-icons/md';
import cinemaApi from '../../../api/cinemaApi';
import { getErrorMessage } from '../../../utils/helpers';
import { notify, confirmDialog } from '../../../utils/notify';
import styles from './RoomManagePage.module.scss';

const SEAT_TYPE_LABEL = {
  normal: 'Ghế Thường',
  vip: 'Ghế VIP',
  couple: 'Ghế Đôi',
};

const SEAT_TYPE_CLASS = {
  normal: 'seatStandard',
  vip: 'seatVip',
  couple: 'seatCouple',
};

// Cycle: normal -> vip -> couple -> normal
const NEXT_TYPE = { normal: 'vip', vip: 'couple', couple: 'normal' };

const RoomManagePage = () => {
  // Room state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState('');
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({ name: '', capacity: '' });
  const [errors, setErrors] = useState({});

  // Seat state
  const [selectedRoomForSeat, setSelectedRoomForSeat] = useState(null);
  const [seats, setSeats] = useState([]);
  const [seatLoading, setSeatLoading] = useState(false);
  const [seatGenForm, setSeatGenForm] = useState({
    rows: 8,
    columns: 10,
    vipRowsInput: 'D,E,F',
    coupleRowsInput: '',
  });
  const [generating, setGenerating] = useState(false);
  const [seatErrors, setSeatErrors] = useState({});

  // ===== Cinemas =====
  const fetchCinemas = async () => {
    try {
      const res = await cinemaApi.getAll();
      const list = res.data || [];
      setCinemas(list);
      if (list.length > 0 && !selectedCinema) {
        setSelectedCinema(String(list[0].id));
      }
    } catch (e) {
      console.error('[RoomManagePage] fetchCinemas error:', e);
      notify.error(getErrorMessage(e), 'Tải danh sách rạp thất bại');
    }
  };

  const fetchRooms = async (cinemaId) => {
    if (!cinemaId) return;
    setLoading(true);
    try {
      const res = await cinemaApi.getRooms(cinemaId);
      setRooms(res.data || []);
    } catch (e) {
      console.error('[RoomManagePage] fetchRooms error:', e);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCinemas(); }, []);
  useEffect(() => { if (selectedCinema) fetchRooms(selectedCinema); }, [selectedCinema]);

  // ===== Room CRUD =====
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSeatGenChange = (field, val) => {
    setSeatGenForm(p => ({ ...p, [field]: val }));
    setSeatErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleOpenModal = () => {
    setEditingRoom(null);
    setFormData({ name: '', capacity: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({ name: room.name, capacity: room.capacity || '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
    setErrors({});
  };

  const handleDelete = async (roomId) => {
    const ok = await confirmDialog({
      title: 'Xóa phòng chiếu?',
      message: 'Toàn bộ ghế trong phòng cũng sẽ bị xoá. Hành động không thể hoàn tác.',
      confirmText: 'Xóa',
      danger: true,
    });
    if (!ok) return;
    try {
      await cinemaApi.deleteRoom(selectedCinema, roomId);
      notify.success('Đã xoá phòng chiếu');
      fetchRooms(selectedCinema);
    } catch (e) {
      console.error('[RoomManagePage] delete error:', e);
      notify.error(getErrorMessage(e), 'Xóa phòng thất bại');
    }
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'Vui lòng nhập tên phòng chiếu';
    }
    
    const capacityVal = formData.capacity ? parseInt(formData.capacity, 10) : NaN;
    if (formData.capacity === '' || isNaN(capacityVal)) {
      newErrors.capacity = 'Vui lòng nhập sức chứa';
    } else if (capacityVal <= 0) {
      newErrors.capacity = 'Sức chứa phải là số nguyên dương lớn hơn 0';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const payload = { name: formData.name.trim(), capacity: capacityVal };
      if (editingRoom) {
        await cinemaApi.updateRoom(selectedCinema, editingRoom.id, payload);
        notify.success('Đã cập nhật phòng chiếu');
      } else {
        await cinemaApi.createRoom(selectedCinema, payload);
        notify.success('Đã thêm phòng chiếu');
      }
      handleCloseModal();
      fetchRooms(selectedCinema);
    } catch (e) {
      console.error('[RoomManagePage] save error:', e);
      notify.error(getErrorMessage(e), 'Lưu phòng thất bại');
    } finally {
      setSaving(false);
    }
  };

  // ===== Seat management =====
  const loadSeats = async (cinemaId, roomId) => {
    setSeatLoading(true);
    try {
      const res = await cinemaApi.getSeats(cinemaId, roomId);
      setSeats(res.data?.seats || []);
    } catch (e) {
      console.error('[RoomManagePage] loadSeats error:', e);
      setSeats([]);
      notify.error(getErrorMessage(e), 'Tải sơ đồ ghế thất bại');
    } finally {
      setSeatLoading(false);
    }
  };

  const handleOpenSeatModal = async (room) => {
    setSelectedRoomForSeat(room);
    setSeatErrors({});
    setSeatGenForm({
      rows: 8,
      columns: 10,
      vipRowsInput: 'D,E,F',
      coupleRowsInput: '',
    });
    setIsSeatModalOpen(true);
    setSeats([]);
    await loadSeats(selectedCinema, room.id);
  };

  const handleCloseSeatModal = () => {
    setIsSeatModalOpen(false);
    setSelectedRoomForSeat(null);
    setSeats([]);
    setSeatErrors({});
    // Refresh rooms để cập nhật seats_count/capacity
    fetchRooms(selectedCinema);
  };

  const parseRows = (text) =>
    text.split(',').map(s => s.trim().toUpperCase()).filter(s => /^[A-Z]$/.test(s));

  const handleGenerateSeats = async () => {
    const newSeatErrors = {};
    const rows = parseInt(seatGenForm.rows, 10);
    const columns = parseInt(seatGenForm.columns, 10);

    if (isNaN(rows) || rows < 1 || rows > 26) {
      newSeatErrors.rows = 'Số hàng phải từ 1 đến 26';
    }
    if (isNaN(columns) || columns < 1 || columns > 30) {
      newSeatErrors.columns = 'Số ghế / hàng phải từ 1 đến 30';
    }

    if (Object.keys(newSeatErrors).length > 0) {
      setSeatErrors(newSeatErrors);
      return;
    }

    const capacity = Number(selectedRoomForSeat?.capacity || 0);
    if (capacity <= 0) {
      notify.warning('Phòng chưa có sức chứa. Hãy bấm "Sửa" để nhập sức chứa trước khi tạo sơ đồ ghế.');
      return;
    }

    const vipRows = parseRows(seatGenForm.vipRowsInput);
    const coupleRows = parseRows(seatGenForm.coupleRowsInput);

    // Kiểm tra hàng VIP trùng hàng Ghế Đôi
    const overlaps = vipRows.filter(r => coupleRows.includes(r));
    if (overlaps.length > 0) {
      newSeatErrors.vipRowsInput = `Hàng ${overlaps.join(', ')} không thể vừa là VIP vừa là Ghế Đôi`;
      newSeatErrors.coupleRowsInput = `Hàng ${overlaps.join(', ')} không thể vừa là VIP vừa là Ghế Đôi`;
      setSeatErrors(newSeatErrors);
      return;
    }

    // Kiểm tra hàng VIP/Ghế Đôi vượt số hàng
    const invalidVip = vipRows.filter(r => r.charCodeAt(0) - 65 >= rows);
    if (invalidVip.length > 0) {
      newSeatErrors.vipRowsInput = `Hàng VIP (${invalidVip.join(', ')}) vượt quá tổng số hàng (${rows})`;
    }

    const invalidCouple = coupleRows.filter(r => r.charCodeAt(0) - 65 >= rows);
    if (invalidCouple.length > 0) {
      newSeatErrors.coupleRowsInput = `Hàng ghế đôi (${invalidCouple.join(', ')}) vượt quá tổng số hàng (${rows})`;
    }

    if (Object.keys(newSeatErrors).length > 0) {
      setSeatErrors(newSeatErrors);
      return;
    }

    // Hàng đôi chỉ có floor(columns/2) ghế (vì mỗi ghế rộng = 2 ghế thường)
    const coupleRowsInRange = coupleRows.filter((r) => r.charCodeAt(0) - 65 < rows).length;
    const seatsPerCoupleRow = Math.floor(columns / 2);
    const total = (rows - coupleRowsInRange) * columns + coupleRowsInRange * seatsPerCoupleRow;
    const effectiveSeats = (rows - coupleRowsInRange) * columns + coupleRowsInRange * seatsPerCoupleRow * 2;

    if (effectiveSeats > capacity) {
      notify.error(
        `Sức chứa dùng (${effectiveSeats} chỗ) vượt quá sức chứa phòng (${capacity}). Hãy giảm số hàng/cột, bớt hàng ghế đôi, hoặc bấm "Sửa" để tăng sức chứa.`,
        'Vượt sức chứa',
      );
      return;
    }

    if (seats.length > 0) {
      const ok = await confirmDialog({
        title: 'Tạo lại sơ đồ ghế?',
        message: `Phòng đã có ${seats.length} ghế. Tạo lại sẽ XOÁ toàn bộ ghế cũ và tạo sơ đồ mới (${total} ghế / ${effectiveSeats} chỗ).`,
        confirmText: 'Tạo lại',
        danger: true,
      });
      if (!ok) return;
    }

    setGenerating(true);
    try {
      const res = await cinemaApi.generateSeats(selectedCinema, selectedRoomForSeat.id, {
        rows,
        columns,
        vip_rows: vipRows,
        couple_rows: coupleRows,
        clear_existing: true,
      });
      setSeats(res.data?.seats || []);
      notify.success(res.message || 'Đã tạo sơ đồ ghế thành công!', 'Hoàn tất');
    } catch (e) {
      console.error('[RoomManagePage] generateSeats error:', e);
      notify.error(getErrorMessage(e), 'Tạo sơ đồ ghế thất bại');
    } finally {
      setGenerating(false);
    }
  };

  const handleClearSeats = async () => {
    const ok = await confirmDialog({
      title: 'Xoá toàn bộ ghế?',
      message: 'Sẽ xoá toàn bộ ghế của phòng này. Hành động không thể hoàn tác.',
      confirmText: 'Xoá hết',
      danger: true,
    });
    if (!ok) return;
    try {
      await cinemaApi.clearSeats(selectedCinema, selectedRoomForSeat.id);
      setSeats([]);
      notify.success('Đã xoá toàn bộ ghế của phòng.');
    } catch (e) {
      console.error('[RoomManagePage] clearSeats error:', e);
      notify.error(getErrorMessage(e), 'Xoá ghế thất bại');
    }
  };

  // Click ghế => cycle type (optimistic update)
  const handleClickSeat = async (seat) => {
    const newType = NEXT_TYPE[seat.type] || 'normal';
    setSeats(prev => prev.map(s => (s.id === seat.id ? { ...s, type: newType } : s)));
    try {
      await cinemaApi.updateSeat(selectedCinema, selectedRoomForSeat.id, seat.id, { type: newType });
    } catch (e) {
      console.error('[RoomManagePage] updateSeat error:', e);
      // Rollback
      setSeats(prev => prev.map(s => (s.id === seat.id ? { ...s, type: seat.type } : s)));
      notify.error(getErrorMessage(e), 'Cập nhật ghế thất bại');
    }
  };

  const seatsByRow = seats.reduce((acc, s) => {
    if (!acc[s.row]) acc[s.row] = [];
    acc[s.row].push(s);
    return acc;
  }, {});
  const sortedRowKeys = Object.keys(seatsByRow).sort();
  const seatCount = seats.length;
  const vipCount = seats.filter(s => s.type === 'vip').length;
  const coupleCount = seats.filter(s => s.type === 'couple').length;
  const normalCount = seatCount - vipCount - coupleCount;

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
                  <td>{room.capacity || 0} ghế</td>
                  <td>{room.seats_count ?? 0}</td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className={styles.seatBtn} title="Quản lý ghế" onClick={() => handleOpenSeatModal(room)}><MdEventSeat /></button>
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

      {/* ===== Modal Thêm/Sửa Phòng ===== */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{editingRoom ? 'Sửa Phòng Chiếu' : 'Thêm Phòng Chiếu'}</h3>
              <button className={styles.closeBtn} onClick={handleCloseModal}><MdClose /></button>
            </div>
            <div className={styles.modalBody}>
              <form className={styles.form} onSubmit={e => e.preventDefault()} noValidate>
                <div className={styles.formGroup}>
                  <label>Trực thuộc Rạp</label>
                  <input type="text" value={cinemaName} disabled />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Tên Phòng *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="VD: Phòng 1" className={errors.name ? 'inputErrorGlobal' : ''} />
                    {errors.name && <span className="errorTextGlobal">{errors.name}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label>Sức chứa (ghế) *</label>
                    <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} placeholder="120" className={errors.capacity ? 'inputErrorGlobal' : ''} />
                    {errors.capacity && <span className="errorTextGlobal">{errors.capacity}</span>}
                    <span className={styles.helperText}>Sẽ tự cập nhật khi bạn tạo sơ đồ ghế</span>
                  </div>
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

      {/* ===== Modal Quản lý Ghế ===== */}
      {isSeatModalOpen && selectedRoomForSeat && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.seatModal}`}>
            <div className={styles.modalHeader}>
              <h3>Sơ đồ ghế: {selectedRoomForSeat.name} ({cinemaName})</h3>
              <button className={styles.closeBtn} onClick={handleCloseSeatModal}><MdClose /></button>
            </div>

            <div className={styles.modalBody}>
              {/* Form tạo sơ đồ tự động */}
              <div className={styles.seatConfigSection}>
                <h4><MdAutoFixHigh /> Thiết kế sơ đồ ghế</h4>
                <p>
                  Sức chứa tối đa của phòng: <strong>{selectedRoomForSeat?.capacity || 0} ghế</strong>.
                  Bạn tự do quy định bố cục (số hàng × số cột) <strong>nhưng tổng ghế không được vượt sức chứa</strong>.
                  Muốn đổi sức chứa, bấm nút <strong>Sửa</strong> trên bảng phòng.
                </p>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Số hàng (1-26)</label>
                    <input type="number" min="1" max="26" value={seatGenForm.rows}
                      onChange={(e) => handleSeatGenChange('rows', e.target.value)} className={seatErrors.rows ? 'inputErrorGlobal' : ''} />
                    {seatErrors.rows && <span className="errorTextGlobal">{seatErrors.rows}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label>Số ghế / hàng (1-30)</label>
                    <input type="number" min="1" max="30" value={seatGenForm.columns}
                      onChange={(e) => handleSeatGenChange('columns', e.target.value)} className={seatErrors.columns ? 'inputErrorGlobal' : ''} />
                    {seatErrors.columns && <span className="errorTextGlobal">{seatErrors.columns}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label>Tổng ghế / Chỗ ngồi (Ghế đôi = 2 chỗ)</label>
                    <input
                      type="text"
                      disabled
                      value={(() => {
                        const cap = Number(selectedRoomForSeat?.capacity || 0);
                        const r = parseInt(seatGenForm.rows, 10) || 0;
                        const c = parseInt(seatGenForm.columns, 10) || 0;
                        if (!r || !c) return '-';
                        const cpRows = parseRows(seatGenForm.coupleRowsInput)
                          .filter((x) => x.charCodeAt(0) - 65 < r).length;
                        const perCoupleRow = Math.floor(c / 2);
                        const total = (r - cpRows) * c + cpRows * perCoupleRow;
                        const effective = (r - cpRows) * c + cpRows * perCoupleRow * 2;
                        return `${total} ghế → ${effective} / ${cap} chỗ${effective > cap ? '  ⚠️ vượt' : ''}`;
                      })()}
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Hàng VIP (cách nhau bởi dấu phẩy)</label>
                    <input type="text" placeholder="VD: D,E,F"
                      value={seatGenForm.vipRowsInput}
                      onChange={(e) => handleSeatGenChange('vipRowsInput', e.target.value)} className={seatErrors.vipRowsInput ? 'inputErrorGlobal' : ''} />
                    {seatErrors.vipRowsInput && <span className="errorTextGlobal">{seatErrors.vipRowsInput}</span>}
                  </div>
                  <div className={styles.formGroup}>
                    <label>Hàng Ghế Đôi</label>
                    <input type="text" placeholder="VD: H"
                      value={seatGenForm.coupleRowsInput}
                      onChange={(e) => handleSeatGenChange('coupleRowsInput', e.target.value)} className={seatErrors.coupleRowsInput ? 'inputErrorGlobal' : ''} />
                    {seatErrors.coupleRowsInput && <span className="errorTextGlobal">{seatErrors.coupleRowsInput}</span>}
                  </div>
                </div>
                <div className={styles.seatActions}>
                  <button
                    className={styles.generateBtn}
                    onClick={handleGenerateSeats}
                    disabled={generating}
                  >
                    <MdAutoFixHigh />
                    {generating ? 'Đang tạo...' : (seats.length > 0 ? 'Tạo lại sơ đồ' : 'Tạo sơ đồ ghế')}
                  </button>
                  {seats.length > 0 && (
                    <button className={styles.clearSeatsBtn} onClick={handleClearSeats}>
                      <MdDeleteSweep /> Xoá hết ghế
                    </button>
                  )}
                </div>
              </div>

              {/* Hướng dẫn + thống kê */}
              <div className={styles.seatGuide}>
                <div className={styles.legend}>
                  <div className={styles.legendItem}><div className={`${styles.seatBox} ${styles.seatStandard}`}></div> Ghế Thường ({normalCount})</div>
                  <div className={styles.legendItem}><div className={`${styles.seatBox} ${styles.seatVip}`}></div> Ghế VIP ({vipCount})</div>
                  <div className={styles.legendItem}><div className={`${styles.seatBox} ${styles.seatCouple}`}></div> Ghế Đôi ({coupleCount})</div>
                </div>
                <p className={styles.helperText}>
                  <MdInfoOutline style={{ verticalAlign: 'middle' }} /> Click vào từng ghế để đổi loại: <strong>Thường → VIP → Đôi → Thường</strong>. Tổng cộng: <strong>{seatCount} ghế</strong>.
                </p>
              </div>

              {/* Sơ đồ ghế */}
              <div className={styles.screenArea}><div className={styles.screen}>MÀN HÌNH</div></div>
              <div className={styles.seatGridContainer}>
                {seatLoading ? (
                  <p style={{ textAlign: 'center', color: '#aaa', padding: '30px' }}>Đang tải ghế...</p>
                ) : seats.length > 0 ? (
                  <div className={styles.seatGrid}>
                    {sortedRowKeys.map(row => (
                      <div key={row} className={styles.seatRow}>
                        <span className={styles.rowLabel}>{row}</span>
                        {seatsByRow[row]
                          .sort((a, b) => a.column_num - b.column_num)
                          .map(seat => (
                            <div
                              key={seat.id}
                              className={`${styles.seatBox} ${styles[SEAT_TYPE_CLASS[seat.type]] || styles.seatStandard}`}
                              title={`${seat.row}${seat.column_num} - ${SEAT_TYPE_LABEL[seat.type]} (click để đổi loại)`}
                              onClick={() => handleClickSeat(seat)}
                            >
                              {seat.column_num}
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: '#aaa', padding: '30px' }}>
                    Phòng này chưa có ghế. Dùng form bên trên để tạo sơ đồ ghế tự động.
                  </p>
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
