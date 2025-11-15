import React from 'react';

const MentorPopup = ({ message, onClose }) => {
  return (
    <div className="mentor-overlay" onClick={onClose}>
      <div className="mentor-popup" onClick={(e) => e.stopPropagation()}>
        <div className="mentor-header">
          <div className="mentor-avatar">🎓</div>
          <div className="mentor-info">
            <h3>AI Financial Mentor</h3>
            <span className="concept-tag">{message.concept}</span>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="mentor-content">
          <h2>{message.title}</h2>
          <p>{message.body}</p>
          
          <div className="trowe-price-badge">
            <span>📚 Powered by T. Rowe Price Educational Framework</span>
          </div>
        </div>
        
        <div className="mentor-actions">
          <button className="primary-btn" onClick={onClose}>
            Got it! Continue Playing
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorPopup;