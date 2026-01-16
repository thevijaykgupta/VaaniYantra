import { useState } from 'react';
import { useAppState } from '../../context/AppStateContext.jsx';
import './OnboardingModal.css';

function OnboardingModal({ onComplete }) {
  const { completeProfile } = useAppState();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    fullName: '',
    role: 'Student',
    preferredLanguage: 'en',
    defaultSubject: 'Digital Signal Processing',
    profilePhoto: null
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      completeProfile();
      onComplete();
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData({...profileData, profilePhoto: e.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <div className="onboarding-header">
          <h2>Welcome to VAANIYANTRA</h2>
          <p>Let's set up your profile to get started</p>
          <div className="step-indicator">
            <span className={step >= 1 ? 'active' : ''}>1</span>
            <span className={step >= 2 ? 'active' : ''}>2</span>
            <span className={step >= 3 ? 'active' : ''}>3</span>
          </div>
        </div>

        <div className="onboarding-content">
          {step === 1 && (
            <div className="step-content">
              <h3>Tell us about yourself</h3>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={profileData.role}
                  onChange={(e) => setProfileData({...profileData, role: e.target.value})}
                >
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Professional">Professional</option>
                  <option value="Researcher">Researcher</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <h3>Choose your preferences</h3>
              <div className="form-group">
                <label>Preferred Language</label>
                <select
                  value={profileData.preferredLanguage}
                  onChange={(e) => setProfileData({...profileData, preferredLanguage: e.target.value})}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ta">Tamil</option>
                  <option value="kn">Kannada</option>
                  <option value="te">Telugu</option>
                  <option value="bn">Bengali</option>
                </select>
              </div>

              <div className="form-group">
                <label>Default Subject</label>
                <select
                  value={profileData.defaultSubject}
                  onChange={(e) => setProfileData({...profileData, defaultSubject: e.target.value})}
                >
                  <option value="Digital Signal Processing">Digital Signal Processing</option>
                  <option value="Data Structures">Data Structures</option>
                  <option value="Analog Communication">Analog Communication</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Control Systems">Control Systems</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <h3>Add a profile photo (optional)</h3>
              <div className="photo-upload-section">
                <div className="photo-preview">
                  {profileData.profilePhoto ? (
                    <img src={profileData.profilePhoto} alt="Profile" />
                  ) : (
                    <div className="photo-placeholder">
                      <span>📸</span>
                      <p>Click to upload</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  id="photo-upload"
                  style={{ display: 'none' }}
                />
                <label htmlFor="photo-upload" className="photo-upload-btn">
                  {profileData.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="onboarding-footer">
          <button
            className="onboarding-btn primary"
            onClick={handleNext}
            disabled={step === 1 && !profileData.fullName.trim()}
          >
            {step === 3 ? 'Complete Setup' : 'Continue'}
          </button>

          {step > 1 && (
            <button
              className="onboarding-btn secondary"
              onClick={() => setStep(step - 1)}
            >
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;
