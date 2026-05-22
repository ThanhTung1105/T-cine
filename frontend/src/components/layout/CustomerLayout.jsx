import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import ChatWidget from '../common/ChatWidget/ChatWidget';

const CustomerLayout = () => {
  return (
    <div className="customer-layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default CustomerLayout;

