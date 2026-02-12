import React from 'react';
import { ChevronLeft, Send, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './CreateTicket.css';

const CreateTicket = () => {
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        navigate('/support');
    };

    return (
        <div className="create-ticket-container">
            <header className="create-ticket-header">
                <button className="back-link" onClick={() => navigate('/support')}>
                    <ChevronLeft size={16} />
                    Create Support Ticket
                </button>
                <h1>Create Support Ticket</h1>
                <p>Get help from our support team</p>
            </header>

            <form className="ticket-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Project <span className="required">*</span></label>
                    <select defaultValue="">
                        <option value="" disabled>Select project</option>
                        <option value="project-1">Project 1</option>
                        <option value="project-2">Project 2</option>
                    </select>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Issue Type</label>
                        <select defaultValue="general">
                            <option value="general">General Question</option>
                            <option value="bug">Bug Report</option>
                            <option value="feature">Feature Request</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Severity</label>
                        <select defaultValue="4">
                            <option value="1">Severity 1</option>
                            <option value="2">Severity 2</option>
                            <option value="3">Severity 3</option>
                            <option value="4">Severity 4</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Subject <span className="required">*</span></label>
                    <input type="text" placeholder="Brief summary of your issue" />
                </div>

                <div className="form-group">
                    <label>Description <span className="required">*</span></label>
                    <textarea placeholder="What would you like to know?"></textarea>
                </div>

                <div className="attachments-section">
                    <label>Attachments</label>
                    <button type="button" className="add-files-btn">
                        <Paperclip size={16} />
                        Add files (screenshots, logs, etc.)
                    </button>
                </div>

                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={() => navigate('/support')}>
                        Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                        <Send size={16} />
                        Submit Ticket
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTicket;
