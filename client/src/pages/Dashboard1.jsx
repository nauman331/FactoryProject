import React from 'react';
import { Card, Row, Col, Container } from 'react-bootstrap';
import {
  BoxSeam,
  PersonWorkspace,
  Archive,
  Truck,
} from 'react-bootstrap-icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

function Dashboard1() {
  const cards = [
    { title: 'Total Orders', value: 152, color: 'primary', icon: <BoxSeam size={40} /> },
    { title: 'Active Workers', value: 28, color: 'success', icon: <PersonWorkspace size={40} /> },
    { title: 'Inventory Items', value: 320, color: 'info', icon: <Archive size={40} /> },
    { title: 'Pending Deliveries', value: 7, color: 'danger', icon: <Truck size={40} /> },
  ];

  const data = [
    { name: 'Mon', orders: 120, workers: 22 },
    { name: 'Tue', orders: 132, workers: 25 },
    { name: 'Wed', orders: 101, workers: 20 },
    { name: 'Thu', orders: 156, workers: 28 },
    { name: 'Fri', orders: 142, workers: 26 },
    { name: 'Sat', orders: 162, workers: 30 },
    { name: 'Sun', orders: 151, workers: 29 },
  ];

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4 fw-bold text-dark">📊 Dashboard Overview</h2>

      <Row xs={1} md={2} xl={4} className="g-4 mb-4">
        {cards.map((card, index) => (
          <Col key={index}>
            <Card
              bg={card.color}
              text="white"
              className="shadow-sm border-0"
              style={{ borderRadius: '1rem', minHeight: '130px' }}
            >
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Title className="fw-bold fs-6">{card.title}</Card.Title>
                  <Card.Text className="fs-3">{card.value.toLocaleString()}</Card.Text>
                </div>
                <div className="opacity-75">{card.icon}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4">
        <Col md={12} lg={6}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '1rem' }}>
            <Card.Body>
              <h5 className="fw-bold mb-3">📈 Weekly Orders & Workers Trend (Line)</h5>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="orders" stroke="#0d6efd" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="workers" stroke="#198754" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col md={12} lg={6}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '1rem' }}>
            <Card.Body>
              <h5 className="fw-bold mb-3">📊 Orders & Workers Overview (Bar)</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#0d6efd" barSize={30} />
                  <Bar dataKey="workers" fill="#198754" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard1;
