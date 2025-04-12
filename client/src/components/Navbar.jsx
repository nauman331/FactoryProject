// components/Navbar.jsx
import { Navbar as BootstrapNavbar, Container, Button } from 'react-bootstrap';
import { List } from 'react-bootstrap-icons';

function Navbar({ toggleSidebar }) {
  return (
    <BootstrapNavbar bg="dark" variant="dark" className="shadow-sm fixed-top">
      <Container fluid>
        <Button variant="outline-warning" className="d-md-none" onClick={toggleSidebar}>
          <List size={24} />
        </Button>
        <BootstrapNavbar.Brand className="ms-2 text-warning fw-bold">
        🧤 Factory Admin Panel
        </BootstrapNavbar.Brand>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
