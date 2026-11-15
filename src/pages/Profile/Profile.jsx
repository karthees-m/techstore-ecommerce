import React, { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./Profile.css";

const Profile = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    type: "Home",
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.addresses) setAddresses(data.addresses);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [currentUser]);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newAddress = { id: Date.now().toString(), ...formData };
      const updatedAddresses = [...addresses, newAddress];

      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(userRef, { addresses: updatedAddresses }, { merge: true });

      setAddresses(updatedAddresses);
      setShowAddressForm(false);
      setFormData({
        type: "Home",
        name: "",
        phone: "",
        address: "",
        city: "",
        pincode: "",
      });
      alert("✅ Address Saved Successfully!");
    } catch (error) {
      alert("Failed to save address.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      const updatedAddresses = addresses.filter((addr) => addr.id !== id);
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(userRef, { addresses: updatedAddresses }, { merge: true });
      setAddresses(updatedAddresses);
    }
  };

  const getAvatarLetter = () => {
    if (currentUser?.displayName)
      return currentUser.displayName.charAt(0).toUpperCase();
    if (currentUser?.email) return currentUser.email.charAt(0).toUpperCase();
    return "U";
  };

  if (loading)
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        Loading Profile...
      </div>
    );

  return (
    <div className="profile-page container page-view active">
      <div className="profile-header-card">
        <div className="profile-avatar-large">
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} alt="User" />
          ) : (
            <div className="avatar-letter">{getAvatarLetter()}</div>
          )}
        </div>
        <div>
          <h2>{currentUser?.displayName || "My Profile"}</h2>
          <p>{currentUser?.email}</p>
        </div>
      </div>

      <div className="address-book-section">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h3>Manage Saved Addresses</h3>
          {!showAddressForm && (
            <button
              className="primary-btn add-new-btn"
              onClick={() => setShowAddressForm(true)}
            >
              + Add New Address
            </button>
          )}
        </div>

        {showAddressForm && (
          <form onSubmit={handleSaveAddress} className="address-form-card">
            <h4>Add New Address</h4>
            <div className="profile-form">
              <div className="form-group full-width">
                <label>Address Type</label>
                <div style={{ display: "flex", gap: "16px" }}>
                  <label className="type-radio">
                    <input
                      type="radio"
                      checked={formData.type === "Home"}
                      onChange={() =>
                        setFormData({ ...formData, type: "Home" })
                      }
                    />{" "}
                    Home
                  </label>
                  <label className="type-radio">
                    <input
                      type="radio"
                      checked={formData.type === "Office"}
                      onChange={() =>
                        setFormData({ ...formData, type: "Office" })
                      }
                    />{" "}
                    Office
                  </label>
                  <label className="type-radio">
                    <input
                      type="radio"
                      checked={formData.type === "Other"}
                      onChange={() =>
                        setFormData({ ...formData, type: "Other" })
                      }
                    />{" "}
                    Other
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Receiver's Name"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+91"
                />
              </div>
              <div className="form-group full-width">
                <label>Complete Address (Door No, Street, Area)</label>
                <textarea
                  required
                  rows="3"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Enter full address"
                ></textarea>
              </div>
              <div className="form-group">
                <label>City / District</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData({ ...formData, pincode: e.target.value })
                  }
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
              <button type="submit" className="primary-btn" disabled={saving}>
                {saving ? "Saving..." : "Save Address"}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowAddressForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {!showAddressForm && (
          <div className="address-grid">
            {addresses.length === 0 ? (
              <p style={{ color: "#64748b" }}>
                No addresses saved yet. Please add an address for seamless
                checkout.
              </p>
            ) : (
              addresses.map((addr) => (
                <div key={addr.id} className="saved-address-card">
                  <span className="addr-tag">{addr.type}</span>
                  <h4>{addr.name}</h4>
                  <p className="addr-phone">Ph: {addr.phone}</p>
                  <p className="addr-text">
                    {addr.address}, {addr.city} - {addr.pincode}
                  </p>
                  <button
                    className="del-addr-btn"
                    onClick={() => handleDeleteAddress(addr.id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
