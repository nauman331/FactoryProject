import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const CreateTask = () => {
  const [form, setForm] = useState({
    jobId: '',
    assignedTo: '',
    status: 'pending',
    description: '',
    clientName: '',
    clientContact: '',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in form) {
      formData.append(key, form[key]);
    }
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      setLoading(true);
      setMessage('');

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage('Task created successfully!');
      setForm({
        jobId: '',
        assignedTo: '',
        status: 'pending',
        description: '',
        clientName: '',
        clientContact: '',
      });
      setFiles([]);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="card shadow rounded-4 p-4 border-0">
            <h2 className="text-center mb-4 fw-bold text-success">Create Task</h2>

            {message && (
              <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`} role="alert">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Job ID</label>
                  <input
                    type="text"
                    className="form-control"
                    name="jobId"
                    value={form.jobId}
                    onChange={handleChange}
                    placeholder="Enter Job ID"
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Assigned To (User ID)</label>
                  <input
                    type="text"
                    className="form-control"
                    name="assignedTo"
                    value={form.assignedTo}
                    onChange={handleChange}
                    placeholder="Enter User ID"
                    required
                  />
                </div>

                <div className="col-md-12 mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter task description"
                    required
                  ></textarea>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Client Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="clientName"
                    value={form.clientName}
                    onChange={handleChange}
                    placeholder="Enter client name"
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Client Contact</label>
                  <input
                    type="text"
                    className="form-control"
                    name="clientContact"
                    value={form.clientContact}
                    onChange={handleChange}
                    placeholder="Enter client contact"
                    required
                  />
                </div>

                <div className="col-md-12 mb-3">
                  <label className="form-label fw-semibold">Upload Files</label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    onChange={handleFileChange}
                  />
                  <small className="text-muted">You can upload images, PDFs, or audio files</small>
                </div>
              </div>

              <div className="d-grid">
                <button type="submit" className="btn btn-success btn-lg" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;
