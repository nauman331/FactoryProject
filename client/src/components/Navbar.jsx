// components/Navbar.jsx
import { Navbar as BootstrapNavbar, Container, Button } from 'react-bootstrap';
import { List, DoorOpen } from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo2 from '../assets/logo2.jpeg';

function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <BootstrapNavbar bg="light" variant="light" className="shadow-sm fixed-top">
      <Container fluid className="d-flex justify-content-between align-items-center">
        {/* Sidebar Toggle Button for Admins */}
        {isAdmin && (
          <Button
            variant="outline-success"
            className="d-md-none me-2"
            onClick={toggleSidebar}
          >
            <List size={24} />
          </Button>
        )}

        {/* Logo Only */}
        <BootstrapNavbar.Brand className="mb-0">
          <img
            src={logo2}
            alt="Factory Logo"
            style={{ height: '40px', objectFit: 'contain' }}
          />
        </BootstrapNavbar.Brand>

        {/* Logout Button for Members */}
        {!isAdmin && (
          <Button
            variant="outline-danger"
            onClick={handleLogout}
            className="d-flex align-items-center"
          >
            <DoorOpen className="me-1" />
            Logout
          </Button>
        )}
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
