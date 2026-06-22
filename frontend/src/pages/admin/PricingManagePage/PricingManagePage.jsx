import React, { useEffect, useMemo, useState } from 'react';
import { MdAttachMoney, MdSave, MdRestore, MdInfoOutline, MdClose, MdDelete } from 'react-icons/md';
import pricingApi from '../../../api/pricingApi';
import projectionFormatApi from '../../../api/projectionFormatApi';
import { getErrorMessage } from '../../../utils/helpers';
import { notify, confirmDialog } from '../../../utils/notify';
import styles from './PricingManagePage.module.scss';

const SEAT_TYPES = [
  { key: 'normal', label: 'Ghế Thường', color: '#94a3b8' },
  { key: 'vip',    label: 'Ghế VIP',    color: '#ef4444' },
  { key: 'couple', label: 'Ghế Đôi',    color: '#ec4899' },
];

const DAY_TYPES = [
  { key: 'weekday', label: 'Ngày thường', hint: 'Thứ 2 – Thứ 6' },
  { key: 'weekend', label: 'Cuối tuần',  hint: 'Thứ 7, Chủ nhật' },
  { key: 'holiday', label: 'Lễ Tết',     hint: 'Các ngày đặc biệt' },
];

const buildEmptyMatrix = () => {
  const m = {};
  SEAT_TYPES.forEach((s) => {
    m[s.key] = {};
    DAY_TYPES.forEach((d) => { m[s.key][d.key] = 0; });
  });
  return m;
};

const formatVnd = (n) =>
  new Intl.NumberFormat('vi-VN').format(Math.round(Number(n) || 0)) + ' đ';

