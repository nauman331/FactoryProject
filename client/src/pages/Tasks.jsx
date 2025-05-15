import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Badge } from 'react-bootstrap';
import { backendURL } from '../utils/exports';

const roleStatusMap = {
  manager: [
    'pending',
    'mockup-designing',
    'pattern-development',
    'material-sourcing',
    'printing',
    'embossing',
    'dye-making',
    'rough-sample',
    'cutting',
    'stitching',
  ],
  designer: ['mockup-designing'],
  'pattern-developer': ['pattern-development'],
  'cutting-person': ['cutting'],
  stitcher: ['stitching'],
};

const TasksList = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const userRole = user?.role;
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendURL}/tasks/job/${id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      const allTasks = Array.isArray(data) ? data : data.tasks || [];

      const allowedStatuses = roleStatusMap[userRole] || [];
      const filtered = allTasks.filter(task =>
        isAdmin || allowedStatuses.includes(task.status?.toLowerCase())
      );

      setTasks(filtered);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    } finally {
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
        return 'secondary';
      default:
        return 'info';
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
      <h2 className="text-success mb-4">All Products</h2>
      <Row className="g-4">
        {tasks.map((task) => (
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
              {task.images?.length > 0 && (
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
                <Card.Title className="text-success">{task.title}</Card.Title>
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

        {isAdmin && (
          <Col xs={12} sm={6} md={4} lg={3}>
            <Card
              className="d-flex align-items-center justify-content-center h-100 add-task-card shadow-sm"
              style={{
                cursor: 'pointer',
                border: '2px dashed #01A653',
                background: '#f8f9fa',
                borderRadius: '10px',
                transition: 'background 0.3s',
              }}
              onClick={handleAddNewTask}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e6ea')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#f8f9fa')}
            >
              <div className="text-center">
                <h1 className="text-success">+</h1>
                <p className="text-muted">Add New Product</p>
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default TasksList;
