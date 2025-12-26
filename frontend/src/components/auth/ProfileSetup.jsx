import { useState } from 'react';
import { LANGUAGES } from '../../utils/constants';
import './ProfileSetup.css';

function ProfileSetup({ onComplete }) {
  const [profileData, setProfileData] = useState({
    fullName: '',
    preferredLanguage: 'en',
    photo: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Save profile data
    localStorage.setItem('profileComplete', 'true');
    localStorage.setItem('userProfile', JSON.stringify(profileData));

    onComplete();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData({...profileData, photo: e.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="profile-overlay">
      <div className="profile-modal">
        <div className="profile-header">
          <h2>Set up your profile</h2>
          <p>Customize your VaaniYantra experience</p>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="photo-upload">
            <div className="photo-preview">
              {profileData.photo ? (
                <img src={profileData.photo} alt="Profile" />
              ) : (
                <div className="photo-placeholder">
                  <span>👤</span>
                </div>
              )}
            </div>
            <label className="photo-upload-btn">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              Choose Photo
            </label>
          </div>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={profileData.fullName}
              onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Preferred Language</label>
            <select
              value={profileData.preferredLanguage}
              onChange={(e) => setProfileData({...profileData, preferredLanguage: e.target.value})}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="profile-submit">
            Continue to VaaniYantra
          </button>
        </form>

        <div className="profile-skip">
          <button
            type="button"
            className="skip-btn"
            onClick={() => onComplete()}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileSetup;
