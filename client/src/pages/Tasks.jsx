import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Badge } from 'react-bootstrap';
import { backendURL } from '../utils/exports';

const TasksList = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendURL}/tasks/job/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('Fetched tasks data:', data); // Helpful debug
      setTasks(Array.isArray(data) ? data : data.tasks || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]); // Ensure tasks is always an array
      setLoading(false);
    }
  };

  const handleTaskClick = (taskId) => {
    navigate(`/task/${taskId}`);
  };

  const handleAddNewTask = () => {
    navigate('/createtask', { state: { JobId: id } });
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in progress':
        return 'warning';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="text-center mb-4">All Products</h2>
      <Row className="g-4">
        {tasks?.map((task) => (
          <Col key={task._id} xs={12} sm={6} md={4} lg={3}>
            <Card
              onClick={() => handleTaskClick(task._id)}
              className="task-card h-100 shadow-sm border-0"
              style={{
                cursor: 'pointer',
                transition: 'transform 0.3s, box-shadow 0.3s',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {task.images && task.images.length > 0 && (
                <Card.Img
                  variant="top"
                  src={task.images[0]}
                  alt="Product Image"
                  style={{
                    height: '180px',
                    objectFit: 'cover',
                    borderTopLeftRadius: '10px',
                    borderTopRightRadius: '10px',
                  }}
                />
              )}
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-primary">{task.title}</Card.Title>
                <Card.Text className="text-muted" style={{ fontSize: '0.9rem' }}>
                  {task.description?.substring(0, 80)}...
                </Card.Text>
                <div className="mt-auto">
                  <Badge bg={getStatusVariant(task.status)}>{task.status || 'Pending'}</Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}

        {isAdmin &&
          <Col xs={12} sm={6} md={4} lg={3}>
            <Card
              className="d-flex align-items-center justify-content-center h-100 add-task-card shadow-sm"
              style={{
                cursor: 'pointer',
                border: '2px dashed #0d6efd',
                background: '#f8f9fa',
                borderRadius: '10px',
                transition: 'background 0.3s',
              }}
              onClick={handleAddNewTask}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e6ea')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#f8f9fa')}
            >
              <div className="text-center">
                <h1 className="text-primary">+</h1>
                <p className="text-muted">Add New Product</p>
              </div>
            </Card>
          </Col>
        }
      </Row>
    </Container>
  );
};

export default TasksList;
