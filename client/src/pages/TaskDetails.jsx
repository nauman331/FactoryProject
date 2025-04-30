import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Col, Row, ListGroup } from 'react-bootstrap';
import { backendURL } from '../utils/exports';

function SingleTaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [voiceMessages, setVoiceMessages] = useState([]);
  const [voiceMessageFile, setVoiceMessageFile] = useState(null);

  // Fetch task details
  useEffect(() => {
    const fetchTaskDetails = async () => {
      const response = await fetch(`${backendURL}/tasks/${id}`);
      const data = await response.json();

      if (response.ok) {
        setTask(data.task);
        setTitle(data.task.title);
        setDescription(data.task.description);
        setStatus(data.task.status);
        setVoiceMessages(data.task.voiceMessage || []);
      } else {
        alert(data.message || 'Error fetching task details');
      }
    };
    fetchTaskDetails();
  }, [id]);

  // Update task
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    const updatedTask = { title, description, status };

    const response = await fetch(`${backendURL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Task updated successfully');
    } else {
      alert(data.message || 'Failed to update task');
    }
  };

  // Upload voice message
  const handleVoiceMessageUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('voice', voiceMessageFile);

    const response = await fetch(`${backendURL}/tasks/${id}/voice`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      setVoiceMessageFile(null);
      setVoiceMessages((prev) => [
        ...prev,
        { user: { name: 'You' }, url: data.url, createdAt: new Date().toISOString() },
      ]);
    } else {
      alert(data.message || 'Error uploading voice message');
    }
  };

  const handleFileChange = (e) => {
    setVoiceMessageFile(e.target.files[0]);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!task) return <div className="container mt-4">Loading...</div>;

  return (
    <div className="container mt-4">
      <h3>Task Details</h3>
      <Form onSubmit={handleUpdateTask}>
        <Row>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group>
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="mt-3">Update Task</Button>
      </Form>

      {/* Voice Messages */}
      <h4 className="mt-5">Voice Messages</h4>
      <div className="voice-message-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {voiceMessages.length === 0 ? (
          <div>No voice messages available</div>
        ) : (
          <ListGroup>
            {voiceMessages.map((msg, idx) => (
              <ListGroup.Item key={idx}>
                <div>
                  <strong>{msg.user.name}</strong>
                  <small className="text-muted ms-2">{formatDate(msg.createdAt)}</small>
                </div>
                <audio controls>
                  <source src={msg.url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </div>

      {/* Upload voice message */}
      <Form.Group className="mt-4">
        <Form.Label>Upload Voice Message</Form.Label>
        <Form.Control
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
        />
      </Form.Group>
      {voiceMessageFile && (
        <Button variant="primary" className="mt-3" onClick={handleVoiceMessageUpload}>
          Upload Voice Message
        </Button>
      )}

      {/* Go back button */}
      <Button variant="secondary" className="mt-4" onClick={() => navigate('/tasks')}>
        Back to Tasks
      </Button>
    </div>
  );
}

export default SingleTaskDetails;
