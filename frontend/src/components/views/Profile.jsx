import { useAppState } from "../../context/AppStateContext";

function Profile() {
  const { user, setUser } = useAppState();

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewURL = URL.createObjectURL(file);
    setUser(prev => ({ ...prev, photo: previewURL }));
  };

  return (
    <div className="profile-page">
      <h2>My Profile</h2>

      <img
        src={user.photo}
        className="profile-big-avatar"
      />

      <input type="file" onChange={handlePhotoUpload} />

      <p><b>Name:</b> {user.name}</p>
      <p><b>Email:</b> {user.email}</p>
    </div>
  );
}

export default Profile;