import { useState } from "react";
import DashboardNavbar from "../../components/DashboardNavbar";
import NavbarDashboard from "../../components/DashboardNavbar";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Avatar } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";

const MOCK_RECRUITER = {
  firstName: "Dorothy",
  lastName: "Chepkoech",
  email: "dorothy.c@email.com",
  phone: "0700020001",
  location: "Nairobi Kenya",
  company: "SmartRecruiter",
  companyWebsite: "www.smartrecruiter.com",
  role: "Senior Talent Acquisition Specialist",
  about: "Passionate about connecting top talent with innovative companies.",
  avatarUrl: "https://via.placeholder.com/150",
  metrics: {
    activeJobs: 23,
    candidates: 145,
    interviews: 89,
  },
  recent: [
    { icon: "user-plus", label: "New candidate applied" },
    { icon: "calendar", label: "Interview scheduled" },
    { icon: "envelope", label: "Message received" },
  ],
};

export default function RecruiterProfile() {
  const [profile, setProfile] = useState(MOCK_RECRUITER);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(MOCK_RECRUITER);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSave() {
    setProfile(form);
    setEditing(false);
  }

  function handleCancel() {
    setForm(profile);
    setEditing(false);
  }

  return (
    <div className="flex min-h-screen bg-[#f4f6fa] dark:bg-gray-900"> {/* Light and Dark background */}
      <DashboardNavbar />
      <div className="flex-1 flex flex-col min-w-0" style={{ marginLeft: 256 }}>
        <NavbarDashboard />
        <div className="flex justify-center px-2 pt-6 pb-10">
          <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-start">
            {/* Main Profile Card */}
            <Card className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-md dark:shadow-md p-8 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-6 mb-8 border-b border-gray-200 dark:border-gray-700 pb-5">
                <Avatar src={profile.avatarUrl} alt="Profile" size="xl" />
                <div>
                  <h3 className="text-3xl font-bold text-blue-700 dark:text-blue-400 tracking-tight">
                    {profile.firstName} {profile.lastName}
                  </h3>
                  <p className="text-base text-gray-400 dark:text-gray-300 mt-1">{profile.role}</p>
                </div>
                <Button
                  size="sm"
                  className="ml-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-8 rounded font-semibold shadow"
                  onClick={() => setEditing((e) => !e)}
                >
                  {editing ? "Cancel Edit" : "Edit Profile"}
                </Button>
              </div>
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    name="firstName"
                    value={form.firstName}
                    disabled={!editing}
                    onChange={handleChange}
                    className="dark:bg-gray-700 dark:text-white"
                    inputClassName="dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                  />
                  <Input
                    label="Last Name"
                    name="lastName"
                    value={form.lastName}
                    disabled={!editing}
                    onChange={handleChange}
                    className="dark:bg-gray-700 dark:text-white"
                    inputClassName="dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                  />
                  <Input
                    label="Email"
                    name="email"
                    value={form.email}
                    disabled
                    className="dark:bg-gray-700"
                    inputClassName="dark:bg-gray-700 dark:text-gray-400"
                  />
                  <Input
                    label="Phone"
                    name="phone"
                    value={form.phone}
                    disabled={!editing}
                    onChange={handleChange}
                    className="dark:bg-gray-700 dark:text-white"
                    inputClassName="dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                  />
                  <Input
                    label="Location"
                    name="location"
                    value={form.location}
                    disabled={!editing}
                    onChange={handleChange}
                    className="dark:bg-gray-700 dark:text-white"
                    inputClassName="dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                  />
                  <Input
                    label="Company"
                    name="company"
                    value={form.company}
                    disabled={!editing}
                    onChange={handleChange}
                    className="dark:bg-gray-700 dark:text-white"
                    inputClassName="dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                  />
                  <Input
                    label="Company Website"
                    name="companyWebsite"
                    value={form.companyWebsite}
                    disabled
                    className="dark:bg-gray-700"
                    inputClassName="dark:bg-gray-700 dark:text-gray-400"
                  />
                  <Input
                    label="Your Role"
                    name="role"
                    value={form.role}
                    disabled={!editing}
                    onChange={handleChange}
                    className="dark:bg-gray-700 dark:text-white"
                    inputClassName="dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                  />
                </div>
                <Textarea
                  label="About You"
                  name="about"
                  value={form.about}
                  disabled={!editing}
                  onChange={handleChange}
                  className="mt-2 dark:bg-gray-700 dark:text-white"
                  inputClassName="dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                />
                {editing && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded px-7 py-2 font-semibold shadow"
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-200 border text-blue-700 hover:bg-blue-100 dark:bg-gray-600 dark:text-blue-400 dark:hover:bg-gray-500 rounded px-7 py-2 font-semibold"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </Card>
            {/* Sidebar summary widgets */}
            <div className="flex flex-col gap-5 min-w-[300px]">
              <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700">
                <div className="font-semibold text-blue-700 dark:text-blue-500 text-lg mb-3">
                  Recruitment Overview
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-500">
                      {profile.metrics.activeJobs}
                    </div>
                    <div className="text-sm text-gray-400 dark:text-gray-400 mt-1">Active Jobs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {profile.metrics.candidates}
                    </div>
                    <div className="text-sm text-gray-400 dark:text-gray-400 mt-1">Candidates</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {profile.metrics.interviews}
                    </div>
                    <div className="text-sm text-gray-400 dark:text-gray-400 mt-1">Interviews</div>
                  </div>
                </div>
              </Card>
              <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-5 border border-gray-100 dark:border-gray-700">
                <div className="font-semibold text-blue-700 dark:text-blue-500 text-lg mb-3">Recent Activity</div>
                <ul className="space-y-2 text-base text-gray-600 dark:text-gray-400">
                  {profile.recent.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <span className="text-lg">
                        {item.icon === "user-plus" && "👤"}
                        {item.icon === "calendar" && "📅"}
                        {item.icon === "envelope" && "✉️"}
                      </span>
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
