import React, { useState, useEffect } from 'react';
import { backendURL } from '../utils/exports';
import { useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';

const CreateJob = () => {
  const [clientname, setClientname] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [creatingJob, setCreatingJob] = useState(false); // separate loading state for job creation
  const navigate = useNavigate();

  // Fetch categories when the component mounts
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch(`${backendURL}/category`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      setVariant('danger');
      setMessage('Failed to fetch categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch client suggestions based on clientname input
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!clientname.trim()) return setSuggestions([]);

      try {
        const res = await fetch(
          `${backendURL}/jobs/suggestions?search=${clientname}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        const data = await res.json();
        setSuggestions(data.clients || []);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300); // debounce to avoid flooding API
    return () => clearTimeout(debounce);
  }, [clientname]);

  const handleSelectSuggestion = (suggestion) => {
    setClientname(suggestion);
    setSuggestions([]);
  };

  // Handle job creation
  const handleCreateJob = async (e) => {
    e.preventDefault();

    // Validate input
    if (!clientname.trim()) {
      setVariant('danger');
      setMessage('Client name is required');
      return;
    }
    if (!category) {
      setVariant('danger');
      setMessage('Category is required');
      return;
    }

    try {
      setCreatingJob(true); // Set loading state for job creation
      const res = await fetch(`${backendURL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ clientname, category }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Job creation failed.');

      setClientname('');
      setCategory('');
      setVariant('success');
      setMessage('Job created successfully!');
      setTimeout(() => navigate(`/tasks/${data?.job?._id}`), 100);
    } catch (err) {
      setVariant('danger');
      setMessage(err.message);
    } finally {
      setCreatingJob(false); // Reset loading state after job creation
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

          <Form onSubmit={handleCreateJob} className="border p-4 rounded shadow-sm bg-white position-relative">
            <div className="mb-3">
              <label htmlFor="clientname" className="form-label fw-semibold">
                Client Name
              </label>
              <input
                type="text"
                id="clientname"
                className="form-control"
                value={clientname}
                onChange={(e) => setClientname(e.target.value)}
                placeholder="Enter client name"
                autoComplete="off"
              />
              {/* Suggestions for client names */}
              {suggestions.length > 0 && (
                <ul className="list-group position-absolute w-100 z-3" style={{ top: '100%', left: 0 }}>
                  {suggestions.map((sug, index) => (
                    <li
                      key={index}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleSelectSuggestion(sug)}
                      style={{ cursor: 'pointer' }}
                    >
                      {sug}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Category selection */}
            <div className="mb-3">
              <label htmlFor="category" className="form-label fw-semibold">
                Category
              </label>
              <Form.Select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {loadingCategories ? (
                  <option>Loading categories...</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.categoryname}
                    </option>
                  ))
                )}
              </Form.Select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 fw-semibold"
              disabled={creatingJob}
            >
              {creatingJob ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Creating...
                </>
              ) : (
                'Create Job'
              )}
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;
