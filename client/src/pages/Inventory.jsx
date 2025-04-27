import React, { useState, useEffect } from 'react';
import { backendURL } from '../utils/exports';
import { Link } from 'react-router-dom';
import { FaPen } from 'react-icons/fa';


const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [message, setMessage] = useState('');

  // Fetch all jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${backendURL}/jobs`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setJobs(data.jobs);
        } else {
          setMessage('Failed to load jobs.');
        }
      } catch (err) {
        setMessage('Error fetching jobs.');
      }
    };
    fetchJobs();
  }, []);

  // Handle job update
  const handleJobUpdate = async () => {
    if (!updatedTitle) {
      return setMessage('Please enter a job title.');
    }

    const formData = new FormData();
    formData.append('title', updatedTitle);

    try {
      const res = await fetch(`${backendURL}/jobs/${selectedJob._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setMessage('Job updated successfully!');
      setModalVisible(false);  // Close the modal after update
      setUpdatedTitle('');
      setSelectedJob(null);
      setJobs(jobs.map(job => (job._id === selectedJob._id ? { ...job, title: updatedTitle } : job)));
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="container my-5">
      {/* Create Job Button */}
      <div className="d-flex justify-content-end mb-4">
        <Link to="/createjob" className="btn btn-success">
          <i className="bi bi-plus-circle me-2"></i> Create Job
        </Link>
      </div>
      <h2 className="text-center mb-4 fw-bold text-primary">All Jobs</h2>

      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`} role="alert">
          {message}
        </div>
      )}

      <div className="row">
        {jobs.map((job) => (
          <div key={job._id} className="col-md-4 mb-4">
            <div className="card">
              {job.thumbnail && (
                <div className="position-relative">
                  <img src={job.thumbnail} className="card-img-top" alt={job.title} />
                  <button
                    className="position-absolute top-0 end-0 m-2 btn btn-light"
                    onClick={() => {
                      setSelectedJob(job);
                      setUpdatedTitle(job.title);
                      setModalVisible(true);
                    }}
                  >
                    <FaPen />
                  </button>

                </div>
              )}
              <div className="card-body">
                <h5 className="card-title">{job.title}</h5>
                <p className="card-text">Created by: {job.createdBy}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for updating the job */}
      {modalVisible && (
        <div className="modal show" style={{ display: 'block' }} onClick={() => setModalVisible(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Job</h5>
                <button type="button" className="btn-close" onClick={() => setModalVisible(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control"
                  value={updatedTitle}
                  onChange={(e) => setUpdatedTitle(e.target.value)}
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
      )}
    </div>
  );
};

export default JobList;
