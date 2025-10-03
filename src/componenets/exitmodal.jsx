import  { Component } from 'react';

class ExitConfirmationModal extends Component {
  render() {
    if (!this.props.show) {
      return null;
    }

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Unsaved Changes</h3>
          <p>Are you sure you want to leave without saving changes?</p>
          <div className="modal-actions">
            <button className="cancel-button" onClick={this.props.onClose} >
              Cancel
            </button>
            <button className="confirm-exit-button" onClick={this.props.onExit}>
              Exit Without Saving
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ExitConfirmationModal;