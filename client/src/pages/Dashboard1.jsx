import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Container } from 'react-bootstrap';
import {
  BoxSeam,
  PersonWorkspace,
  Archive,
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
import { backendURL } from '../utils/exports';

function Dashboard1() {
  const [dashboardData, setDashboardData] = useState({
    completedJobsCount: 0,
    pendingJobsCount: 0,
    totalUsersCount: 0,
    jobsPerDay: [],
    workersPerDay: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${backendURL}/dashboard`);
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else {
          console.error('Error fetching dashboard data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const { completedJobsCount, pendingJobsCount, totalUsersCount, jobsPerDay, workersPerDay } = dashboardData;

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4 fw-bold text-success">Dashboard</h2>

      <Row xs={1} md={2} xl={3} className="g-4 mb-4">
        <Col>
          <Card bg="primary" text="white" className="shadow-sm border-0" style={{ borderRadius: '1rem', minHeight: '130px' }}>
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Title className="fw-bold fs-6">Pending Jobs</Card.Title>
                <Card.Text className="fs-3">{pendingJobsCount.toLocaleString()}</Card.Text>
              </div>
              <div className="opacity-75"><Archive size={40} /></div>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card bg="success" text="white" className="shadow-sm border-0" style={{ borderRadius: '1rem', minHeight: '130px' }}>
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Title className="fw-bold fs-6">Completed Jobs</Card.Title>
                <Card.Text className="fs-3">{completedJobsCount.toLocaleString()}</Card.Text>
              </div>
              <div className="opacity-75"><BoxSeam size={40} /></div>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card bg="info" text="white" className="shadow-sm border-0" style={{ borderRadius: '1rem', minHeight: '130px' }}>
            <Card.Body className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Title className="fw-bold fs-6">Total Users</Card.Title>
                <Card.Text className="fs-3">{totalUsersCount.toLocaleString()}</Card.Text>
              </div>
              <div className="opacity-75"><PersonWorkspace size={40} /></div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={12} lg={6}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '1rem' }}>
            <Card.Body>
              <h5 className="fw-bold mb-3 text-success">Jobs Per Day</h5>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={jobsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="totalOrders" stroke="#0d6efd" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col md={12} lg={6}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '1rem' }}>
            <Card.Body>
              <h5 className="fw-bold mb-3 text-success">Workers Per Day</h5>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workersPerDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalWorkers" fill="#198754" barSize={30} />
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
