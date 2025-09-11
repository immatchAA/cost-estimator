import React, { useState, useEffect } from 'react';
import './AccountE.css';
import Sidebar from "../Sidebar/Sidebar";
import { supabase } from '../../supabaseClient'; 

const AccountE = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    createdAt: '',
  });

  // Fetch user data from Supabase
  useEffect(() => {
    const fetchUserData = async () => {
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();

      if (session && session.user) {
        // Fetch user details from the "users" table
        const { data, error } = await supabase
          .from('users')
          .select('first_name, last_name, email, role, created_at')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
        } else {
          // Set the user data to state
          setFormData({
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email,
            phoneNumber: data.phone_number,
            role: data.role,
            createdAt: new Date(data.created_at).toLocaleDateString(), // Format the created_at to a readable date
          });
        }
      } else {
        console.warn("No active session found.");
      }
    };

    fetchUserData();
  }, []);

  // Copy of form data for the popup to maintain original data until save
  const [editFormData, setEditFormData] = useState({ ...formData });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleEditClick = () => {
    setEditFormData({ ...formData });
    setShowModal(true);
  };

  const handleSave = async () => {
  const updates = {
    first_name: editFormData.firstName,
    last_name: editFormData.lastName,
    email: editFormData.email,
  };

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', session.user.id)

  if (error) {
    console.error("Error updating profile:", error.message);
    alert("Failed to update profile");
  } else {
    setFormData({ ...editFormData });
    setShowModal(false);
  }
};


  const handleCancel = () => {
    setShowModal(false);
  };

  return (
    <div className="accounte-wrapper">
      <Sidebar />
      <div className="accounte-content">
        <header className="accounte-header">
          <h1>ACCOUNT SETTINGS</h1>
          <p>Edit your account</p>
        </header>

        <div className="accounte-profile-card">
          <div className="accounte-profile-header">
            <div className="accounte-profile-photo-container">
              <div className="accounte-profile-photo">
                <div className="accounte-camera-icon">📷</div>
              </div>
              <div className="accounte-profile-name">{formData.firstName} {formData.lastName}</div>
              <div className="accounte-profile-id">{formData.role}</div> {/* Display the role here */}
            </div>
            <button className="accounte-edit-button" onClick={handleEditClick}>
              EDIT
            </button>
          </div>

          <div className="accounte-form-container">
            <div className="accounte-form-column">
              <div className="accounte-form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  disabled={true}
                />
              </div>

              <div className="accounte-form-group">
                <label>Email</label>
                <div className="accounte-input-with-badge">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled={true}
                  />
                  <span className="accounte-verified-badge">✓ Verified</span>
                </div>
              </div>

            </div>

            <div className="accounte-form-column">
              <div className="accounte-form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  disabled={true}
                />
              </div>

              <div className="accounte-form-group">
                <label>Joined Date</label> {/* Display Joined date */}
                <input
                  type="text"
                  name="joinedDate"
                  value={formData.createdAt}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Modal for Editing */}
      {showModal && (
        <div className="accounte-modal-overlay">
          <div className="accounte-modal">
            <div className="accounte-modal-header">
              <h2>Edit Profile</h2>
              <button className="accounte-modal-close" onClick={handleCancel}>×</button>
            </div>
            <div className="accounte-modal-body">
              <div className="accounte-form-container">
                <div className="accounte-form-column">
                  <div className="accounte-form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={editFormData.firstName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="accounte-form-group">
                    <label>Email</label>
                    <div className="accounte-input-with-badge">
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleChange}
                      />
                      <span className="accounte-verified-badge">✓ Verified</span>
                    </div>
                  </div>

                  <div className="accounte-form-group">
                    <label>Phone Number</label>
                    <div className="accounte-input-with-badge">
                      <input
                        type="text"
                        name="phoneNumber"
                        value={editFormData.phoneNumber}
                        onChange={handleChange}
                      />
                      <span className="accounte-verified-badge">✓ Verified</span>
                    </div>
                  </div>
                </div>

                <div className="accounte-form-column">
                  <div className="accounte-form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={editFormData.lastName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="accounte-form-group">
                    <label>Password</label>
                    <div className="accounte-input-with-icon">
                      <input
                        type="password"
                        name="password"
                        value={editFormData.password}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="accounte-form-group">
                    <label>ID - Number</label>
                    <input
                      type="text"
                      name="idNumber"
                      value={editFormData.idNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="accounte-modal-footer">
              <button className="accounte-button-cancel" onClick={handleCancel}>Cancel</button>
              <button className="accounte-button-save" onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountE;