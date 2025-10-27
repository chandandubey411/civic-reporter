import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const [userIssues, setUserIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const name = localStorage.getItem("loggedInUser");
  const email = localStorage.getItem("userEmail");

  // Fetch user's own issues
  useEffect(() => {
    async function fetchUserIssues() {
      const res = await fetch("http://localhost:8080/api/issues/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setUserIssues(await res.json());
      }
      setLoading(false);
    }
    fetchUserIssues();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("userEmail");
    navigate("/login");
    window.location.reload(); // Hard reload to reset auth state everywhere
  };

  if (loading) return <div>Loading your data...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-6">
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

      <h3 className="text-xl font-bold mb-4">Your Reported Issues</h3>
      <ul className="space-y-4">
        {userIssues.length === 0 && (
          <li className="border rounded p-4 text-gray-500">
            No issues reported yet.
          </li>
        )}
        {userIssues.map((issue) => (
          <li key={issue._id} className="border rounded p-4 shadow">
            <div className="font-semibold text-lg">{issue.title}</div>
            <div className="text-sm text-gray-700">{issue.description}</div>
            <div>
              <span className="font-semibold">Category:</span> {issue.category}
              {" | "}
              <span className="font-semibold">Status:</span>{" "}
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
            </div>
            {issue.imageURL && (
              <img
                src={
                  issue.imageURL.startsWith("http")
                    ? issue.imageURL
                    : `http://localhost:8080/${issue.imageURL.replace(
                        /\\/g,
                        "/"
                      )}`
                }
                alt={issue.title}
                className="h-28 mt-2 rounded"
              />
            )}
            {/* Resolution display */}
            {issue.resolutionNotes && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                <span className="font-bold text-green-700">
                  Admin Resolution:
                </span>
                <span className="ml-2">{issue.resolutionNotes}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserDashboard;
