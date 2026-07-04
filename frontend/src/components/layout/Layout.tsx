import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar
        activeRoute={location.pathname}
        onNavigate={(href) => navigate(href)}
        user={{ name: 'Admin User', role: 'admin' }}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="AI Real Estate Platform"
          breadcrumbs={[]}
          isDark={isDark}
          onThemeToggle={() => setIsDark(!isDark)}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
