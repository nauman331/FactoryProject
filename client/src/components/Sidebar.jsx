import { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  House, People, ClipboardData,
  DoorOpen,
  Boxes
} from 'react-bootstrap-icons';

function Sidebar({ showSidebar, setShowSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Parse user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // Dynamically build the nav items based on the user role
  const navItems = [
    { to: '/', label: 'Jobs', icon: <ClipboardData /> },
  ];

  if (user && (user.role === "admin" || user.role === "superadmin")) {
    navItems.unshift({
      to: '/dashboard',
      label: 'Dashboard',
      icon: <House />
    });
  }
  if (user && user.role === "superadmin") {
    navItems.push({
      to: '/categories',
      label: 'Categories',
      icon: <Boxes />
    });
  }
  if (user && user.role === "superadmin") {
    navItems.push({
      to: '/users',
      label: 'Users',
      icon: <People />
    });
  }


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
      className={`bg-light text-white position-fixed h-100 shadow sidebar-transition 
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
              ${location.pathname === item.to ? 'text-success fw-bold' : 'text-black'}`}
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
