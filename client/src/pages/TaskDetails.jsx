import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button, Col, Row, Modal, Form, Tab, Tabs, Card, ListGroup, Carousel, Badge, Alert
} from 'react-bootstrap';
import RecordRTC from 'recordrtc';
import { backendURL } from '../utils/exports';
import { FaMicrophone, FaTrash, FaEdit, FaDownload } from 'react-icons/fa';

function SingleTaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState('');

  const [voiceMessages, setVoiceMessages] = useState([]);
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingUrl, setRecordingUrl] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const recorderRef = useRef(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      const response = await fetch(`${backendURL}/tasks/${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await response.json();
      if (response.ok) {
        const task = data.task;
        setTask(task);
        setTitle(task.title);
        setDescription(task.description);
        setStatus(task.status);
        setColor(task.color);
        setSize(task.size);
        setQuantity(task.quantity);
        setVoiceMessages(task.voiceMessage || []);
        setImages(task.images || []);
        setDocuments(task.documents || []);
      } else {
        alert(data.message || 'Error fetching task details');
      }
    };
    fetchTaskDetails();
  }, [id]);

  const handleUpdateTask = async () => {
    const updatedTask = { title, description, status, color, size, quantity };
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
      setTask({ ...task, title, description, status, color, size, quantity });
    } else {
      alert(data.message || 'Failed to update task');
    }
  };

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const recorder = RecordRTC(stream, { type: 'audio' });
      recorder.startRecording();
      recorderRef.current = recorder;
      setIsRecording(true);
    }).catch(console.error);
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (!recorder) {
      console.error("Recorder is undefined");
      return;
    }

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
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: formData
    });

    const data = await response.json();
    if (response.ok) {
      setVoiceMessages(prev => [...prev, {
        user: { name: 'You' }, url: data.url, createdAt: new Date().toISOString()
      }]);
      setRecordedBlob(null);
      setRecordingUrl(null);
    } else {
      alert(data.message || 'Failed to upload voice message');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';  // Hide the broken image in carousel
  };

  if (!task) return <div className="container mt-5 text-center">Loading task details...</div>;

  return (
    <div className="container my-5">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="fw-bold">{task.title}</h2>
          <Badge bg="info" className="me-2">{task.status}</Badge>
        </Col>
        <Col xs="auto">
          {
            isAdmin ?
              <Button variant="outline-primary" onClick={() => setShowEditModal(true)}>
                <FaEdit /> Edit
              </Button>
              :
              <Form className='d-flex align-items-center justify-content-center gap-3'>
                <Form.Group>
                  <Form.Control
                    as="select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </Form.Control>
                </Form.Group>
                <Button variant="primary" onClick={handleUpdateTask}>
                  Save Changes
                </Button>
              </Form>
          }
        </Col>
      </Row>

      <Row>
        <Col md={5}>
          {images.length > 0 ? (
            <Carousel className="mb-4">
              {images.map((img, idx) => (
                <Carousel.Item key={idx}>
                  <img
                    className="d-block w-100"
                    src={img}
                    alt={`Slide ${idx + 1}`}
                    style={{ maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }}
                    onError={handleImageError}  // Error handling
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <Card className="text-center mb-4">
              <Card.Body>No Images</Card.Body>
            </Card>
          )}
        </Col>

        <Col md={7}>
          <Tabs defaultActiveKey="details" className="mb-3">
            <Tab eventKey="details" title="Details">
              <Card className="p-3 mb-3">
                <h5 className="fw-bold">Description</h5>
                <p>{description}</p>
                <p><strong>Color:</strong> {color}</p>
                <p><strong>Size:</strong> {size}</p>
                <p><strong>Quantity:</strong> {quantity}</p>
                <p><strong>Job Client:</strong> {task.job.clientname}</p>
                <p><strong>Job ID:</strong> {task.job.JobId}</p>
              </Card>
            </Tab>

            <Tab eventKey="voice" title="Voice Chat">
              <Card className="p-3 mb-3">
                {voiceMessages.length === 0 ? (
                  <p>No voice messages</p>
                ) : (
                  <ListGroup variant="flush">
                    {voiceMessages.map((msg, idx) => (
                      <ListGroup.Item key={idx} className="d-flex flex-column mb-2 rounded shadow-sm">
                        <div className="d-flex justify-content-between">
                          <strong>{msg.user.name}</strong>
                          <small className="text-muted">{formatDate(msg.createdAt)}</small>
                        </div>
                        <audio controls className="mt-2 w-100">
                          <source src={msg.url} type="audio/mpeg" />
                        </audio>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}

                <div className="mt-4 border-top pt-3">
                  {!isRecording ? (
                    <Button variant="primary" onClick={startRecording}>
                      <FaMicrophone /> Start Recording
                    </Button>
                  ) : (
                    <Button variant="danger" onClick={stopRecording}>Stop Recording</Button>
                  )}

                  {recordingUrl && (
                    <div className="mt-3">
                      <audio controls className="w-100" src={recordingUrl}></audio>
                      <div className="mt-2 d-flex gap-2">
                        <Button variant="success" onClick={uploadVoiceMessage}>Send</Button>
                        <Button variant="secondary" onClick={() => {
                          setRecordedBlob(null);
                          setRecordingUrl(null);
                        }}>Re-record</Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </Tab>

            <Tab eventKey="more" title="More Info">
              <Card className="p-3">
                <p><strong>Task ID:</strong> {task._id}</p>
                <p><strong>Created At:</strong> {formatDate(task.createdAt)}</p>
                <p><strong>Last Updated:</strong> {formatDate(task.updatedAt)}</p>

                <h5>Documents</h5>
                {documents.length > 0 ? (
                  <ListGroup variant="flush">
                    {documents.map((doc, idx) => (
                      <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
                        <a href={doc} target="_blank" download>Document {idx + 1}</a>
                        <Button variant="outline-primary" href={doc} download><FaDownload /> Download</Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <Alert variant="warning">No documents available</Alert>
                )}

                <h5>Images</h5>
                {images.length > 0 ? (
                  <ListGroup variant="flush">
                    {images.map((img, idx) => (
                      <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
                        <img src={img} alt={`Image ${idx + 1}`} style={{ width: '100px', height: 'auto' }} />
                        <Button variant="outline-primary" href={img} download><FaDownload /> Download</Button>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <Alert variant="warning">No images available</Alert>
                )}
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>

      <div className="mt-4 text-end">
        <Button variant="secondary" onClick={() => navigate('/tasks')}>Back to Task List</Button>
      </div>

      {/* Edit Task Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Color</Form.Label>
              <Form.Control
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Size</Form.Label>
              <Form.Control
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </Form.Group>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateTask}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default SingleTaskDetails;
