import { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  House, People, BoxSeam, ClipboardData,
  DoorOpen
} from 'react-bootstrap-icons';

const navItems = [
  { to: '/', label: 'Dashboard', icon: <House /> },
  { to: '/inventory', label: 'Jobs', icon: <ClipboardData /> },
  { to: '/orders', label: 'Tasks', icon: <BoxSeam /> },
  { to: '/users', label: 'Users', icon: <People /> },
];

function Sidebar({ showSidebar, setShowSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
              ${location.pathname === item.to ? 'text-warning fw-bold' : 'text-white'}`}
          >
            <span className="me-2 fs-5" title={item.label}>{item.icon}</span>
            {(hovered || isMobile) && <span>{item.label}</span>}
          </Nav.Link>
        ))}

        {/* Logout Button */}
        <Nav.Link
          onClick={handleLogout}
          className="my-1 d-flex align-items-center rounded px-3 py-2 sidebar-link w-100 text-danger"
          style={{ cursor: 'pointer' }}
        >
          <span className="me-2 fs-5" title="Logout"><DoorOpen /></span>
          {(hovered || isMobile) && <span>Logout</span>}
        </Nav.Link>
      </Nav>
    </div>
  );
}

export default Sidebar;
