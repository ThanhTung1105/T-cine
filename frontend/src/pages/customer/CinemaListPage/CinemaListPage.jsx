import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdHome, MdChevronRight, MdLocationOn } from 'react-icons/md';
import cinemaApi from '../../../api/cinemaApi';

const CinemaListPage = () => {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const res = await cinemaApi.getAll();
        setCinemas(res.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchCinemas();
  }, []);

  return (
    <div style={{ minHeight: '60vh', padding: '30px 0', background: '#0d0d1a' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>
        <div style={{ marginBottom: 16 }}>
          <Link to="/" style={{ color: '#aaa', textDecoration: 'none', fontSize: 14 }}>
            <MdHome style={{ verticalAlign: 'middle' }} /> Trang chủ
          </Link>
          <MdChevronRight style={{ verticalAlign: 'middle', color: '#555', margin: '0 4px' }} />
          <span style={{ color: '#fff', fontSize: 14 }}>Hệ thống rạp</span>
        </div>

        <h1 style={{ color: '#fff', marginBottom: 24 }}>Hệ Thống Rạp T-CINE</h1>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#aaa', padding: 40 }}>Đang tải...</p>
        ) : cinemas.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#aaa', padding: 40 }}>Chưa có rạp nào. Vui lòng thêm rạp từ trang Quản trị.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cinemas.map(cinema => (
              <div key={cinema.id} style={{ background: '#1a1a2e', borderRadius: 12, padding: 20, border: '1px solid #2a2a4a', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <MdLocationOn style={{ color: '#e94560', fontSize: 28, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h3 style={{ color: '#fff', margin: '0 0 6px', fontSize: 17 }}>{cinema.name}</h3>
                  <p style={{ color: '#aaa', margin: '0 0 4px', fontSize: 14 }}>{cinema.address}</p>
                  {cinema.city && <p style={{ color: '#888', margin: 0, fontSize: 13 }}>🏙️ {cinema.city}</p>}
                  <p style={{ color: '#888', margin: '4px 0 0', fontSize: 13 }}>
                    📽️ {cinema.rooms_count ?? cinema.total_screens ?? '?'} phòng chiếu
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CinemaListPage;
