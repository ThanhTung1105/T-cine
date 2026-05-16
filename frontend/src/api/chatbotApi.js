import axiosClient from './axiosClient';

const chatbotApi = {
  // Gửi tin nhắn đến chatbot
  sendMessage: (data) => axiosClient.post('/chatbot/message', data),

  // Lấy lịch sử chat
  getHistory: () => axiosClient.get('/chatbot/history'),

  // Xóa lịch sử chat
  clearHistory: () => axiosClient.delete('/chatbot/history'),
};

export default chatbotApi;
