import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopBar from '../TopBar/TopBar';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import './Layout.less';

/**
 * AppLayout Component
 *
 * Main layout component that wraps all pages with TopBar, Navbar and Footer
 */
const AppLayout: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="app-layout">
      {!isLoginPage && (
        <>
          <TopBar />
          <Navbar />
        </>
      )}
      <main className="app-content">
        <Outlet />
      </main>
      {!isLoginPage && <Footer />}
    </div>
  );
};

export default AppLayout;
