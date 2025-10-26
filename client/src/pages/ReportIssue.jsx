import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";
import { useNavigate } from "react-router-dom";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function LocationPicker({ setLocation }) {
  useMapEvents({
    click(e) {
      setLocation({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

const categories = [
  "Garbage",
  "Water Leak",
  "Road Safety",
  "Pothole",
  "Streetlight",
  "Other",
];

const ReportIssue = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: categories[0],
    image: null,
    latitude: 28.6448,
    longitude: 77.216721,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    setSearch(e.target.value);
    if (e.target.value.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          e.target.value
        )}`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      setSearchResults([]);
    }
    setSearching(false);
  };

  const handleResultClick = (place) => {
    setForm({
      ...form,
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
    });
    setSearch(place.display_name);
    setSearchResults([]);
  };

  const validate = () => {
    let errs = {};
    if (!form.title) errs.title = "Title is required";
    if (!form.description) errs.description = "Description is required";
    if (!form.category) errs.category = "Category is required";
    if (!form.image) errs.image = "Please upload an image";
    if (!form.latitude || !form.longitude)
      errs.location = "Location is required";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, image: file });
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const setLocation = ({ latitude, longitude }) => {
    setForm({ ...form, latitude, longitude });
  };

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm({
            ...form,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          handleSuccess("Location fetched!");
        },
        (err) => {
          handleError(
            "Unable to fetch location. Please allow location access in your browser."
          );
        }
      );
    } else {
      handleError("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);

    const data = new FormData();
    data.append("title", form.title);
    data.append("description", form.description);
    data.append("category", form.category);
    data.append("image", form.image);
    data.append("latitude", form.latitude);
    data.append("longitude", form.longitude);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:8080/api/issues/", {
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      console.log(result);
      if (res.ok) {
        handleSuccess("issue reported successfully");
        setTimeout(() => {
          navigate("/user/dashboard");
        }, [1000]);
        // Optional: Reset form or redirect
        setForm({
          title: "",
          description: "",
          category: categories[0],
          image: null,
          latitude: 28.6448,
          longitude: 77.216721,
        });
      }
    } catch (err) {
      handleError(err);
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow mt-8 relative">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Report Civic Issue
      </h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        encType="multipart/form-data"
      >
        <div>
          <label className="block font-semibold mb-1">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className={`w-full p-2 border rounded ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold mb-1">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1">
            Upload or Capture Image
          </label>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            className="w-full"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="preview"
              className="mt-2 h-32 rounded shadow"
            />
          )}
          {errors.image && (
            <p className="text-red-500 text-sm">{errors.image}</p>
          )}
          <p className="text-gray-500 text-xs">
            You can select an image or take a photo from your mobile camera.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDetectLocation}
          className="mb-2 p-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Use My Current Location
        </button>

        <div className="h-64 rounded overflow-hidden">
          <MapContainer
            center={[form.latitude, form.longitude]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationPicker setLocation={setLocation} />
            <Marker position={[form.latitude, form.longitude]} />
          </MapContainer>
        </div>
        <p className="mt-1 text-gray-600 text-sm">
          Tap on the map to choose location.
        </p>

        <div>
          <label className="block font-semibold mb-1">Search Location</label>
          <input
            type="text"
            placeholder="Type and select a location..."
            value={search}
            onChange={handleSearch}
            className="w-full p-2 border rounded"
          />

          {searching && (
            <div className="text-gray-500 text-sm">Searching...</div>
          )}

          {searchResults.length > 0 && (
            <ul className="border rounded bg-white absolute z-20 w-full max-h-48 overflow-y-auto shadow">
              {searchResults.map((result) => (
                <li
                  key={result.place_id}
                  onClick={() => handleResultClick(result)}
                  className="px-3 py-2 hover:bg-blue-500 hover:text-white cursor-pointer text-sm"
                >
                  {result.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {errors.location && (
          <p className="text-red-500 text-sm">{errors.location}</p>
        )}

        {errors.submit && (
          <p className="text-red-500 text-center">{errors.submit}</p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700 transition"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Report Issue"}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default ReportIssue;
