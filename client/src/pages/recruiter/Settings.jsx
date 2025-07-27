import { useState } from "react";
import DashboardNavbar from "../../components/DashboardNavbar";
import NavbarDashboard from "../../components/DashboardNavbar";

const initialProfile = {
  firstName: "Dorothy",
  lastName: "Chepkoech",
  email: "dorothy.c@email.com",
  phone: "0700020001",
  position: "",
  timezone: "Eastern Time",
  bio: "Experienced technical recruiter with 8+ years in the industry.",
  avatar: "",
};

const initialCompany = {
  companyName: "Safaricom Inc.",
  industry: "Technology",
  companySize: "51-200 employees",
  website: "https://safinc.com",
  companyDescription: "Leading technology company focused on innovative solutions.",
};

export default function RecruiterSettings() {
  const [profile, setProfile] = useState(initialProfile);
  const [company, setCompany] = useState(initialCompany);
  const [security, setSecurity] = useState({ current: "", next: "" });
  const [message, setMessage] = useState("");

  function handleProfileChange(e) {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  }

  function handleCompanyChange(e) {
    const { name, value } = e.target;
    setCompany((c) => ({ ...c, [name]: value }));
  }

  function handleSecurityChange(e) {
    const { name, value } = e.target;
    setSecurity((s) => ({ ...s, [name]: value }));
  }

  function handleSave(e) {
    e.preventDefault();
    setMessage("Profile & Company details saved! (Mock only)");
    setTimeout(() => setMessage(""), 2000);
  }

  function handlePassword(e) {
    e.preventDefault();
    setMessage("Password updated! (Mock only)");
    setSecurity({ current: "", next: "" });
    setTimeout(() => setMessage(""), 2000);
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-200">
      <DashboardNavbar />

      <div className="flex-1 flex flex-col min-w-0" style={{ marginLeft: 256 }}>
        <NavbarDashboard />

        <div className="p-8 flex-grow overflow-auto">
          <form
            className="max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl px-10 py-8 border border-gray-100 dark:border-gray-700 space-y-10"
            onSubmit={handleSave}
            autoComplete="off"
            style={{ minWidth: 360 }}
          >
            <div className="flex justify-between items-center mb-3">
              <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">Settings</h1>
              <button
                className="px-7 py-2 bg-blue-600 text-white font-semibold text-sm rounded hover:bg-blue-700 transition-colors shadow"
                type="submit"
              >
                Save Changes
              </button>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-4">
              Manage your profile and application preferences
            </div>

            {message && (
              <div className="bg-blue-100 border border-blue-300 text-blue-800 dark:bg-blue-600 dark:border-blue-700 dark:text-blue-100 rounded px-4 py-2 text-center font-medium text-sm mb-6">
                {message}
              </div>
            )}

            {/* Profile Information Section */}
            <section>
              <div className="font-semibold text-gray-800 dark:text-gray-100 text-lg mb-1">Profile Information</div>
              <div className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                Update your personal information and professional details
              </div>
              <div className="flex items-center gap-5 mb-5">
                <div className="rounded-full bg-gray-200 dark:bg-gray-700 w-16 h-16 flex items-center justify-center overflow-hidden border border-gray-300 dark:border-gray-600">
                  <span className="text-gray-400 dark:text-gray-300 text-3xl font-bold">
                    {profile.firstName[0] || "A"}
                  </span>
                </div>
                <div>
                  <label>
                    <input type="file" className="hidden" disabled />
                    <button
                      type="button"
                      className="py-1.5 px-5 rounded border text-xs bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 shadow-sm text-gray-700 dark:text-gray-300 cursor-not-allowed"
                      disabled
                    >
                      Change Photo
                    </button>
                  </label>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 pl-1">
                    JPG, PNG, or GIF. Max size 2MB
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-600 focus:border-blue-400 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-600 focus:border-blue-400 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    disabled
                    className="w-full border border-gray-200 dark:border-gray-600 rounded px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-600 focus:border-blue-400 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
                  <input
                    type="text"
                    name="position"
                    value={profile.position}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-600 focus:border-blue-400 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
                  <select
                    name="timezone"
                    value={profile.timezone}
                    onChange={handleProfileChange}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-600 focus:border-blue-400 outline-none transition"
                  >
                    <option>Eastern Time</option>
                    <option>Central Time</option>
                    <option>Mountain Time</option>
                    <option>Pacific Time</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                <textarea
                  name="bio"
                  rows={2}
                  value={profile.bio}
                  onChange={handleProfileChange}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-600 focus:border-blue-400 outline-none transition"
                />
              </div>
            </section>

            {/* Company Information */}
            <section>
              <div className="font-semibold text-gray-800 dark:text-gray-100 text-lg mb-1">Company Information</div>
              <div className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                Manage your company profile and branding
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={company.companyName}
                    onChange={handleCompanyChange}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-600 focus:border-blue-400 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Industry</label>
                  <select
                    name="industry"
                    value={company.industry}
                    onChange={handleCompanyChange}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-600 focus:border-blue-400 outline-none transition"
                  >
                    <option>Technology</option>
                    <option>Finance</option>
                    <option>Healthcare</option>
                    <option>Education</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Company Size</label>
                  <input
                    type="text"
                    name="companySize"
                    value={company.companySize}
                    onChange={handleCompanyChange}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-600 focus:border-blue-400 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                  <input
                    type="text"
                    name="website"
                    value={company.website}
                    onChange={handleCompanyChange}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-600 focus:border-blue-400 outline-none transition"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Company Description</label>
                <textarea
                  name="companyDescription"
                  rows={2}
                  value={company.companyDescription}
                  onChange={handleCompanyChange}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-600 focus:border-blue-400 outline-none transition"
                />
              </div>
            </section>

            {/* Security */}
            <section>
              <div className="font-semibold text-gray-800 dark:text-gray-100 text-lg mb-1">Security</div>
              <div className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                Manage your account security settings
              </div>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    name="current"
                    value={security.current}
                    onChange={handleSecurityChange}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none"
                    autoComplete="current-password"
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                  <input
                    type="password"
                    name="next"
                    value={security.next}
                    onChange={handleSecurityChange}
                    className="w-full border border-gray-200 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none"
                    autoComplete="new-password"
                  />
                </div>
                <button
                  type="button"
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 duration-150 font-medium ml-2 shadow"
                  onClick={handlePassword}
                >
                  Update Password
                </button>
              </div>
            </section>
          </form>
        </div>
      </div>
    </div>
  );
}
