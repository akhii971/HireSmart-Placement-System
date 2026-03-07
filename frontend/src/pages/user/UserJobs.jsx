import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "../../redux/user/notificationsSlice";
import { fetchJobs } from "../../redux/recruiter/jobsSlice";
import { useNavigate } from "react-router-dom";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// ================= CITY COORDS =================
const cityCoords = {
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  mumbai: [19.076, 72.8777],
  chennai: [13.0827, 80.2707],
  hyderabad: [17.385, 78.4867],
  delhi: [28.6139, 77.209],
  pune: [18.5204, 73.8567],
  kochi: [9.9312, 76.2673],
  trivandrum: [8.5241, 76.9366],
  kozhikode: [11.2588, 75.7804],
};

// ================= HELPERS =================
const getCoordsFromLocation = (location) => {
  if (!location) return null;
  const key = location.toLowerCase().trim();
  return cityCoords[key] || null;
};

// ================= MAP AUTO FOCUS =================
function MapAutoFocus({ location }) {
  const map = useMap();

  useEffect(() => {
    if (!location) return;
    const coords = getCoordsFromLocation(location);
    if (coords) {
      map.flyTo(coords, 11, { duration: 1.5 });
    }
  }, [location, map]);

  return null;
}

// ================= COMPONENT =================
export default function UserJobs() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { jobs, loading } = useSelector((state) => state.jobs);

  const [searchText, setSearchText] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [view, setView] = useState("list"); // list | map
  const [savedJobs, setSavedJobs] = useState([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [alertedJobIds, setAlertedJobIds] = useState([]);

  // Fetch jobs on mount
  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  // Load saved jobs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedJobs");
    if (saved) setSavedJobs(JSON.parse(saved));
  }, []);

  // Save / Unsave with Notification
  const toggleSave = (job) => {
    setSavedJobs((prev) => {
      const isSaved = prev.includes(job._id);
      let updated;

      if (isSaved) {
        dispatch(
          addNotification({
            type: "jobs",
            message: `Removed from saved: ${job.title}`,
          })
        );
        updated = prev.filter((id) => id !== job._id);
      } else {
        dispatch(
          addNotification({
            type: "jobs",
            message: `Job saved: ${job.title} at ${job.company}`,
          })
        );
        updated = [...prev, job._id];
      }

      localStorage.setItem("savedJobs", JSON.stringify(updated));
      return updated;
    });
  };

  // Simple recommendation logic (can replace with AI later)
  const isRecommended = (job) => {
    const text = `${job.title} ${job.skills?.join(" ") || ""}`.toLowerCase();
    return text.includes("react") || text.includes("mern");
  };

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return (jobs || [])
      .filter((job) => {
        const text = searchText.toLowerCase();
        const matchText =
          job.title.toLowerCase().includes(text) ||
          job.company.toLowerCase().includes(text);

        const matchLocation = searchLocation
          ? job.location?.toLowerCase().includes(searchLocation.toLowerCase())
          : true;

        const matchSaved = showSavedOnly ? savedJobs.includes(job._id) : true;

        return matchText && matchLocation && matchSaved;
      })
      .sort((a, b) => {
        const aRec = isRecommended(a);
        const bRec = isRecommended(b);
        if (aRec && !bRec) return -1;
        if (!aRec && bRec) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [jobs, searchText, searchLocation, showSavedOnly, savedJobs]);

  // Notify for recommended jobs once
  useEffect(() => {
    filteredJobs.forEach((job) => {
      const recommended = isRecommended(job);
      const alreadyAlerted = alertedJobIds.includes(job._id);

      if (recommended && !alreadyAlerted) {
        dispatch(
          addNotification({
            type: "jobs",
            message: `AI matched job: ${job.title} at ${job.company}`,
          })
        );
        setAlertedJobIds((prev) => [...prev, job._id]);
      }
    });
  }, [filteredJobs, alertedJobIds, dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4 md:p-6 pt-24">
      <div className="max-w-7xl mx-auto space-y-6 pb-24 mt-24">

        {/* ===== HEADER ===== */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Jobs & Internships
            </h1>
            <p className="text-slate-500">
              Find the best opportunities for you
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
                showSavedOnly
                  ? "bg-red-500 text-white"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {showSavedOnly ? "Showing Saved" : "Show Saved"}
            </button>

            <div className="flex bg-white rounded-full p-1 shadow border">
              <button
                onClick={() => setView("list")}
                className={`px-5 py-2 rounded-xl text-sm font-semibold ${
                  view === "list"
                    ? "bg-emerald-500 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                List
              </button>
              <button
                onClick={() => setView("map")}
                className={`px-5 py-2 rounded-xl text-sm font-semibold ${
                  view === "map"
                    ? "bg-emerald-500 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Map
              </button>
            </div>
          </div>
        </div>

        {/* ===== SEARCH ===== */}
        <div className="bg-white rounded-2xl p-4 shadow grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by job title or company..."
            className="border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="Search by location (e.g. Bangalore, Mumbai)..."
            className="border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* ===== LIST VIEW ===== */}
        {view === "list" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12 text-slate-500">
                Loading jobs...
              </div>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job, i) => {
                const isSaved = savedJobs.includes(job._id);
                const recommended = isRecommended(job);

                return (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl p-6 shadow border relative overflow-hidden"
                  >
                    {recommended && (
                      <span className="absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow">
                        🧠 Recommended
                      </span>
                    )}

                    <button
                      onClick={() => toggleSave(job)}
                      className="absolute top-4 right-4 text-xl text-red-500"
                    >
                      {isSaved ? <FaHeart /> : <FaRegHeart />}
                    </button>

                    <div className="mt-8">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {job.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {job.company} • {job.location}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{job.type}</p>

                      <div className="flex justify-between items-center mt-4">
                        <div className="text-xs text-slate-500">
                          👀 {job.views || 0} • 📄 {job.applications || 0}
                        </div>
                        <button
                          onClick={() => navigate(`/user/jobs/${job._id}`)}
                          className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 transition"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full text-center text-slate-500 py-12">
                No jobs found
              </div>
            )}
          </div>
        )}

        {/* ===== MAP VIEW ===== */}
        {view === "map" && (
          <div className="bg-white rounded-2xl shadow border overflow-hidden">
            <div className="h-[400px] md:h-[500px] w-full">
              <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                className="h-full w-full"
              >
                <MapAutoFocus location={searchLocation} />
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <MarkerClusterGroup>
                  {filteredJobs.map((job) => {
                    const coords = getCoordsFromLocation(job.location);
                    if (!coords) return null;

                    return (
                      <Marker key={job._id} position={coords}>
                        <Popup>
                          <div className="text-sm">
                            <strong>{job.title}</strong>
                            <p>{job.company}</p>
                            <p>{job.location}</p>
                            <button
                              onClick={() => navigate(`/user/jobs/${job._id}`)}
                              className="mt-2 px-3 py-1 rounded bg-emerald-500 text-white text-xs"
                            >
                              View
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MarkerClusterGroup>
              </MapContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}