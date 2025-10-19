import React, { useState, useEffect } from "react";
import "./AccountE.css";
import Sidebar from "../Sidebar/Sidebar";
import { supabase } from "../../supabaseClient";

const AccountE = () => {
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    createdAt: "",
    profile_image: "",
  });

  const [editFormData, setEditFormData] = useState({ ...formData });

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && session.user) {
        const { data, error } = await supabase
          .from("users")
          .select(
            "first_name, last_name, email, role, created_at, profile_image"
          )
          .eq("auth_id", session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching user data:", error);
        } else if (data) {
          setFormData({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            email: data.email || "",
            role: data.role || "",
            createdAt: new Date(data.created_at).toLocaleDateString(),
            profile_image: data.profile_image || "",
          });
        }
      } else {
        console.warn("No active session found.");
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleEditClick = () => {
    setEditFormData({ ...formData });
    setShowModal(true);
  };

  const handleSave = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return alert("User not logged in");

    const updates = {
      first_name: editFormData.firstName,
      last_name: editFormData.lastName,
      email: editFormData.email,
    };

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("auth_id", session.user.id);

    if (error) {
      console.error("Error updating profile:", error.message);
      alert("Failed to update profile");
    } else {
      setFormData({ ...editFormData });
      setShowModal(false);
      alert("Profile updated successfully!");
    }
  };

  const handleCancel = () => setShowModal(false);

  // ✅ Profile Image Upload
  const handleProfileImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("User not logged in");
        setUploading(false);
        return;
      }

      if (formData.profile_image) {
        const oldFile = formData.profile_image.split("/").pop();
        await supabase.storage
          .from("profile-pictures")
          .remove([`avatars/${oldFile}`]);
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(filePath);

      const publicUrl = publicData?.publicUrl;
      if (!publicUrl) throw new Error("Failed to get public URL");

      const { error: dbError } = await supabase
        .from("users")
        .update({ profile_image: publicUrl })
        .eq("auth_id", user.id);

      if (dbError) throw dbError;

      setFormData((prev) => ({ ...prev, profile_image: publicUrl }));
      alert("✅ Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading profile image:", error.message);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Password Change Logic
  const handlePasswordChangeInput = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const {
        data: { user },
        error: getUserError,
      } = await supabase.auth.getUser();

      if (getUserError || !user) {
        alert("User not logged in.");
        return;
      }

      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (reauthError) {
        alert("Current password is incorrect.");
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        alert("Failed to change password. Please try again.");
        console.error("Password update error:", updateError.message);
      } else {
        alert("✅ Password changed successfully!");
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      console.error("Unexpected error:", err.message);
      alert("Something went wrong.");
    } finally {
      setIsChangingPassword(false);
    }
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
                {formData.profile_image ? (
                  <img
                    src={`${formData.profile_image}?t=${Date.now()}`}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <img
                    src="/default-avatar.png"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                )}
                <label
                  className="accounte-camera-icon"
                  htmlFor="profileUpload"
                  style={{ cursor: uploading ? "not-allowed" : "pointer" }}
                >
                  {uploading ? "⏳" : "📷"}
                </label>
                <input
                  id="profileUpload"
                  type="file"
                  accept="image/*"
                  onChange={uploading ? null : handleProfileImageChange}
                  style={{ display: "none" }}
                />
              </div>

              <div className="accounte-profile-name">
                {formData.firstName} {formData.lastName}
              </div>
              <div className="accounte-profile-id">{formData.role}</div>
            </div>

            <div className="accounte-button-group">
              <button
                className="accounte-edit-button"
                onClick={handleEditClick}
              >
                EDIT
              </button>

              <button
                className="accounte-password-button"
                onClick={() => setShowPasswordModal(true)}
              >
                CHANGE PASSWORD
              </button>
            </div>
          </div>

          <div className="accounte-form-container">
            <div className="accounte-form-column">
              <div className="accounte-form-group">
                <label>First Name</label>
                <input type="text" value={formData.firstName} disabled />
              </div>

              <div className="accounte-form-group">
                <label>Email</label>
                <div className="accounte-input-with-badge">
                  <input type="email" value={formData.email} disabled />
                  <span className="accounte-verified-badge">✓ Verified</span>
                </div>
              </div>
            </div>

            <div className="accounte-form-column">
              <div className="accounte-form-group">
                <label>Last Name</label>
                <input type="text" value={formData.lastName} disabled />
              </div>

              <div className="accounte-form-group">
                <label>Joined Date</label>
                <input type="text" value={formData.createdAt} disabled />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🧩 Edit Modal */}
      {showModal && (
        <div className="accounte-modal-overlay">
          <div className="accounte-modal">
            <div className="accounte-modal-header">
              <h2>Edit Profile</h2>
              <button className="accounte-modal-close" onClick={handleCancel}>
                ×
              </button>
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
                      <span className="accounte-verified-badge">
                        ✓ Verified
                      </span>
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
                </div>
              </div>
            </div>

            <div className="accounte-modal-footer">
              <button className="accounte-button-cancel" onClick={handleCancel}>
                Cancel
              </button>
              <button className="accounte-button-save" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🧩 Change Password Modal */}
      {showPasswordModal && (
        <div className="accounte-modal-overlay">
          <div className="accounte-modal">
            <div className="accounte-modal-header">
              <h2>Change Password</h2>
              <button
                className="accounte-modal-close"
                onClick={() => setShowPasswordModal(false)}
              >
                ×
              </button>
            </div>

            <div className="accounte-modal-body">
              <div className="accounte-form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChangeInput}
                />
              </div>
              <div className="accounte-form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChangeInput}
                />
              </div>
              <div className="accounte-form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChangeInput}
                />
              </div>
            </div>

            <div className="accounte-modal-footer">
              <button
                className="accounte-button-cancel"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
              <button
                className="accounte-button-save"
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "Updating..." : "Save Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountE;
