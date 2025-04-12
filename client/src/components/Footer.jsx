// components/Footer.jsx
import { Container } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="bg-dark text-white py-2 mt-auto shadow-sm">
      <Container className="text-center">
        <small>© {new Date().getFullYear()} Factory Admin Panel | Powered by Nauman</small>
      </Container>
    </footer>
  );
}

export default Footer;
