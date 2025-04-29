import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { backendURL } from '../utils/exports';

const TasksList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendURL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTasks(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setLoading(false);
    }
  };

  const handleTaskClick = (taskId) => {
    navigate(`/task/${taskId}`);
  };

  const handleAddNewTask = () => {
    navigate('/create-task');
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
        {tasks.map((task) => (
          <Col key={task._id} xs={12} sm={6} md={4} lg={3}>
            <Card
              onClick={() => handleTaskClick(task._id)}
              className="task-card h-100 shadow-sm"
              style={{ cursor: 'pointer', transition: 'transform 0.3s' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Card.Body>
                <Card.Title className="text-primary">{task.title}</Card.Title>
                <Card.Text className="text-muted" style={{ fontSize: '0.9rem' }}>
                  {task.description?.substring(0, 80)}...
                </Card.Text>
              </Card.Body>
              <Card.Footer className="bg-white border-0">
                <small className="text-muted">Status: {task.status || 'Pending'}</small>
              </Card.Footer>
            </Card>
          </Col>
        ))}

        {/* Add New Task Box */}
        <Col xs={12} sm={6} md={4} lg={3}>
          <Card
            className="d-flex align-items-center justify-content-center h-100 add-task-card shadow-sm"
            style={{
              cursor: 'pointer',
              border: '2px dashed #0d6efd',
              background: '#f8f9fa',
              transition: 'background 0.3s'
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
      </Row>
    </Container>
  );
};

export default TasksList;
