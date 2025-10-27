import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STATUS_OPTIONS = ["Pending", "In Progress", "Resolved"];
const CATEGORIES = [
  "Garbage", "Water Leak", "Road Safety", "Pothole", "Streetlight", "Other"
];
const SORT_OPTIONS = [
  { label: "Latest first", value: "latest" },
  { label: "Oldest first", value: "oldest" }
];

const AdminDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // issue _id being edited
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [status, setStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    search: "",
    sort: "latest"
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const name = localStorage.getItem("loggedInUser")
  const email = localStorage.getItem("userEmail")

  useEffect(() => {
    // Fetch assignable users
    fetch("http://localhost:8080/api/users?role=admin", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.json()).then(setStaffList);
  }, [token]);

  useEffect(() => {
    fetchIssues();
    // eslint-disable-next-line
  }, [filters]);

  const fetchIssues = async () => {
    setLoading(true);
    const params = [];
    if (filters.status) params.push(`status=${filters.status}`);
    if (filters.category) params.push(`category=${filters.category}`);
    if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
    if (filters.sort) params.push(`sort=${filters.sort}`);
    const query = params.length ? `?${params.join('&')}` : '';
    const res = await fetch(`http://localhost:8080/api/issues${query}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setIssues(await res.json());
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    navigate("/login");
    window.location.reload();
  };

  const startEdit = (issue) => {
    setEditing(issue._id);
    setResolutionNotes(issue.resolutionNotes || "");
    setStatus(issue.status);
    setAssignedTo(issue.assignedTo?._id || "");
  };

  const cancelEdit = () => {
    setEditing(null);
    setResolutionNotes("");
    setStatus("");
    setAssignedTo("");
  };

  // PATCH request to update status/comments/assignedTo
  const saveChanges = async (id) => {
    const res = await fetch(`http://localhost:8080/api/issues/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
        resolutionNotes,
        assignedTo
      }),
    });
    if (res.ok) {
      fetchIssues();
      cancelEdit();
    } else {
      alert("Update failed");
    }
  };

  const deleteIssue = async (id) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;
    const res = await fetch(`http://localhost:8080/api/issues/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setIssues(issues.filter((i) => i._id !== id));
    else alert("Delete failed");
  };

  const handleFilter = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">Loading issues...</p>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard: All Reported Issues</h2>

      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="text-2xl font-bold">Welcome, {name || "-"}</div>
          <div className="text-gray-700 text-base">Email: {email || "-"}</div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select name="status" value={filters.status} onChange={handleFilter} className="border rounded px-2 py-1">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (<option key={s}>{s}</option>))}
        </select>
        <select name="category" value={filters.category} onChange={handleFilter} className="border rounded px-2 py-1">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (<option key={c}>{c}</option>))}
        </select>
        <select name="sort" value={filters.sort} onChange={handleFilter} className="border rounded px-2 py-1">
          {SORT_OPTIONS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
        </select>
        <input
          name="search"
          type="text"
          placeholder="Search by title"
          value={filters.search}
          onChange={handleFilter}
          className="border rounded px-2 py-1"
        />
        <button className="bg-gray-400 px-3 py-1 rounded text-white" onClick={() => setFilters({status: "", category: "", search: "", sort: "latest"})}>Clear Filters</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Image</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Resolution</th>
              <th className="px-3 py-2">Location</th>
              <th className="px-3 py-2">Assigned To</th>
              <th className="px-3 py-2">Reported By</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue._id} className="border-b">
                <td className="px-3 py-2 font-semibold">{issue.title}</td>
                <td className="px-3 py-2 text-gray-700">{issue.description}</td>
                <td className="px-3 py-2">{issue.category}</td>
                <td className="px-3 py-2">
                  {issue.imageURL && (
                    <img
                      src={
                        issue.imageURL.startsWith("http")
                          ? issue.imageURL
                          : `http://localhost:8080/${issue.imageURL.replace(/\\/g, "/")}`
                      }
                      alt={issue.title}
                      className="h-16 w-20 object-cover rounded"
                    />
                  )}
                </td>
                {/* Status */}
                <td className="px-3 py-2">
                  {editing === issue._id ? (
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="border rounded p-1"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={
                        issue.status === "Resolved"
                          ? "text-green-600 font-semibold"
                          : issue.status === "In Progress"
                          ? "text-yellow-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {issue.status}
                    </span>
                  )}
                </td>
                {/* Resolution */}
                <td className="px-3 py-2 w-48">
                  {editing === issue._id ? (
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      className="border rounded w-full p-1 text-sm"
                      rows={2}
                    />
                  ) : (
                    <span className="text-gray-700 text-xs">{issue.resolutionNotes || "-"}</span>
                  )}
                </td>
                {/* Location (address, coordinates) */}
                <td className="px-3 py-2 text-xs">
                  {issue.location?.address || "-"}
                  <br />
                  {issue.location?.latitude && issue.location?.longitude
                    ? `${issue.location.latitude}, ${issue.location.longitude}`
                    : ""}
                </td>
                {/* Assigned To */}
                <td className="px-3 py-2">
                  {editing === issue._id ? (
                    <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="border rounded p-1">
                      <option value="">Unassigned</option>
                      {staffList.map((staff) => (
                        <option key={staff._id} value={staff._id}>
                          {staff.name} ({staff.email})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span>
                      {issue.assignedTo?.name
                        ? `${issue.assignedTo.name} (${issue.assignedTo.email})`
                        : <span className="text-gray-400">Unassigned</span>}
                    </span>
                  )}
                </td>
                {/* Reported by */}
                <td className="px-3 py-2 text-xs">
                  {issue.createdBy?.name || "-"}
                  <br />
                  <span className="text-gray-400">{issue.createdBy?.email}</span>
                </td>
                {/* Actions */}
                <td className="px-3 py-2 space-x-2">
                  {editing === issue._id ? (
                    <>
                      <button
                        onClick={() => saveChanges(issue._id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-400 hover:bg-gray-600 text-white px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <button
                        onClick={() => startEdit(issue)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                        >
                        Edit
                        </button>
                        <button
                        onClick={() => deleteIssue(issue._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                        >
                        Delete
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {issues.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            No issues found yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
