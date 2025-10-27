import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STATUS_OPTIONS = ["Pending", "In Progress", "Resolved"];

const AdminDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // issue _id being edited
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const name = localStorage.getItem('loggedInUser')
  const email = localStorage.getItem('userEmail')

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    navigate("/login");
    window.location.reload(); // Hard reload to reset auth state everywhere
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:8080/api/issues", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      setIssues(await res.json());
    }
    setLoading(false);
  };

  const startEdit = (issue) => {
    setEditing(issue._id);
    setResolutionNotes(issue.resolutionNotes || "");
    setStatus(issue.status);
  };

  const cancelEdit = () => {
    setEditing(null);
    setResolutionNotes("");
    setStatus("");
  };

  // PATCH request to update status/comments
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
      }),
    });
    if (res.ok) {
      fetchIssues();
      cancelEdit();
    } else {
      alert("Update failed");
    }
  };

  // DELETE request to remove the issue
  const deleteIssue = async (id) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;
    const res = await fetch(`http://localhost:8080/api/issues/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      setIssues(issues.filter((i) => i._id !== id));
    } else {
      alert("Delete failed");
    }
  };

  if (loading) return <div>Loading issues...</div>;

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
                <td className="px-3 py-2 text-xs">
                  {issue.createdBy?.name || "-"}
                  <br />
                  <span className="text-gray-400">{issue.createdBy?.email}</span>
                </td>
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
      </div>
    </div>
  );
};

export default AdminDashboard;
