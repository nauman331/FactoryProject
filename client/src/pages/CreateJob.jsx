import React, { useState } from 'react';
import { backendURL } from '../utils/exports';
import { useNavigate } from 'react-router-dom';

const CreateJob = () => {
  const [clientname, setClientname] = useState('');
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState(''); // success | danger
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!clientname.trim()) {
      setVariant('danger');
      setMessage('Client name is required');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${backendURL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ clientname }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Job creation failed.');

      setVariant('success');
      setMessage('Job created successfully!');
      setTimeout(() => navigate(`/tasks/${data?.job?._id}`), 100); // Redirect after 1.2s
    } catch (err) {
      setVariant('danger');
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="mb-4 text-center fw-bold text-primary">Create New Job</h2>

          {message && (
            <div className={`alert alert-${variant}`} role="alert">
              {message}
            </div>
          )}

          <form onSubmit={handleCreateJob} className="border p-4 rounded shadow-sm bg-white">
            <div className="mb-3">
              <label htmlFor="clientname" className="form-label fw-semibold">Client Name</label>
              <input
                type="text"
                id="clientname"
                className="form-control"
                value={clientname}
                onChange={(e) => setClientname(e.target.value)}
                placeholder="Enter client name"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Creating...
                </>
              ) : (
                'Create Job'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;