const PricingManagePage = () => {
  const [matrix, setMatrix] = useState(buildEmptyMatrix());
  const [original, setOriginal] = useState(buildEmptyMatrix());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State cho cấu hình định dạng phụ thu
  const [formats, setFormats] = useState([]);
  const [originalFormats, setOriginalFormats] = useState([]);

  // State cho cấu hình ngày lễ
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [loadingHolidays, setLoadingHolidays] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });
  const [addingHoliday, setAddingHoliday] = useState(false);
  const [holidayErrors, setHolidayErrors] = useState({});

  const fetchHolidays = async () => {
    setLoadingHolidays(true);
    try {
      const res = await pricingApi.adminGetHolidays();
      setHolidays(res.data || []);
    } catch (e) {
      console.error('[PricingManagePage] fetchHolidays error:', e);
      notify.error(getErrorMessage(e), 'Không tải được danh sách ngày lễ');
    } finally {
      setLoadingHolidays(false);
    }
  };

  const handleOpenHolidayModal = (e) => {
    if (e) e.stopPropagation();
    setIsHolidayModalOpen(true);
    fetchHolidays();
  };

  const handleCloseHolidayModal = () => {
    setIsHolidayModalOpen(false);
    setHolidayErrors({});
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!newHoliday.date) {
      setHolidayErrors({ date: 'Vui lòng chọn ngày lễ' });
      return;
    }
    setHolidayErrors({});
    setAddingHoliday(true);
    try {
      await pricingApi.adminSaveHoliday({
        date: newHoliday.date,
        name: newHoliday.name.trim() || 'Ngày lễ',
      });
      notify.success('Đã thêm ngày lễ mới');
      setNewHoliday({ date: '', name: '' });
      fetchHolidays();
    } catch (e) {
      console.error('[PricingManagePage] addHoliday error:', e);
      if (e.response?.status === 422 && e.response?.data?.errors) {
        const backendErrors = e.response.data.errors;
        const newErrors = {};
        Object.keys(backendErrors).forEach((key) => {
          newErrors[key] = Array.isArray(backendErrors[key]) ? backendErrors[key][0] : backendErrors[key];
        });
        setHolidayErrors(newErrors);
        notify.error('Thông tin ngày lễ chưa hợp lệ!', 'Thêm thất bại');
      } else {
        notify.error(getErrorMessage(e), 'Thêm ngày lễ thất bại');
      }
    } finally {
      setAddingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (id) => {
    const ok = await confirmDialog({
      title: 'Xóa ngày lễ?',
      message: 'Bạn có chắc muốn xóa ngày này khỏi danh sách ngày lễ? Các suất chiếu vào ngày này sẽ quay về tính giá theo Ngày thường/Cuối tuần.',
      confirmText: 'Xóa',
      danger: true,
    });
    if (!ok) return;
    try {
      await pricingApi.adminDeleteHoliday(id);
      notify.success('Đã xóa ngày lễ');
      fetchHolidays();
    } catch (e) {
      console.error('[PricingManagePage] deleteHoliday error:', e);
      notify.error(getErrorMessage(e), 'Xóa ngày lễ thất bại');
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const [pricingRes, formatsRes] = await Promise.all([
        pricingApi.adminGetAll(),
        projectionFormatApi.getAll()
      ]);

      const m = pricingRes.matrix || buildEmptyMatrix();
      // Fill missing keys nếu DB thiếu row nào (an toàn)
      SEAT_TYPES.forEach((s) => {
        if (!m[s.key]) m[s.key] = {};
        DAY_TYPES.forEach((d) => {
          if (m[s.key][d.key] == null) m[s.key][d.key] = 0;
        });
      });
      setMatrix(m);
      setOriginal(JSON.parse(JSON.stringify(m)));

      const formatsData = Array.isArray(formatsRes) ? formatsRes : (formatsRes.data || []);
      setFormats(formatsData);
      setOriginalFormats(JSON.parse(JSON.stringify(formatsData)));
    } catch (e) {
      console.error('[PricingManagePage] load error:', e);
      notify.error(getErrorMessage(e), 'Tải bảng giá thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (seatType, dayType, value) => {
    setMatrix((prev) => ({
      ...prev,
      [seatType]: { ...prev[seatType], [dayType]: value === '' ? '' : Number(value) },
    }));
  };

  const handleFormatSurchargeChange = (id, value) => {
    setFormats((prev) =>
      prev.map((f) => (f.id === id ? { ...f, surcharge: value === '' ? '' : Number(value) } : f))
    );
  };

  const isDirty = useMemo(() => {
    // Check 3x3 table
    for (const s of SEAT_TYPES) {
      for (const d of DAY_TYPES) {
        if (Number(matrix[s.key]?.[d.key] || 0) !== Number(original[s.key]?.[d.key] || 0)) {
          return true;
        }
      }
    }
    // Check formats surcharges
    if (formats.length !== originalFormats.length) return true;
    for (let i = 0; i < formats.length; i++) {
      const current = formats[i];
      const orig = originalFormats.find(f => f.id === current.id);
      if (!orig || Number(current.surcharge || 0) !== Number(orig.surcharge || 0)) {
        return true;
      }
    }
    return false;
  }, [matrix, original, formats, originalFormats]);

  const handleReset = () => {
    setMatrix(JSON.parse(JSON.stringify(original)));
    setFormats(JSON.parse(JSON.stringify(originalFormats)));
  };

  const handleSave = async () => {
    // Validate pricing: tất cả ≥ 0
    const items = [];
    for (const s of SEAT_TYPES) {
      for (const d of DAY_TYPES) {
        const price = Number(matrix[s.key]?.[d.key] || 0);
        if (price < 0 || !Number.isFinite(price)) {
          notify.warning(`Giá ${s.label} - ${d.label} không hợp lệ.`);
          return;
        }
        items.push({
          seat_type: s.key,
          day_type:  d.key,
          price,
          is_active: true,
        });
      }
    }

    // Validate surcharges: tất cả ≥ 0
    const formatItems = [];
    for (const f of formats) {
      const surcharge = Number(f.surcharge || 0);
      if (surcharge < 0 || !Number.isFinite(surcharge)) {
        notify.warning(`Phụ thu cho định dạng "${f.name}" không hợp lệ.`);
        return;
      }
      formatItems.push({
        id: f.id,
        surcharge
      });
    }

    // Cảnh báo cứng nếu giá VIP < Thường, hoặc Đôi < VIP (gợi ý logic ngược thường thấy)
    const warnings = [];
    DAY_TYPES.forEach((d) => {
      const normal = Number(matrix.normal?.[d.key] || 0);
      const vip    = Number(matrix.vip?.[d.key]    || 0);
      const couple = Number(matrix.couple?.[d.key] || 0);
      if (vip < normal) warnings.push(`${d.label}: giá VIP (${formatVnd(vip)}) đang thấp hơn Thường (${formatVnd(normal)})`);
      if (couple < vip) warnings.push(`${d.label}: giá Đôi (${formatVnd(couple)}) đang thấp hơn VIP (${formatVnd(vip)})`);
    });

    if (warnings.length > 0) {
      const ok = await confirmDialog({
        title: 'Bảng giá có dấu hiệu bất thường',
        message: warnings.join('\n') + '\n\nVẫn lưu?',
        confirmText: 'Lưu bảng giá',
        danger: true,
      });
      if (!ok) return;
    }

    setSaving(true);
    try {
      const [pricingRes, formatsRes] = await Promise.all([
        pricingApi.adminBulkUpdate(items),
        projectionFormatApi.bulkUpdateSurcharges({ formats: formatItems })
      ]);

      const m = pricingRes.matrix || buildEmptyMatrix();
      setMatrix(m);
      setOriginal(JSON.parse(JSON.stringify(m)));

      const updatedFormats = formatsRes.data || [];
      setFormats(updatedFormats);
      setOriginalFormats(JSON.parse(JSON.stringify(updatedFormats)));

      notify.success('Đã cập nhật bảng giá và phụ thu định dạng chiếu.');
    } catch (e) {
      console.error('[PricingManagePage] save error:', e);
      notify.error(getErrorMessage(e), 'Lưu bảng giá thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.pricingPage}>
      <div className={styles.header}>
        <h2><MdAttachMoney /> Bảng giá vé</h2>
        <div className={styles.actions}>
          <button
            className={styles.resetBtn}
            onClick={handleReset}
            disabled={!isDirty || saving}
            title="Hoàn tác về dữ liệu vừa tải"
          >
            <MdRestore /> Hoàn tác
          </button>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={!isDirty || saving}
          >
            <MdSave /> {saving ? 'Đang lưu...' : 'Lưu bảng giá'}
          </button>
        </div>
      </div>

      <div className={styles.intro}>
        <MdInfoOutline />
        <p>
          Bảng giá toàn hệ thống. Mỗi <strong>loại ghế × loại ngày</strong> có 1 mức giá riêng.
          Khi khách chọn ghế, hệ thống tự tra giá theo ngày chiếu (T2-T6 = Ngày thường, T7-CN = Cuối tuần, Lễ = theo cấu hình).
          Sửa ở đây áp dụng cho mọi suất chiếu, không cần nhập giá ở từng lịch chiếu nữa.
        </p>
      </div>

      {loading ? (
        <div className={styles.loading}>Đang tải bảng giá...</div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.priceTable}>
              <thead>
                <tr>
                  <th className={styles.cornerCell}>Loại ghế \ Loại ngày</th>
                  {DAY_TYPES.map((d) => (
                    <th key={d.key}>
                      <div className={styles.dayHeader}>
                        <span className={styles.dayLabel} style={{ display: 'inline-flex', alignItems: 'center' }}>
                          {d.label}
                          {d.key === 'holiday' && (
                            <span 
                              className={styles.setupHolidayLink} 
                              onClick={handleOpenHolidayModal}
                              title="Nhấp để cấu hình danh sách ngày lễ"
                            >
                              ⚙️ Cấu hình
                            </span>
                          )}
                        </span>
                        <span className={styles.dayHint}>{d.hint}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SEAT_TYPES.map((s) => (
                  <tr key={s.key}>
                    <td className={styles.seatCell}>
                      <span className={styles.seatDot} style={{ backgroundColor: s.color }} />
                      <strong>{s.label}</strong>
                    </td>
                    {DAY_TYPES.map((d) => (
                      <td key={d.key} className={styles.priceCell}>
                        <div className={styles.inputWrap}>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={matrix[s.key]?.[d.key] ?? 0}
                            onChange={(e) => handleChange(s.key, d.key, e.target.value)}
                          />
                          <span className={styles.currency}>đ</span>
                        </div>
                        <div className={styles.previewPrice}>
                          {formatVnd(matrix[s.key]?.[d.key])}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.surchargeSection}>
            <h3>Phụ thu theo định dạng chiếu</h3>
            <p className={styles.surchargeIntro}>
              Cấu hình số tiền cộng thêm vào giá vé cơ bản của các suất chiếu theo định dạng.
            </p>
            <div className={styles.surchargeGrid}>
              {formats.map((fmt) => (
                <div key={fmt.id} className={styles.surchargeCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.formatTag}>{fmt.name}</span>
                  </div>
                  <div className={styles.surchargeInputWrap}>
                    <div className={styles.inputContainer}>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={fmt.surcharge ?? 0}
                        onChange={(e) => handleFormatSurchargeChange(fmt.id, e.target.value)}
                      />
                      <span className={styles.currency}>đ</span>
                    </div>
                    <div className={styles.previewPrice}>
                      + {formatVnd(fmt.surcharge)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Modal Cấu hình Ngày Lễ */}
      {isHolidayModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseHolidayModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Cấu hình ngày Lễ Tết</h3>
              <button className={styles.closeBtn} onClick={handleCloseHolidayModal}>
                <MdClose />
              </button>
            </div>
            <div className={styles.modalBody}>
              {/* Form thêm ngày lễ mới */}
              <form onSubmit={handleAddHoliday} className={styles.addHolidayForm} noValidate>
                <div className={styles.inputGroup}>
                  <label>Chọn ngày *</label>
                  <input
                    type="date"
                    required
                    value={newHoliday.date}
                    onChange={(e) => {
                      setNewHoliday((prev) => ({ ...prev, date: e.target.value }));
                      setHolidayErrors((prev) => ({ ...prev, date: '' }));
                    }}
                    className={holidayErrors.date ? 'inputErrorGlobal' : ''}
                  />
                  {holidayErrors.date && <span className="errorTextGlobal">{holidayErrors.date}</span>}
                </div>
                <div className={styles.inputGroup}>
                  <label>Tên ngày lễ</label>
                  <input
                    type="text"
                    placeholder="Tết Dương Lịch, Quốc Khánh..."
                    value={newHoliday.name}
                    onChange={(e) => {
                      setNewHoliday((prev) => ({ ...prev, name: e.target.value }));
                      setHolidayErrors((prev) => ({ ...prev, name: '' }));
                    }}
                    className={holidayErrors.name ? 'inputErrorGlobal' : ''}
                  />
                  {holidayErrors.name && <span className="errorTextGlobal">{holidayErrors.name}</span>}
                </div>
                <button
                  type="submit"
                  disabled={addingHoliday}
                  className={styles.addHolidaySubmitBtn}
                >
                  {addingHoliday ? '...' : 'Thêm'}
                </button>
              </form>

              {/* Danh sách ngày lễ hiện tại */}
              <div>
                <h4 style={{ fontSize: '14px', color: '#334155', marginBottom: '10px', marginTop: '10px' }}>
                  Danh sách ngày lễ đang áp dụng
                </h4>
                {loadingHolidays ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px' }}>
                    Đang tải danh sách...
                  </p>
                ) : holidays.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px', fontStyle: 'italic' }}>
                    Chưa có ngày lễ nào được thiết lập.
                  </p>
                ) : (
                  <div className={styles.holidayList}>
                    {holidays.map((h) => {
                      const d = new Date(h.date);
                      const formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                      return (
                        <div key={h.id} className={styles.holidayItem}>
                          <div>
                            <strong>{formattedDate}</strong>
                            <span style={{ marginLeft: '10px', color: '#64748b' }}>({h.name || 'Ngày lễ'})</span>
                          </div>
                          <button
                            type="button"
                            className={styles.deleteHolidayBtn}
                            onClick={() => handleDeleteHoliday(h.id)}
                            title="Xóa khỏi danh sách ngày lễ"
                          >
                            <MdDelete size={18} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={handleCloseHolidayModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingManagePage;
