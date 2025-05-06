import React, { useState, useEffect, useMemo } from 'react';
import { backendURL } from '../utils/exports';
import { Link, useNavigate } from 'react-router-dom';
import { FaPen, FaPlusCircle, FaBriefcase } from 'react-icons/fa';
import { Form } from 'react-bootstrap';

const JobList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [updatedClientName, setUpdatedClientName] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [clientFilter, setClientFilter] = useState('');

  // Memoize user and role checks
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const onlyAdmin = user?.role === 'admin';

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

  // Fetch Jobs only once
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backendURL}/jobs`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          let jobsList = data.jobs;

          // Only filter by createdBy for admins
          if (onlyAdmin) {
            jobsList = jobsList.filter(job => job.createdBy?.email === user.email);
          }

          setJobs(jobsList);
        } else {
          setMessage('Failed to load jobs.');
        }
      } catch {
        setMessage('Error fetching jobs.');
      } finally {
        setLoading(false);
      }
    };


    fetchJobs();
  }, [onlyAdmin, isAdmin, user?.email]);

  // Inside JobList component, before return (
  const handleJobUpdate = async () => {
    if (!updatedClientName.trim()) {
      setMessage('Client name cannot be empty.');
      return;
    }

    try {
      const res = await fetch(`${backendURL}/jobs/${selectedJob._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ clientname: updatedClientName }),
      });

      const data = await res.json();

      if (res.ok) {
        setJobs(prevJobs =>
          prevJobs.map(job =>
            job._id === selectedJob._id ? { ...job, clientname: updatedClientName } : job
          )
        );
        setMessage('Client name updated successfully.');
        setModalVisible(false);
      } else {
        setMessage(data.message || 'Failed to update job.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error updating job.');
    }
  };

  useEffect(() => {
    let updatedJobs = [...jobs];

    // Admin filters by selected status
    if (isAdmin) {
      updatedJobs = updatedJobs.filter(job => job.status === statusFilter);
    }

    // Non-admins always see only pending jobs
    if (!isAdmin) {
      updatedJobs = updatedJobs.filter(job => job.status === 'pending');
    }

    // Filter by client name
    if (clientFilter.trim()) {
      updatedJobs = updatedJobs.filter(job =>
        job.clientname.toLowerCase().includes(clientFilter.toLowerCase())
      );
    }

    // ✅ Filter by selected category
    if (category) {
      updatedJobs = updatedJobs.filter(job => job.category?._id === category);
    }

    // Sort by creation date (newest first)
    updatedJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredJobs(updatedJobs);
  }, [statusFilter, clientFilter, category, jobs, isAdmin]);



  // Message timeout
  useEffect(() => {
    if (message) {
      const timeout = setTimeout(() => setMessage(''), 4000);
      return () => clearTimeout(timeout);
    }
  }, [message]);



  return (
    <div className="container my-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-success">All Jobs</h2>
        {isAdmin && (
          <Link to="/createjob" className="btn btn-success d-flex align-items-center gap-2 mt-3 mt-md-0">
            <FaPlusCircle /> Create Job
          </Link>
        )}
      </div>

      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      {/* Filters */}
      <div className="row g-3 mb-4">
        {isAdmin && (
          <div className="col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}
        <div className="col-md-3">
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
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Client Name"
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Job Cards */}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-success" role="status" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <p className="text-muted text-center">No jobs found.</p>
      ) : (
        <div className="row g-4">
          {filteredJobs.map((job) => (
            <div key={job._id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div
                className="card border-0 shadow h-100"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/tasks/${job._id}`)}
              >
                <div className="bg-success text-white text-center p-4 position-relative rounded-top">
                  <FaBriefcase size={30} />
                  {isAdmin && (
                    <button
                      className="btn btn-sm btn-light text-success rounded-circle position-absolute top-0 end-0 m-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJob(job);
                        setUpdatedClientName(job.clientname);
                        setModalVisible(true);
                      }}
                    >
                      <FaPen size={14} />
                    </button>
                  )}
                  <h5 className="mt-2 mb-0 fw-bold">{job.JobId}</h5>
                </div>
                <div className="card-body">
                  <p><strong>Client:</strong> {job.clientname}</p>
                  <p><strong>Category:</strong> {job.category?.categoryname || 'N/A'}</p>
                  <p><strong>Created By:</strong> {job.createdBy?.name || 'N/A'}</p>
                  {isAdmin && (
                    <>
                      <p className="text-muted small">{job.createdBy?.email}</p>
                      <span className={`badge ${job.status === 'pending' ? 'bg-warning text-dark' : 'bg-success'}`}>
                        {job.status.toUpperCase()}
                      </span>
                    </>
                  )}
                </div>
                <div className="card-footer bg-light small text-muted">
                  <div>Created: {new Date(job.createdAt).toLocaleString()}</div>
                  <div>Updated: {new Date(job.updatedAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalVisible && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1040 }}
            onClick={() => setModalVisible(false)}
          />
          <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1050 }}>
            <div onClick={(e) => e.stopPropagation()}>
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Update Client Name</h5>
                    <button type="button" className="btn-close" onClick={() => setModalVisible(false)} />
                  </div>
                  <div className="modal-body">
                    <input
                      type="text"
                      className="form-control"
                      value={updatedClientName}
                      onChange={(e) => setUpdatedClientName(e.target.value)}
                      placeholder="Enter client name"
                      required
                    />
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setModalVisible(false)}>Close</button>
                    <button className="btn btn-success" onClick={handleJobUpdate}>Update</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default JobList;
