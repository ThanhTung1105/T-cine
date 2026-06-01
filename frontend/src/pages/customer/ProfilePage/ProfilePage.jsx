import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MdHome,
  MdChevronRight,
  MdSave,
  MdEmail,
  MdPhone,
  MdPerson,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdConfirmationNumber,
  MdCheckCircle,
  MdAccessTime,
} from 'react-icons/md';
import authApi from '../../../api/authApi';
import bookingApi from '../../../api/bookingApi';
import useAuthStore from '../../../store/useAuthStore';
import { notify, translateError } from '../../../utils/notify';
import styles from './ProfilePage.module.scss';

const TABS = [
  { id: 'profile', label: 'Thông tin cá nhân', icon: <MdPerson /> },
  { id: 'password', label: 'Đổi mật khẩu', icon: <MdLock /> },
];

const ProfilePage = () => {
  const { user, setUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState('profile');

  // ===== Profile form =====
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // ===== Password form =====
  const [pwData, setPwData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [savingPw, setSavingPw] = useState(false);
  const [pwErrors, setPwErrors] = useState({});

  // ===== Stats (số đơn, vé, …) =====
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0 });

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await bookingApi.getMyBookings({ per_page: 100 });
        const list = res.data || res?.data?.data || [];
        const arr = Array.isArray(list) ? list : [];
        setStats({
          total: arr.length,
          paid: arr.filter((b) => b.status === 'paid').length,
          pending: arr.filter((b) => b.status === 'pending').length,
        });
      } catch {
        // bỏ qua, hiển thị 0
      }
    };
    fetchStats();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handlePwChange = (e) => {
    setPwData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPwErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Họ và tên không được để trống';
    }
    if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Số điện thoại phải từ 10 đến 11 số';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const res = await authApi.updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim() || null
      });
      setUser(res.data || res.user || { ...user, ...formData });
      notify.success('Cập nhật thông tin cá nhân thành công!', 'Thành công');
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        const msg = err.response?.data?.message || 'Cập nhật thất bại!';
        notify.error(translateError(msg), 'Cập nhật thất bại');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const newPwErrors = {};
    if (!pwData.current_password) {
      newPwErrors.current_password = 'Vui lòng nhập mật khẩu hiện tại';
    } else if (pwData.current_password.length < 6) {
      newPwErrors.current_password = 'Mật khẩu hiện tại phải từ 6 ký tự trở lên';
    }

    if (!pwData.password) {
      newPwErrors.password = 'Vui lòng nhập mật khẩu mới';
    } else if (pwData.password.length < 6) {
      newPwErrors.password = 'Mật khẩu mới phải từ 6 ký tự trở lên';
    }

    if (!pwData.password_confirmation) {
      newPwErrors.password_confirmation = 'Vui lòng xác nhận mật khẩu mới';
    } else if (pwData.password !== pwData.password_confirmation) {
      newPwErrors.password_confirmation = 'Mật khẩu xác nhận không khớp';
    }

    if (Object.keys(newPwErrors).length > 0) {
      setPwErrors(newPwErrors);
      return;
    }

    setSavingPw(true);
    try {
      await authApi.changePassword(pwData);
      notify.success('Đổi mật khẩu tài khoản thành công!', 'Thành công');
      setPwData({ current_password: '', password: '', password_confirmation: '' });
      setPwErrors({});
    } catch (err) {
      if (err.response?.data?.errors) {
        setPwErrors(err.response.data.errors);
      } else {
        const msg = err.response?.data?.message || 'Đổi mật khẩu thất bại!';
        notify.error(translateError(msg), 'Đổi mật khẩu thất bại');
      }
    } finally {
      setSavingPw(false);
    }
  };

  const memberSince = useMemo(() => {
    if (!user?.created_at) return null;
    return new Date(user.created_at).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
    });
  }, [user]);

  if (!user) return null;

  return (
    <div className={styles.profilePage}>
      <div className={styles.breadcrumbWrapper}>
        <div className={styles.container}>
          <ul className={styles.breadcrumb}>
            <li>
              <Link to="/">
                <MdHome className={styles.homeIcon} /> Trang chủ
              </Link>
            </li>
            <li>
              <MdChevronRight className={styles.separator} />
            </li>
            <li className={styles.active}>Thành viên</li>
          </ul>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.layout}>
          {/* ===== SIDEBAR ===== */}
          <aside className={styles.sidebar}>
            <div className={styles.userCard}>
              <div className={styles.avatarLg}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h2 className={styles.userName}>{user.name}</h2>
              <p className={styles.userEmail}>{user.email}</p>
              {memberSince && (
                <p className={styles.memberSince}>Thành viên từ {memberSince}</p>
              )}
            </div>

            <div className={styles.statsCard}>
              <h3 className={styles.statsTitle}>Hoạt động của bạn</h3>
              <div className={styles.statsList}>
                <div className={styles.statItem}>
                  <MdConfirmationNumber className={styles.statIcon} />
                  <div>
                    <p className={styles.statValue}>{stats.total}</p>
                    <p className={styles.statLabel}>Đơn đã đặt</p>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <MdCheckCircle className={`${styles.statIcon} ${styles.success}`} />
                  <div>
                    <p className={styles.statValue}>{stats.paid}</p>
                    <p className={styles.statLabel}>Đã thanh toán</p>
                  </div>
                </div>
                <div className={styles.statItem}>
                  <MdAccessTime className={`${styles.statIcon} ${styles.warn}`} />
                  <div>
                    <p className={styles.statValue}>{stats.pending}</p>
                    <p className={styles.statLabel}>Chờ thanh toán</p>
                  </div>
                </div>
              </div>
              <Link to="/lich-su-dat-ve" className={styles.viewHistoryBtn}>
                Xem lịch sử đặt vé →
              </Link>
            </div>
          </aside>

          {/* ===== CONTENT ===== */}
          <main className={styles.content}>
            <div className={styles.tabs}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  className={`${styles.tab} ${activeTab === t.id ? styles.active : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {activeTab === 'profile' ? (
              <form className={styles.card} onSubmit={handleSaveProfile} noValidate>
                <div className={styles.cardHeader}>
                  <h3>Thông tin cá nhân</h3>
                  <p>Cập nhật họ tên và số điện thoại để chúng tôi liên hệ khi cần.</p>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label htmlFor="email">Email</label>
                    <div className={styles.inputWrap}>
                      <MdEmail className={styles.inputIcon} />
                      <input
                        id="email"
                        type="email"
                        value={user.email || ''}
                        disabled
                        readOnly
                      />
                    </div>
                    <p className={styles.hint}>Email không thể chỉnh sửa.</p>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="name">Họ và tên *</label>
                    <div className={styles.inputWrap}>
                      <MdPerson className={styles.inputIcon} />
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Nhập họ và tên đầy đủ"
                        className={errors.name ? 'inputErrorGlobal' : ''}
                      />
                    </div>
                    {errors.name && <span className="errorTextGlobal">{errors.name}</span>}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="phone">Số điện thoại</label>
                    <div className={styles.inputWrap}>
                      <MdPhone className={styles.inputIcon} />
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Ví dụ: 0901234567"
                        className={errors.phone ? 'inputErrorGlobal' : ''}
                      />
                    </div>
                    {errors.phone && <span className="errorTextGlobal">{errors.phone}</span>}
                  </div>
                </div>

                <div className={styles.actions}>
                  <button type="submit" className={styles.primaryBtn} disabled={saving}>
                    <MdSave /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            ) : (
              <form className={styles.card} onSubmit={handleChangePassword} noValidate>
                <div className={styles.cardHeader}>
                  <h3>Đổi mật khẩu</h3>
                  <p>
                    Để bảo vệ tài khoản, hãy sử dụng mật khẩu mạnh và không chia sẻ với người khác.
                  </p>
                </div>

                <div className={styles.formGrid}>
                  <PasswordField
                    label="Mật khẩu hiện tại *"
                    name="current_password"
                    value={pwData.current_password}
                    onChange={handlePwChange}
                    show={showPw.current}
                    onToggle={() => setShowPw((s) => ({ ...s, current: !s.current }))}
                    error={pwErrors.current_password}
                  />
                  <PasswordField
                    label="Mật khẩu mới *"
                    name="password"
                    value={pwData.password}
                    onChange={handlePwChange}
                    show={showPw.new}
                    onToggle={() => setShowPw((s) => ({ ...s, new: !s.new }))}
                    error={pwErrors.password}
                    hint="Tối thiểu 6 ký tự."
                  />
                  <PasswordField
                    label="Xác nhận mật khẩu mới *"
                    name="password_confirmation"
                    value={pwData.password_confirmation}
                    onChange={handlePwChange}
                    show={showPw.confirm}
                    onToggle={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))}
                    error={pwErrors.password_confirmation}
                  />
                </div>

                <div className={styles.actions}>
                  <button type="submit" className={styles.primaryBtn} disabled={savingPw}>
                    <MdLock /> {savingPw ? 'Đang lưu...' : 'Đổi mật khẩu'}
                  </button>
                </div>
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

// ----- Sub-component -----
const PasswordField = ({ label, name, value, onChange, show, onToggle, hint, error }) => (
  <div className={styles.field}>
    <label htmlFor={name}>{label}</label>
    <div className={styles.inputWrap}>
      <MdLock className={styles.inputIcon} />
      <input
        id={name}
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder="••••••••"
        className={error ? 'inputErrorGlobal' : ''}
      />
      <button type="button" className={styles.toggleBtn} onClick={onToggle} tabIndex={-1}>
        {show ? <MdVisibilityOff /> : <MdVisibility />}
      </button>
    </div>
    {error && <span className="errorTextGlobal">{error}</span>}
    {hint && !error && <p className={styles.hint}>{hint}</p>}
  </div>
);

export default ProfilePage;
