import React, { useEffect, useMemo, useState } from 'react';
import { MdAttachMoney, MdSave, MdRestore, MdInfoOutline } from 'react-icons/md';
import pricingApi from '../../../api/pricingApi';
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

  const load = async () => {
    setLoading(true);
    try {
      const res = await pricingApi.adminGetAll();
      const m = res.matrix || buildEmptyMatrix();
      // Fill missing keys nếu DB thiếu row nào (an toàn)
      SEAT_TYPES.forEach((s) => {
        if (!m[s.key]) m[s.key] = {};
        DAY_TYPES.forEach((d) => {
          if (m[s.key][d.key] == null) m[s.key][d.key] = 0;
        });
      });
      setMatrix(m);
      setOriginal(JSON.parse(JSON.stringify(m)));
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

  const isDirty = useMemo(() => {
    for (const s of SEAT_TYPES) {
      for (const d of DAY_TYPES) {
        if (Number(matrix[s.key]?.[d.key] || 0) !== Number(original[s.key]?.[d.key] || 0)) {
          return true;
        }
      }
    }
    return false;
  }, [matrix, original]);

  const handleReset = () => {
    setMatrix(JSON.parse(JSON.stringify(original)));
  };

  const handleSave = async () => {
    // Validate: tất cả ≥ 0
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
      const res = await pricingApi.adminBulkUpdate(items);
      const m = res.matrix || buildEmptyMatrix();
      setMatrix(m);
      setOriginal(JSON.parse(JSON.stringify(m)));
      notify.success(res.message || 'Đã cập nhật bảng giá vé');
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
        <div className={styles.tableWrapper}>
          <table className={styles.priceTable}>
            <thead>
              <tr>
                <th className={styles.cornerCell}>Loại ghế \ Loại ngày</th>
                {DAY_TYPES.map((d) => (
                  <th key={d.key}>
                    <div className={styles.dayHeader}>
                      <span className={styles.dayLabel}>{d.label}</span>
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
      )}
    </div>
  );
};

export default PricingManagePage;
