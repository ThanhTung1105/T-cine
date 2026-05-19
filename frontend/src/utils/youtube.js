/**
 * Tiện ích xử lý link YouTube
 *
 * Vấn đề: YouTube CHẶN nhúng các URL dạng "watch?v=..." hoặc "youtu.be/..." trong iframe
 * (header X-Frame-Options: SAMEORIGIN). Chỉ định dạng "/embed/{VIDEO_ID}" mới hoạt động.
 *
 * Helper này nhận mọi định dạng link YouTube (admin có thể dán bất kỳ format nào)
 * và trả về URL embed chuẩn dùng được trong iframe.
 *
 * Hỗ trợ:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://www.youtube.com/watch?v=VIDEO_ID&t=30s
 *   - https://youtu.be/VIDEO_ID
 *   - https://youtu.be/VIDEO_ID?t=30
 *   - https://m.youtube.com/watch?v=VIDEO_ID
 *   - https://www.youtube.com/shorts/VIDEO_ID
 *   - https://www.youtube.com/embed/VIDEO_ID  (giữ nguyên)
 *   - Chuỗi 11 ký tự thuần (VIDEO_ID)
 */

/**
 * Trích VIDEO_ID từ bất kỳ định dạng link YouTube nào.
 * @param {string} url
 * @returns {string|null} VIDEO_ID hoặc null nếu không parse được
 */
export const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const raw = url.trim();
  if (!raw) return null;

  // Pattern khớp với phần lớn định dạng YouTube phổ biến
  // Group 1 luôn là VIDEO_ID
  const patterns = [
    /(?:youtube\.com\/(?:embed|v|shorts|watch\?v=|.*[?&]v=))([\w-]{11})/i,
    /youtu\.be\/([\w-]{11})/i,
  ];

  for (const re of patterns) {
    const m = raw.match(re);
    if (m && m[1]) return m[1];
  }

  // Trường hợp admin dán thẳng video ID (11 ký tự)
  if (/^[\w-]{11}$/.test(raw)) return raw;

  return null;
};

/**
 * Chuyển bất kỳ link YouTube nào sang URL embed dùng được trong iframe.
 * @param {string} url
 * @returns {string|null} URL embed hoặc null nếu không hợp lệ
 */
export const toYouTubeEmbedUrl = (url) => {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
};

/**
 * Trả về URL ảnh thumbnail YouTube từ link/ID.
 * @param {string} url
 * @param {'default'|'hq'|'maxres'} [quality='hq']
 * @returns {string|null}
 */
export const toYouTubeThumbnail = (url, quality = 'hq') => {
  const id = extractYouTubeId(url);
  if (!id) return null;
  const q = quality === 'maxres' ? 'maxresdefault' : quality === 'default' ? 'default' : 'hqdefault';
  return `https://img.youtube.com/vi/${id}/${q}.jpg`;
};

export default toYouTubeEmbedUrl;
