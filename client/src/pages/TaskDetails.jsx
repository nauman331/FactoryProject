import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form, Button, Col, Row, ListGroup, Modal, Carousel
} from 'react-bootstrap';
import RecordRTC from 'recordrtc';
import { backendURL } from '../utils/exports';

function SingleTaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');

  const [voiceMessages, setVoiceMessages] = useState([]);
  const [images, setImages] = useState([]);

  // Recorder states
  let recorder;
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingUrl, setRecordingUrl] = useState(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      const response = await fetch(`${backendURL}/tasks/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        const task = data.task;
        setTask(task);
        setTitle(task.title);
        setDescription(task.description);
        setStatus(task.status);
        setVoiceMessages(task.voiceMessage || []);
        setImages(task.images || []);
      } else {
        alert(data.message || 'Error fetching task details');
      }
    };
    fetchTaskDetails();
  }, [id]);

  const handleUpdateTask = async () => {
    const updatedTask = { title, description, status };

    const response = await fetch(`${backendURL}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(updatedTask),
    });

    const data = await response.json();

    if (response.ok) {
      alert('Task updated successfully');
      setShowEditModal(false);
      setTask({ ...task, title, description, status });
    } else {
      alert(data.message || 'Failed to update task');
    }
  };

  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        recorder = RecordRTC(stream, { type: 'audio' });
        recorder.startRecording();
        setIsRecording(true);
      })
      .catch(console.error);
  };

  const stopRecording = () => {
    recorder.stopRecording(() => {
      const audioBlob = recorder.getBlob();
      setRecordedBlob(audioBlob);
      setRecordingUrl(URL.createObjectURL(audioBlob));
      setIsRecording(false);
    });
  };

  const uploadVoiceMessage = async () => {
    if (!recordedBlob) return;

    const formData = new FormData();
    formData.append('voice', recordedBlob);

    const response = await fetch(`${backendURL}/tasks/${id}/voice`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      setVoiceMessages(prev => [
        ...prev,
        { user: { name: 'You' }, url: data.url, createdAt: new Date().toISOString() }
      ]);
      setRecordedBlob(null);
      setRecordingUrl(null);
    } else {
      alert(data.message || 'Failed to upload voice message');
    }
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
      <Row className="align-items-center mb-4">
        <Col><h3>{task.title}</h3></Col>
        <Col xs="auto">
          <Button variant="outline-primary" onClick={() => setShowEditModal(true)}>
            Edit Task
          </Button>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <h5>Status</h5>
          <p>{task.status}</p>
        </Col>
        <Col md={6}>
          <h5>Description</h5>
          <p>{task.description}</p>
        </Col>
      </Row>

      {images.length > 0 && (
        <>
          <h4 className="mt-4">Images</h4>
          <Carousel className="mb-4">
            {images.map((img, idx) => (
              <Carousel.Item key={idx}>
                <img
                  className="d-block w-100"
                  src={img}
                  alt={`Slide ${idx + 1}`}
                  style={{ maxHeight: '400px', objectFit: 'contain' }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </>
      )}

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
                <audio controls className="mt-2 w-100">
                  <source src={msg.url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </div>

      {/* Voice Recorder */}
      <h5 className="mt-5">Record & Send Voice Message</h5>
      <div className="border p-3 rounded bg-light">
        {!isRecording ? (
          <Button variant="primary" onClick={startRecording}>Start Recording</Button>
        ) : (
          <Button variant="danger" onClick={stopRecording}>Stop Recording</Button>
        )}

        {recordingUrl && (
          <>
            <audio controls className="mt-3 w-100" src={recordingUrl}></audio>
            <div className="mt-2">
              <Button variant="success" onClick={uploadVoiceMessage}>Send Voice</Button>{' '}
              <Button variant="secondary" onClick={() => {
                setRecordedBlob(null);
                setRecordingUrl(null);
              }}>
                Record Again
              </Button>
            </div>
          </>
        )}
      </div>

      <Button variant="secondary" className="mt-4" onClick={() => navigate('/tasks')}>
        Back to Tasks
      </Button>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
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

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" onClick={handleUpdateTask}>Save Changes</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default SingleTaskDetails;
