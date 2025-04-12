import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

function AppLayout({ children }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
        <Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
        <main
          className="flex-grow-1 p-3"
          style={{
            marginLeft: isMobile ? 0 : '60px',
            marginRight: 0,
            marginTop: "60px"
          }}
        >
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default AppLayout;
