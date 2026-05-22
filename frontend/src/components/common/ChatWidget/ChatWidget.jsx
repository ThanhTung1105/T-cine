import React, { useState, useEffect, useRef } from 'react';
import { TbMessageChatbot } from 'react-icons/tb';
import { IoSend, IoClose } from 'react-icons/io5';
import { BsTrash3, BsRobot } from 'react-icons/bs';
import { FiMinus } from 'react-icons/fi';
import chatbotApi from '../../../api/chatbotApi';
import { notify } from '../../../utils/notify';
import styles from './ChatWidget.module.scss';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'model',
      message: 'Xin chào! Em là **Trợ lý ảo T-cine AI Assistant** 🍿🎬\n\nEm có thể giúp gì cho Anh/Chị hôm nay? Anh/Chị có thể hỏi em về:\n- Các bộ phim đang chiếu hoặc sắp chiếu tại rạp.\n- Địa chỉ các cụm rạp T-cine.\n- Thông tin các chương trình khuyến mãi hiện có.\n- Giá vé và bảng giá bắp nước.\n- Hướng dẫn các bước đặt vé trực tuyến nhanh chóng.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Danh sách các câu hỏi gợi ý nhanh
  const quickSuggestions = [
    { text: '🎬 Phim nào đang hot?', query: 'Rạp mình đang chiếu phim gì thế?' },
    { text: '📍 Địa chỉ cụm rạp?', query: 'T-cine có những cụm rạp nào ở đâu?' },
    { text: '🎁 Khuyến mãi hôm nay?', query: 'Hôm nay rạp có khuyến mãi hay ưu đãi gì hot không?' },
    { text: '🍿 Giá bắp nước?', query: 'Cho tôi xem danh sách và giá các combo bắp nước.' },
  ];

  // Cuộn tự động xuống cuối mỗi khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  // Bộ parse Markdown thủ công và an toàn bằng JS
  const parseMarkdown = (text) => {
    if (!text) return '';
    let html = text;

    // Tránh XSS cơ bản bằng cách encode HTML tags gốc
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Parse Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Parse Link: [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="' + styles.chatLink + '">$1</a>');

    // Parse Bullet Points: - text hoặc * text
    const lines = html.split('\n');
    let inList = false;
    const processedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        if (!inList) {
          inList = true;
          return `<ul class="${styles.chatUl}"><li>${content}</li>`;
        }
        return `<li>${content}</li>`;
      } else {
        if (inList) {
          inList = false;
          return `</ul>${line}<br />`;
        }
        return line + '<br />';
      }
    });

    if (inList) {
      processedLines.push('</ul>');
    }

    return processedLines.join('');
  };

  // Xử lý gửi tin nhắn
  const handleSendMessage = async (textToSend) => {
    const trimmedText = textToSend ? textToSend.trim() : inputValue.trim();
    if (!trimmedText || isLoading) return;

    // Thêm tin nhắn của User vào danh sách hiển thị
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      message: trimmedText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Chuẩn bị mảng history để gửi kèm lên API (lược bỏ id và timestamp để đúng format)
      // Loại trừ tin nhắn welcome mặc định để prompt gửi lên ngắn gọn và tối ưu nhất
      const apiHistory = messages
        .filter((msg) => msg.id !== 'welcome')
        .map((msg) => ({
          role: msg.role,
          message: msg.message,
        }));

      // Gọi API gửi tin nhắn đến Backend
      const response = await chatbotApi.sendMessage({
        message: trimmedText,
        history: apiHistory,
      });

      // Nhận phản hồi và thêm tin nhắn AI vào danh sách hiển thị
      const botMsg = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        message: response.reply || (response.data && response.data.reply) || 'Xin lỗi, em không thể xử lý câu trả lời ngay lúc này.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error('Lỗi khi chat với AI:', error);
      
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        message: 'Oops! Em gặp một chút sự cố khi kết nối với máy chủ AI. Anh/Chị vui lòng thử lại sau giây lát nhé! 🍿',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset cuộc trò chuyện (Làm trống state về mặc định)
  const handleResetChat = () => {
    if (messages.length <= 1) return;

    const confirmReset = window.confirm('Bạn có muốn xóa cuộc trò chuyện này và bắt đầu cuộc hội thoại mới không?');
    if (confirmReset) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          message: 'Chào mừng Anh/Chị trở lại với **T-cine AI Assistant**! 🎬🍿\n\nEm đã làm mới phiên làm việc. Hãy cho em biết Anh/Chị muốn tìm hiểu bộ phim nào đang hot hoặc thông tin khuyến mãi gì nhé!',
          timestamp: new Date(),
        },
      ]);
      notify.info('Đã làm mới cuộc hội thoại!');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={styles.chatbotContainer}>
      {/* 1. NÚT NỔI BONG BÓNG CHAT (FLOATING BUBBLE) */}
      <button
        className={`${styles.chatBubble} ${isOpen ? styles.chatBubbleActive : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Trò chuyện với T-cine AI"
      >
        {isOpen ? <IoClose size={26} /> : <TbMessageChatbot size={28} className={styles.chatbotIconAnim} />}
        {!isOpen && <span className={styles.glowDot}></span>}
      </button>

      {/* 2. CỬA SỔ TRÒ CHUYỆN (CHAT WINDOW) */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.aiProfile}>
              <div className={styles.avatarWrapper}>
                <BsRobot size={20} className={styles.avatarIcon} />
                <span className={styles.onlineBadge}></span>
              </div>
              <div className={styles.aiNameInfo}>
                <h4>T-cine AI Assistant</h4>
                <span>Trợ lý ảo thông minh</span>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.actionBtn}
                onClick={handleResetChat}
                title="Làm mới cuộc trò chuyện"
                disabled={messages.length <= 1}
              >
                <BsTrash3 size={15} />
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => setIsOpen(false)}
                title="Thu nhỏ"
              >
                <FiMinus size={17} />
              </button>
            </div>
          </div>

          {/* Area Hiển thị Tin nhắn */}
          <div className={styles.chatBody}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageWrapper} ${
                  msg.role === 'user' ? styles.userWrapper : styles.aiWrapper
                }`}
              >
                {msg.role === 'model' && (
                  <div className={styles.msgAvatar}>
                    <BsRobot size={14} />
                  </div>
                )}
                <div
                  className={`${styles.messageBubble} ${
                    msg.role === 'user' ? styles.userBubble : styles.aiBubble
                  }`}
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.message) }}
                />
              </div>
            ))}

            {/* Skeleton Loading khi AI đang gõ */}
            {isLoading && (
              <div className={`${styles.messageWrapper} ${styles.aiWrapper}`}>
                <div className={styles.msgAvatar}>
                  <BsRobot size={14} />
                </div>
                <div className={`${styles.messageBubble} ${styles.aiBubble} ${styles.typingBubble}`}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer - Ô Nhập & Gợi ý nhanh */}
          <div className={styles.chatFooter}>
            {/* Chips gợi ý nhanh */}
            {messages.length === 1 && (
              <div className={styles.suggestionsWrapper}>
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className={styles.suggestionChip}
                    onClick={() => handleSendMessage(suggestion.query)}
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form */}
            <div className={styles.inputForm}>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi T-cine AI về phim, rạp, ưu đãi..."
                rows={1}
                maxLength={1000}
                disabled={isLoading}
              />
              <button
                className={styles.sendButton}
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                title="Gửi tin nhắn"
              >
                <IoSend size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
