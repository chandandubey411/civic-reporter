import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const UserDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = localStorage.getItem('loggedInUser');

  useEffect(() => {
    // Fetch all issues (replace URL if needed)
    fetch("http://localhost:8080/api/issues")
      .then((res) => res.json())
      .then((data) => {
        setIssues(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading issues...</div>;

  return (
    <div className="mt-6 grid grid-cols-1 gap-8">
      {/* ------ List Section ------ */}
      <div>
        <p className="font-bold">Welcome {user}</p>
        <h3 className="text-xl font-bold mb-4">Reported Issues (List View)</h3>
        <ul className="space-y-4 flex items-center overflow-x-scroll  gap-5">
          {issues.map((issue) => (
            <li key={issue._id} className="border rounded p-4 shadow min-w-[320px] flex gap-4">
              {issue.imageURL && (
                <div>
                  <img
                    src={
                      issue.imageURL.startsWith("http")
                        ? issue.imageURL
                        : `http://localhost:8080/${issue.imageURL.replace("\\", "/")}`
                    }
                    alt={issue.title}
                    className="h-28 mt-2 rounded"
                  />
                </div>
              )}
              
              <div>
                
              <div className="font-semibold text-lg">{issue.title}</div>
              <div className="text-sm text-gray-700 mb-1">{issue.description}</div>
              <div>
                <span className="font-semibold">Category:</span> {issue.category}
              </div>
              <div>
                <span className="font-semibold">Status:</span>&nbsp;
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
              </div>
              
            </li>
          ))}
        </ul>
      </div>

      {/* ------ Map Section ------ */}
      <div>
        <h3 className="text-xl font-bold mb-4">Reported Issues (Map View)</h3>
        <MapContainer
          center={[28.6448, 77.216721]}
          zoom={12}
          style={{ height: "400px", width: "auto" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {issues.map((issue) =>
            issue.location &&
            issue.location.latitude &&
            issue.location.longitude ? (
              <Marker
                key={issue._id}
                position={[
                  Number(issue.location.latitude),
                  Number(issue.location.longitude),
                ]}
              >
                <Popup>
                  <div className="font-semibold">{issue.title}</div>
                  <div className="text-xs">{issue.description}</div>
                  <div>
                    <span className="font-semibold">Category:</span> {issue.category}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span> {issue.status}
                  </div>
                  {issue.imageURL && (
                    <img
                      src={
                        issue.imageURL.startsWith("http")
                          ? issue.imageURL
                          : `http://localhost:8080/${issue.imageURL.replace("\\", "/")}`
                      }
                      alt={issue.title}
                      className="h-16 mt-1 rounded"
                    />
                  )}
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default UserDashboard;
