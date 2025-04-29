import React, { useState, useEffect } from 'react';
import { backendURL } from '../utils/exports';
import { Link, useNavigate } from 'react-router-dom';
import { FaPen, FaPlusCircle } from 'react-icons/fa';

const JobList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backendURL}/jobs`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setJobs(data.jobs);
        } else {
          setMessage('Failed to load jobs.');
        }
      } catch (err) {
        setMessage('Error fetching jobs.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleJobUpdate = async () => {
    if (!updatedTitle) {
      return setMessage('Please enter a job title.');
    }

    try {
      const res = await fetch(`${backendURL}/jobs/${selectedJob._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ details: updatedTitle }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Update jobs state immediately after update
      setJobs(jobs.map((job) =>
        job._id === selectedJob._id ? { ...job, details: updatedTitle } : job
      ));

      setMessage('Job updated successfully!');
      setModalVisible(false);
      setUpdatedTitle('');
      setSelectedJob(null);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="container my-5">
      {/* Create Job Button */}
      <div className="d-flex justify-content-end mb-4">
        <Link to="/createjob" className="btn btn-success d-flex align-items-center gap-2">
          <FaPlusCircle /> Create Job
        </Link>
      </div>

      <h2 className="text-center mb-4 fw-bold text-primary">All Jobs</h2>

      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`} role="alert">
          {message}
        </div>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-center text-muted">No jobs found.</p>
      ) : (
        <div className="row g-4">
          {jobs.map((job) => (
            <div key={job._id} className="col-12 col-md-6 col-lg-4">
              <div
                onClick={() => navigate(`/tasks/${job._id}`)}
                style={{ cursor: "pointer" }}
                className="card shadow-sm h-100 border-0 position-relative">
                {/* Thumbnail Image */}
                <div className="position-relative">
                  <img
                    src={job.thumbnail || 'https://via.placeholder.com/400x200?text=No+Image'}
                    className="card-img-top"
                    alt={job.details}
                    style={{ height: '220px', objectFit: 'cover' }}
                  />
                  {/* Edit Button */}
                  <button
                    className="position-absolute top-0 end-0 m-2 btn btn-sm btn-light rounded-circle"
                    onClick={() => {
                      setSelectedJob(job);
                      setUpdatedTitle(job.details);
                      setModalVisible(true);
                    }}
                  >
                    <FaPen />
                  </button>
                  {/* Status Badge */}
                  <span
                    className={`badge position-absolute bottom-0 start-0 m-2 px-3 py-2 rounded-pill ${job.status === 'pending' ? 'bg-warning' : 'bg-success'}`}
                  >
                    {job.status.toUpperCase()}
                  </span>
                </div>

                {/* Card Body */}
                <div className="card-body d-flex flex-column">
                  {/* JobId as a main heading */}
                  <h5 className="fw-bold text-primary mb-2" style={{ fontSize: '1.3rem' }}>
                    {job.JobId}
                  </h5>

                  {/* Description smaller and gray */}
                  <p className="text-muted mb-2" style={{ fontSize: '0.95rem', minHeight: '60px' }}>
                    {job.details}
                  </p>

                  {/* Creator */}
                  <div className="mb-2">
                    <small className="text-muted">Created By:</small> <br />
                    <span className="fw-semibold">{job.createdBy.name}</span> <br />
                    <span className="text-muted small">{job.createdBy.email}</span>
                  </div>

                  {/* Dates */}
                  <div className="mt-auto">
                    <small className="text-muted d-block">Created: {new Date(job.createdAt).toLocaleDateString()}</small>
                    <small className="text-muted d-block">Updated: {new Date(job.updatedAt).toLocaleDateString()}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for updating the job */}
      {modalVisible && (
        <>
          {/* Overlay effect */}
          <div
            className="modal-overlay"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1040,
            }}
            onClick={() => setModalVisible(false)}
          ></div>

          {/* Modal Content */}
          <div className="modal show fade" style={{ display: 'block', zIndex: 1050 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Job</h5>
                  <button type="button" className="btn-close" onClick={() => setModalVisible(false)}></button>
                </div>
                <div className="modal-body">
                  <textarea
                    type="text"
                    className="form-control"
                    value={updatedTitle}
                    onChange={(e) => setUpdatedTitle(e.target.value)}
                    placeholder="Enter updated job description"
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalVisible(false)}>
                    Close
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleJobUpdate}>
                    Update Job
                  </button>
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
