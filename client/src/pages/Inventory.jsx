import React, { useState, useEffect } from 'react';
import { backendURL } from '../utils/exports';
import { Link, useNavigate } from 'react-router-dom';
import { FaPen, FaPlusCircle, FaBriefcase } from 'react-icons/fa';

const JobList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updatedClientName, setUpdatedClientName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // New states for sorting and filtering
  const [statusFilter, setStatusFilter] = useState('all'); // 'pending', 'completed', 'all'
  const [clientFilter, setClientFilter] = useState('');
  
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
          setJobs(data.jobs); 
          setFilteredJobs(data.jobs); // Initially show all jobs
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
  }, []);

  useEffect(() => {
    // Apply sorting and filtering on the jobs
    let updatedJobs = [...jobs];

    // Filter by status
    if (statusFilter !== 'all') {
      updatedJobs = updatedJobs.filter(job => job.status === statusFilter);
    }

    // Filter by client name
    if (clientFilter.trim()) {
      updatedJobs = updatedJobs.filter(job =>
        job.clientname.toLowerCase().includes(clientFilter.toLowerCase())
      );
    }

    setFilteredJobs(updatedJobs);
  }, [statusFilter, clientFilter, jobs]); // Re-run when statusFilter, clientFilter, or jobs change

  const handleJobUpdate = async () => {
    if (!updatedClientName.trim()) return setMessage('Please enter client name');
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
      if (!res.ok) throw new Error(data.message || 'Update failed');

      setJobs(jobs.map(job => job._id === selectedJob._id ? { ...job, clientname: updatedClientName } : job));
      setMessage('Client name updated successfully.');
      setModalVisible(false);
      setSelectedJob(null);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">All Jobs</h2>
        <Link to="/createjob" className="btn btn-success d-flex align-items-center gap-2">
          <FaPlusCircle /> Create Job
        </Link>
      </div>

      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      {/* Filters */}
      <div className="d-flex justify-content-between mb-4">
        <select 
          className="form-select w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Jobs</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <input 
          type="text"
          className="form-control w-auto"
          placeholder="Filter by Client Name"
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <p className="text-muted text-center">No jobs found.</p>
      ) : (
        <div className="row g-4">
          {filteredJobs.map((job) => (
            <div key={job._id} className="col-12 col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm h-100" style={{ cursor: 'pointer' }} onClick={() => navigate(`/tasks/${job._id}`)}>
                <div className="bg-primary text-white text-center p-4 position-relative rounded-top">
                  <FaBriefcase size={30} />
                  <button
                    className="btn btn-sm btn-light text-primary rounded-circle position-absolute top-0 end-0 m-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedJob(job);
                      setUpdatedClientName(job.clientname);
                      setModalVisible(true);
                    }}
                  >
                    <FaPen size={14} />
                  </button>
                  <h5 className="mt-2 mb-0 fw-bold">{job.JobId}</h5>
                </div>
                <div className="card-body">
                  <p className="mb-2">
                    <strong>Client:</strong> {job.clientname}
                  </p>
                  <p className="mb-1">
                    <strong>Created By:</strong> {job.createdBy?.name || 'N/A'}
                  </p>
                  <p className="text-muted small mb-1">{job.createdBy?.email}</p>
                  <span className={`badge ${job.status === 'pending' ? 'bg-warning text-dark' : 'bg-success'}`}>
                    {job.status.toUpperCase()}
                  </span>
                </div>
                <div className="card-footer bg-light small text-muted">
                  <div>Created: {new Date(job.createdAt).toLocaleDateString()}</div>
                  <div>Updated: {new Date(job.updatedAt).toLocaleDateString()}</div>
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
          <div
            className="modal show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ zIndex: 1050 }}
          >
            <div className="modal-dialog" role="document" onClick={(e) => e.stopPropagation()}>
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
                  />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setModalVisible(false)}>Close</button>
                  <button className="btn btn-primary" onClick={handleJobUpdate}>Update</button>
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
