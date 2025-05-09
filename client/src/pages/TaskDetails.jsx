import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button, Col, Row, Modal, Form, Tab, Tabs, Card, ListGroup, Carousel, Badge, Alert, OverlayTrigger, Tooltip
} from 'react-bootstrap';
import RecordRTC from 'recordrtc';
import { backendURL } from '../utils/exports';
import { FaMicrophone, FaEdit, FaDownload, FaHistory } from 'react-icons/fa';
import { Trash } from 'react-bootstrap-icons';


function SingleTaskDetails() {
  const { id } = useParams();

  const [task, setTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [history, setHistory] = useState([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState('');

  const [textMessage, setTextMessage] = useState('');

  const [voiceMessages, setVoiceMessages] = useState([]);
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingUrl, setRecordingUrl] = useState(null);


  const [dragActive, setDragActive] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const recorderRef = useRef(null);

  useEffect(() => {
    const objectUrls = [];

    const generatedUrls = images.map((img, idx) => {
      if (!img) return null;

      if (img instanceof File || img instanceof Blob) {
        try {
          const url = URL.createObjectURL(img);
          objectUrls.push(url);
          return url;
        } catch (err) {
          console.error(`Failed to create object URL for image ${idx}:`, err);
          return null;
        }
      }

      if (typeof img === 'string') {
        return img;
      }

      console.warn(`Unexpected data type for image ${idx}:`, img);
      return null;
    }).filter(Boolean); // Remove nulls

    setPreviewUrls(generatedUrls);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);



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
        setHistory(task.history || [])
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

  const handleUpdateTask = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('status', status);
    formData.append('color', color);
    formData.append('size', size);
    formData.append('quantity', quantity);

    // Separate new uploads from existing URLs
    const newImageFiles = images.filter((img) => img instanceof File);
    const existingImageUrls = images.filter((img) => typeof img === 'string');

    const newDocumentFiles = documents.filter((doc) => doc instanceof File);
    const existingDocumentUrls = documents.filter((doc) => typeof doc === 'string');

    newImageFiles.forEach((imgFile) => {
      formData.append('files', imgFile);
    });

    newDocumentFiles.forEach((docFile) => {
      formData.append('files', docFile);
    });

    // Send existing URLs as form fields
    formData.append('existingImages', JSON.stringify(existingImageUrls));
    formData.append('existingDocuments', JSON.stringify(existingDocumentUrls));

    try {
      const response = await fetch(`${backendURL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert('Task updated successfully');
        setShowEditModal(false);
        setTask((prev) => ({
          ...prev,
          title,
          description,
          status,
          color,
          size,
          quantity,
        }));
      } else {
        alert(data.message || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('An error occurred while updating the task.');
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



  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!textMessage.trim()) return;

    try {
      setLoading(true);
      const res = await fetch(`${backendURL}/tasks/${id}/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // adjust token if stored differently
        },
        body: JSON.stringify({ message: textMessage }),
      });

      const data = await res.json();
      if (res.ok) {
        setTask(data.task);
        setTextMessage('');
      } else {
        alert(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const handleFileDownload = async (fileUrl, filename = 'downloaded-file') => {
    try {
      const response = await fetch(fileUrl, { mode: 'cors' });
      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file');
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
    const pdfFiles = droppedFiles.filter(file => file.type === 'application/pdf');
    setImages(prev => [...prev, ...imageFiles]);
    setDocuments(prev => [...prev, ...pdfFiles]);
  };

  const handleFileChange = e => {
    const selectedFiles = Array.from(e.target.files);
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    setImages(prev => [...prev, ...imageFiles]);
    setDocuments(prev => [...prev, ...pdfFiles]);
  };

  const removeImage = index => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const removePdf = index => {
    const newPdfs = [...documents];
    newPdfs.splice(index, 1);
    setDocuments(newPdfs);
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  const renderTimeline = () => {
    if (history.length === 0) {
      return <Alert variant="info">No history available</Alert>;
    }

    return (
      <ListGroup variant="flush">
        {task?.history && task.history.length > 0 ? (
          <Card className="p-3 mt-4">
            <h5 className="fw-bold">History / Timeline</h5>
            <ListGroup variant="flush">
              {task.history.map((historyItem, idx) => (
                <ListGroup.Item key={idx} className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted">
                      <small>{formatDate(historyItem.updatedAt)}</small>
                    </div>
                    <ul>
                      <li><strong>Title:</strong> {historyItem.previousState.title}</li>
                      <li><strong>Description:</strong> {historyItem.previousState.description}</li>
                      <li><strong>Color:</strong> {historyItem.previousState.color}</li>
                      <li><strong>Size:</strong> {historyItem.previousState.size}</li>
                      <li><strong>Quantity:</strong> {historyItem.previousState.quantity}</li>
                      <li><strong>Status:</strong> {historyItem.previousState.status}</li>
                    </ul>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        ) : (
          <Card className="p-3 mt-4">
            <p>No history available.</p>
          </Card>
        )}
      </ListGroup>
    );
  };

  if (!task) return <div className="container mt-5 text-center">Loading task details...</div>;

  return (
    <div className="container my-5">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="fw-bold d-flex align-items-center gap-3 flex-wrap">{task.title} <h5 className='m-0 p-0'><Badge bg="success">{task.status}</Badge></h5>
          </h2>
        </Col>
        <Col xs="auto">
          {
            isAdmin ?
              <Button variant="outline-success" onClick={() => setShowEditModal(true)}>
                <FaEdit /> Edit
              </Button>
              :
              <Form className='d-flex align-items-center justify-content-center gap-3'>
                <Form.Group>
                  <Form.Control
                    as="select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}>
                    <option value="">Select status</option>
                    <option value="pending">Pending</option>
                    <option value="mockup-development">Mockup Development</option>
                    <option value="pattern-development">Pattern Development</option>
                    <option value="material-sourcing">Material Sourcing</option>
                    <option value="printing">Printing</option>
                    <option value="embossing">Embossing</option>
                    <option value="dye-making">Dye-Making</option>
                    <option value="rough-sample">Rough Sample</option>
                    <option value="cutting">Cutting</option>
                    <option value="stitching">Stitching</option>
                    <option value="completed">Completed</option>
                  </Form.Control>
                </Form.Group>
                <Button variant="success" onClick={handleUpdateTask}>
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
              {images.map((src, idx) => (
                <Carousel.Item key={idx}>
                  <img
                    src={src}
                    alt={`Uploaded Image ${idx}`}
                    className="d-block w-100"
                    style={{ maxHeight: '400px', objectFit: 'contain' }}
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
          <Tabs defaultActiveKey="details" className="mb-3 text-success">
            <Tab eventKey="details" title="Details">
              <Card className="p-3 mb-3">
                <h5 className="fw-bold">Description</h5>
                <p>{description}</p>
                <p><strong>Color:</strong> {color}</p>
                <p><strong>Size:</strong> {size}</p>
                <p><strong>Quantity:</strong> {quantity}</p>
                <p><strong>Category:</strong> {task?.category?.categoryname}</p>
                <p><strong>Job Client:</strong> {task.job.clientname}</p>
                <p><strong>Job ID:</strong> {task.job.JobId}</p>
              </Card>
            </Tab>

            <Tab eventKey="voice" title="Chat">
              <Row>
                <Col md={6}>
                  <Card className="p-3 mb-3">
                    <Card.Header>Voice Chat</Card.Header>
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
                        <Button variant="success" onClick={startRecording}>
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
                </Col>

                <Col md={6}>
                  <Card className="mt-4 mt-md-0">
                    <Card.Header>Text Chat</Card.Header>
                    <Card.Body>
                      <ListGroup variant="flush">
                        {task?.textMessages?.map((msg, idx) => (
                          <ListGroup.Item key={idx}>
                            <strong>{msg.user?.name || 'User'}: </strong>
                            {msg.message}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>

                      <Form onSubmit={handleSendMessage} className="mt-3 d-flex">
                        <Form.Control
                          type="text"
                          placeholder="Enter your message..."
                          value={textMessage}
                          onChange={(e) => setTextMessage(e.target.value)}
                          disabled={loading}
                        />
                        <Button type="submit" variant='success' disabled={loading} className="ms-2">
                          Send
                        </Button>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>


            <Tab eventKey="history" title={<><FaHistory /> Timeline</>}>
              <Card className="p-3 mb-3">
                <h5 className="fw-bold">Task History</h5>
                {renderTimeline()}
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
                        <Button
                          variant="outline-success"
                          onClick={() => handleFileDownload(doc, `document-${idx + 1}`)}
                        >
                          <FaDownload /> Download
                        </Button>

                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <Alert variant="warning">No documents available</Alert>
                )}

                <h5>Images</h5>
                {images.length > 0 ? (
                  <ListGroup className="mb-4">
                    {images.map((src, idx) => (
                      <ListGroup.Item key={idx}>
                        <div className="position-relative">
                          <img
                            src={src}
                            alt={`Uploaded Image ${idx}`}
                            className="d-block w-100"
                            style={{ maxHeight: '100px', width: "100px", objectFit: 'contain' }}
                            onError={handleImageError}
                          />
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="position-absolute top-0 end-0 m-2"
                            onClick={() => handleFileDownload(src, `image-${idx + 1}.jpg`)}
                          >
                            <FaDownload /> Download
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                ) : (
                  <Card className="text-center mb-4">
                    <Card.Body>No Images</Card.Body>
                  </Card>
                )}

              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>

      {/* Edit Product Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} fullscreen scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <div className="row g-4">
              {/* Title */}
              <div className="col-md-4 col-12">
                <Form.Group>
                  <Form.Label className="fw-semibold">Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter product title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Form.Group>
              </div>

              {/* Status */}
              <div className="col-md-4 col-12">
                <Form.Group>
                  <Form.Label className="fw-semibold">Status</Form.Label>
                  <Form.Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="">Select status</option>
                    <option value="pending">Pending</option>
                    <option value="mockup-designing">Mockup Designing</option>
                    <option value="pattern-development">Pattern Development</option>
                    <option value="material-sourcing">Material Sourcing</option>
                    <option value="printing">Printing</option>
                    <option value="embossing">Embossing</option>
                    <option value="dye-making">Dye-Making</option>
                    <option value="rough-sample">Rough Sample</option>
                    <option value="cutting">Cutting</option>
                    <option value="stitching">Stitching</option>
                    <option value="completed">Completed</option>
                  </Form.Select>
                </Form.Group>
              </div>

              {/* Color */}
              <div className="col-md-4 col-12">
                <Form.Group>
                  <Form.Label className="fw-semibold">Color</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter product color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </Form.Group>
              </div>

              {/* Size */}
              <div className="col-md-6 col-12">
                <Form.Group>
                  <Form.Label className="fw-semibold">Size</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter product size"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                  />
                </Form.Group>
              </div>

              {/* Quantity */}
              <div className="col-md-6 col-12">
                <Form.Group>
                  <Form.Label className="fw-semibold">Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </Form.Group>
              </div>
              {/* Description */}
              <div className="col-md-6 col-12">
                <Form.Group>
                  <Form.Label className="fw-semibold">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Enter product description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>
              </div>
              {/* Images and pdfs */}
              <Form.Group className="col-md-6 col-12">
                <Form.Label>Upload Images & PDFs</Form.Label>
                <div
                  className={`p-4 text-center border border-2 rounded ${dragActive ? 'border-success bg-light' : 'border-secondary'}`}
                  onDragOver={e => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                >
                  <p className="mb-2">Drag and drop images or PDFs here</p>
                  <Form.Control
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    onChange={handleFileChange}
                  />
                </div>

                {previewUrls.length > 0 && (
                  <Row className="mt-3 g-3">
                    {previewUrls.map((img, index) => (
                      <Col xs={6} sm={4} md={3} key={index}>
                        <div className="position-relative">
                          <img
                            src={img}
                            alt="preview"
                            className="img-thumbnail rounded"
                            style={{ height: '150px', objectFit: 'cover' }}
                          />
                          <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
                            <Button
                              size="sm"
                              variant="danger"
                              className="position-absolute top-0 end-0 m-1"
                              onClick={() => removeImage(index)}
                            >
                              <Trash size={14} />
                            </Button>
                          </OverlayTrigger>
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}

                {documents.length > 0 && (
                  <Row className="mt-3">
                    {documents.map((pdf, index) => (
                      <Col md={6} key={index}>
                        <Card className="d-flex flex-row align-items-center justify-content-between p-2 mb-2 bg-light">
                          <span className="text-muted text-truncate">{pdf.name}</span>
                          <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
                            <Button size="sm" variant="outline-danger" onClick={() => removePdf(index)}>
                              <Trash size={14} />
                            </Button>
                          </OverlayTrigger>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Form.Group>
            </div>
          </Form>
        </Modal.Body>

        <Modal.Footer className="bg-light d-flex justify-content-between">
          <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="success" onClick={handleUpdateTask}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

export default SingleTaskDetails;
