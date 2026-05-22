import axiosClient from './axiosClient';

const chatbotApi = {
  // Gửi tin nhắn đến chatbot (gồm { message, history })
  sendMessage: (data) => axiosClient.post('/chatbot/message', data),
};

export default chatbotApi;

