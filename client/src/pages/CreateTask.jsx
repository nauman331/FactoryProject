import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { ReactMediaRecorder } from 'react-media-recorder';

const CreateTask = () => {
  const [formData, setFormData] = useState({
    jobId: '',
    title: '',
    description: '',
    clientName: '',
    clientContact: '',
    status: 'pending',
    images: [],
    documents: [],
    voiceMessage: '',
  });

  const [audioUrl, setAudioUrl] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [audioBlob, setAudioBlob] = useState(null);

  const [jobOptions, setJobOptions] = useState([]);

  const startRecording = () => {
    if (navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          mediaRecorderRef.current = new MediaRecorder(stream);
          mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
          };

          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: 'audio/wav',
            });
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioUrl(audioUrl);
            setAudioBlob(audioBlob);
          };

          mediaRecorderRef.current.start();
          setIsRecording(true);
        })
        .catch((error) => {
          console.error('Error accessing the microphone', error);
        });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendVoiceMessage = () => {
    if (audioBlob) {
      const formData = new FormData();
      formData.append('voiceMessage', audioBlob);
      // Send this formData to your backend (you can replace the URL with your actual endpoint)
      fetch('http://your-api-endpoint', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Voice message sent successfully', data);
        })
        .catch((error) => {
          console.error('Error sending voice message:', error);
        });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const fetchJobs = async () => {
    const response = await fetch('http://your-api-endpoint/jobs'); // Replace with your jobs endpoint
    const data = await response.json();
    setJobOptions(data);
  };

  const handleDrop = (acceptedFiles, fileType) => {
    const uniqueFiles = acceptedFiles.filter(
      (file) =>
        !formData[fileType].some((existingFile) => existingFile.name === file.name)
    );
    const updatedFiles = [...formData[fileType], ...uniqueFiles];

    setFormData((prevData) => ({
      ...prevData,
      [fileType]: updatedFiles,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('jobId', formData.jobId);
    form.append('title', formData.title);
    form.append('description', formData.description);
    form.append('clientName', formData.clientName);
    form.append('clientContact', formData.clientContact);
    form.append('status', formData.status);

    formData.images.forEach((file) => form.append('files', file));

    if (audioBlob) {
      form.append('voiceMessage', audioBlob);
    }

    try {
      const response = await fetch('http://your-api-endpoint/tasks', {
        method: 'POST',
        body: form,
      });

      const data = await response.json();
      if (response.ok) {
        alert('Task created successfully!');
      } else {
        alert('Error creating task');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating task');
    }
  };

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'images'),
    accept: 'image/*',
    multiple: true,
  });

  const { getRootProps: getDocRootProps, getInputProps: getDocInputProps } = useDropzone({
    onDrop: (acceptedFiles) => handleDrop(acceptedFiles, 'documents'),
    accept: '.pdf',
    multiple: true,
  });

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Create Task</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="jobId" className="form-label">Job</label>
          <select
            className="form-select"
            id="jobId"
            name="jobId"
            value={formData.jobId}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a job</option>
            {jobOptions.map((job) => (
              <option key={job._id} value={job._id}>{job.title}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="status" className="form-label">Status</label>
          <select
            className="form-select"
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            required
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label htmlFor="clientName" className="form-label">Client Name</label>
          <input
            type="text"
            className="form-control"
            id="clientName"
            name="clientName"
            value={formData.clientName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="clientContact" className="form-label">Client Contact</label>
          <input
            type="text"
            className="form-control"
            id="clientContact"
            name="clientContact"
            value={formData.clientContact}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Image Upload (Drag and Drop) */}
        <div className="mb-3">
          <label className="form-label">Upload Images (Optional)</label>
          <div
            {...getImageRootProps()}
            className="dropzone border rounded p-4 mb-3"
          >
            <input {...getImageInputProps()} />
            <p>Drag and drop images here, or click to select files</p>
          </div>
          <ul>
            {formData.images.map((image, idx) => (
              <li key={idx}>{image.name}</li>
            ))}
          </ul>
        </div>

        {/* Document Upload (Drag and Drop) */}
        <div className="mb-3">
          <label className="form-label">Upload Documents (Optional)</label>
          <div
            {...getDocRootProps()}
            className="dropzone border rounded p-4 mb-3"
          >
            <input {...getDocInputProps()} />
            <p>Drag and drop documents here, or click to select files</p>
          </div>
          <ul>
            {formData.documents.map((doc, idx) => (
              <li key={idx}>{doc.name}</li>
            ))}
          </ul>
        </div>

        {/* Voice Recording */}
        <div className="mb-3">
          <label className="form-label">Record Voice Message</label>
          <div
            className={`voice-recording-btn ${isRecording ? 'recording' : ''}`}
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
          >
            {isRecording ? (
              <span className="text-danger">Release to Stop</span>
            ) : (
              <span className="text-primary">Press and Hold to Record</span>
            )}
          </div>
          {audioUrl && (
            <div className="mt-3">
              <audio controls src={audioUrl}></audio>
              <button
                type="button"
                className="btn btn-success mt-2"
                onClick={handleSendVoiceMessage}
              >
                Send Voice Message
              </button>
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Create Task
        </button>
      </form>
    </div>
  );
};

export default CreateTask;
