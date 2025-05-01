import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

function AppLayout() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Parse user from localStorage if it exists
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar toggleSidebar={() => setShowSidebar(!showSidebar)} />
      <div className="d-flex flex-grow-1">
        {
          user && (user.role === "admin" || user.role === "superadmin") &&
          <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
        }
        <main
          className="flex-grow-1 p-3"
          style={{
            marginLeft: isMobile ? 0 : '60px',
            marginTop: '60px',
          }}
        >
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default AppLayout;
