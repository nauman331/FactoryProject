// components/Navbar.jsx
import { Navbar as BootstrapNavbar, Container, Button, Nav } from 'react-bootstrap';
import { List, DoorOpen } from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isMember = user?.role === "member";

  return (
    <BootstrapNavbar bg="dark" variant="dark" className="shadow-sm fixed-top">
      <Container fluid className="d-flex justify-content-between align-items-center">
        {/* Sidebar Toggle Button for Admins */}
        {isAdmin && (
          <Button
            variant="outline-warning"
            className="d-md-none me-2"
            onClick={toggleSidebar}
          >
            <List size={24} />
          </Button>
        )}

        {/* Brand Title */}
        <BootstrapNavbar.Brand className="text-warning fw-bold">
          {user && <>🧤 Factory {isMember ? "User" : "Admin"} Panel</>}
        </BootstrapNavbar.Brand>

        {/* Logout Button for Members */}
        {isMember && (
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
