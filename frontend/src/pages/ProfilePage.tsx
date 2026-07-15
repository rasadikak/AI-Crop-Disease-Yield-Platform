import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import api from "../services/api";

const SRI_LANKA_DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo",
  "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara",
  "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar",
  "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya",
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { farmer, logoutUser } = useAuth();

  const [name, setName]       = useState(farmer?.name ?? "");
  const [email]               = useState(farmer?.email ?? "");
  const [district, setDistrict] = useState(farmer?.district ?? "");

  const [isNameEditing, setIsNameEditing]         = useState(false);
  const [draftName, setDraftName]                 = useState(name);
  const [isDistrictEditing, setIsDistrictEditing] = useState(false);
  const [draftDistrict, setDraftDistrict]         = useState(district);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting]               = useState(false);
  const [deleteError, setDeleteError]             = useState("");
  const [nameError, setNameError]                 = useState("");
  const [districtSuccess, setDistrictSuccess]     = useState(false);

  //  name 
  const handleNameSave = async () => {
    if (!draftName.trim()) { setNameError("Name cannot be empty"); return; }
    try {
      await api.put("/auth/profile/update-name", { new_name: draftName.trim() });
      setName(draftName.trim());
      setIsNameEditing(false);
      setNameError("");
    } catch (err: any) {
      setNameError(err.response?.data?.error || "Failed to update name");
    }
  };

  //  district 
  const handleDistrictSave = async () => {
    if (!draftDistrict) return;
    try {
      await api.put("/auth/profile/update-district", { new_district: draftDistrict });
      setDistrict(draftDistrict);
      setIsDistrictEditing(false);
      setDistrictSuccess(true);
      setTimeout(() => setDistrictSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to update district:", err);
    }
  };

  //  delete 
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError("");
    try {
      await api.delete("/auth/profile/delete-account");
      logoutUser();
      navigate("/login");
    } catch (err: any) {
      setDeleteError(err.response?.data?.error || "Failed to delete account");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/images/profilePage.webp')" }}
    >
      <div className="absolute inset-0 bg-white/15" />

      <div className="relative z-10 max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">Your Profile</h1>
        <p className="text-gray-200 text-sm mb-6">Manage your account and preferences</p>

        {/* card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">

          {/* name row */}
          <div className="px-6 py-5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Full Name</label>
            {isNameEditing ? (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  value={draftName}
                  autoFocus
                  onChange={(e) => setDraftName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {nameError && <p className="text-red-600 text-xs">{nameError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleNameSave}
                    className="bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setIsNameEditing(false); setDraftName(name); setNameError(""); }}
                    className="text-gray-500 hover:text-gray-700 text-sm px-4 py-1.5 rounded-lg border border-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-1 flex items-center justify-between">
                <span className="text-gray-800 font-medium">{name}</span>
                <button
                  onClick={() => { setDraftName(name); setIsNameEditing(true); }}
                  className="text-green-700 hover:text-green-800 text-sm font-medium"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* email row — read only */}
          <div className="px-6 py-5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email Address</label>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-gray-800 font-medium">{email}</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Read only</span>
            </div>
          </div>

          {/* district row */}
          <div className="px-6 py-5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">District</label>
            {districtSuccess && (
              <p className="text-green-600 text-xs mt-1">✓ District updated</p>
            )}
            {isDistrictEditing ? (
              <div className="mt-2 space-y-2">
                <select
                  value={draftDistrict}
                  onChange={(e) => setDraftDistrict(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select a district</option>
                  {SRI_LANKA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleDistrictSave}
                    className="bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setIsDistrictEditing(false); setDraftDistrict(district); }}
                    className="text-gray-500 hover:text-gray-700 text-sm px-4 py-1.5 rounded-lg border border-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-1 flex items-center justify-between">
                <span className="text-gray-800 font-medium">{district || "Not set"}</span>
                <button
                  onClick={() => { setDraftDistrict(district); setIsDistrictEditing(true); }}
                  className="text-green-700 hover:text-green-800 text-sm font-medium"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* password row */}
          <div className="px-6 py-5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Password</label>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-gray-400 text-sm">••••••••</span>
              <Link
                to="/forgot-password"
                className="text-green-700 hover:text-green-800 text-sm font-medium"
              >
                Change password
              </Link>
            </div>
          </div>

        </div>

        {/* sign out */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Sign out</p>
              <p className="text-xs text-gray-400 mt-0.5">Sign out of your AgriSense account</p>
            </div>
            <button
              onClick={() => { logoutUser(); navigate("/login"); }}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium border border-gray-200 px-4 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* delete account */}
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-red-100 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Delete account</p>
              <p className="text-xs text-gray-400 mt-0.5">Permanently delete your account and all data</p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700 text-sm font-medium border border-red-200 px-4 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </div>

          {/* confirm dialog */}
          {showDeleteConfirm && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800 font-medium mb-1">Are you sure?</p>
              <p className="text-xs text-red-600 mb-3">
                This will permanently delete your account. This cannot be undone.
              </p>
              {deleteError && <p className="text-red-600 text-xs mb-2">{deleteError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
                >
                  {isDeleting ? "Deleting..." : "Yes, delete my account"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="text-gray-600 text-sm px-4 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;