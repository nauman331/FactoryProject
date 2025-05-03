import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trash } from 'react-bootstrap-icons';
import { backendURL } from "../utils/exports";

function CreateTask() {
  const location = useLocation();
  const navigate = useNavigate()
  const JobId = location?.state?.JobId || '';

  const [form, setForm] = useState({
    title: '',
    description: '',
    color: '',
    size: '',
    quantity: '',
    status: '',
  });

  const [images, setImages] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState(null);

  const handleInputChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDrop = e => {
    e.preventDefault();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
    const pdfFiles = droppedFiles.filter(file => file.type === 'application/pdf');
    setImages(prev => [...prev, ...imageFiles]);
    setPdfs(prev => [...prev, ...pdfFiles]);
  };

  const handleFileChange = e => {
    const selectedFiles = Array.from(e.target.files);
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    setImages(prev => [...prev, ...imageFiles]);
    setPdfs(prev => [...prev, ...pdfFiles]);
  };

  const removeImage = index => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const removePdf = index => {
    const newPdfs = [...pdfs];
    newPdfs.splice(index, 1);
    setPdfs(newPdfs);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('jobId', JobId);
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    images.forEach(img => formData.append('files', img));
    pdfs.forEach(pdf => formData.append('files', pdf));

    try {
      const response = await fetch(`${backendURL}/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: 'Task created successfully!' });
        setForm({
          title: '',
          description: '',
          color: '',
          size: '',
          quantity: '',
          status: '',
        });
        setImages([]);
        setPdfs([]);
        navigate(`/tasks/${result?.task?.job}`)
      } else {
        setMessage({ type: 'danger', text: result.message });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Something went wrong. Please try again.' });
    }
  };

  return (
    <Container className="py-5">
      <Card className="shadow-lg border-0 p-4">
        <h3 className="text-center mb-4 text-primary">Add New Product</h3>

        {message && (
          <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
            {message.text}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control
                  name="title"
                  placeholder="Enter Product Title"
                  value={form.title}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" value={form.status} onChange={handleInputChange} required>
                  <option value="">Select status</option>
                  <option value="pending">Pending</option>

     '', 
    'pattern-development', 
    'material-sourcing',
    'printing',
    'embossing',
    'dye-making', 
    'rough-sample',
    'cutting',
    'stitching',
                  <option value="mockup-development">Mockup Development</option>
                  <option value="completed">Completed</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Enter Product Details"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Color</Form.Label>
                <Form.Control
                  name="color"
                  placeholder="e.g. Red"
                  value={form.color}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Size</Form.Label>
                <Form.Control
                  name="size"
                  placeholder="e.g. Medium"
                  value={form.size}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  name="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={form.quantity}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label>Upload Images & PDFs</Form.Label>
            <div
              className={`p-4 text-center border border-2 rounded ${dragActive ? 'border-primary bg-light' : 'border-secondary'}`}
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

            {images.length > 0 && (
              <Row className="mt-3 g-3">
                {images.map((img, index) => (
                  <Col xs={6} sm={4} md={3} key={index}>
                    <div className="position-relative">
                      <img
                        src={URL.createObjectURL(img)}
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

            {pdfs.length > 0 && (
              <Row className="mt-3">
                {pdfs.map((pdf, index) => (
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

          <div className="d-grid">
            <Button type="submit" size="lg" variant="primary">
              Add Product
            </Button>
          </div>
        </Form>
      </Card>
    </Container>
  );
}

export default CreateTask;
