import { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import {
  House, People, BoxSeam, ClipboardData,
  Gear, FileEarmarkText, DoorOpen
} from 'react-bootstrap-icons';

const navItems = [
  { to: '/', label: 'Dashboard', icon: <House /> },
  { to: '/orders', label: 'Orders', icon: <BoxSeam /> },
  { to: '/inventory', label: 'Inventory', icon: <ClipboardData /> },
  { to: '/login', label: 'Logout', icon: <DoorOpen />, className: 'text-danger' },
];

function Sidebar({ showSidebar, setShowSidebar }) {
  const location = useLocation();
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className={`bg-dark text-white position-fixed h-100 shadow sidebar-transition 
        ${hovered || isMobile ? 'expanded' : 'collapsed'} 
        ${!showSidebar && isMobile ? 'd-none' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Nav className="flex-column px-2 align-items-center justify-content-center h-100">
        {navItems.map((item, index) => (
          <Nav.Link
            key={index}
            as={Link}
            to={item.to}
            onClick={() => isMobile && setShowSidebar(false)}
            className={`my-1 d-flex align-items-center rounded px-3 py-2 sidebar-link w-100 
              ${location.pathname === item.to ? 'text-warning fw-bold' : 'text-white'} 
              ${item.className || ''}`}
          >
            <span className="me-2 fs-5" title={item.label}>{item.icon}</span>
            {(hovered || isMobile) && <span>{item.label}</span>}
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
}

export default Sidebar;
