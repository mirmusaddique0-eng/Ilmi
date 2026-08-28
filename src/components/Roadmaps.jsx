import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./FeaturePage.css";

function Roadmaps() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [roadmapContent, setRoadmapContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    const { data, error } = await supabase
      .from("roadmaps")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Roadmaps Error:", error);
      setLoading(false);
      return;
    }

    console.log("🔥 Roadmaps from Supabase:", data);
console.log("🔥 Roadmaps Error:", error);

    setRoadmaps(data || []);
    setLoading(false);
  };

  const openRoadmap = async (roadmap) => {
    setSelectedRoadmap(roadmap);
    setRoadmapContent(null);

    const { data, error } = await supabase
      .from("roadmap_content")
      .select("*")
      .eq("roadmap_id", roadmap.id)
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Roadmap Content Error:", error);
      return;
    }

    setRoadmapContent(data);
  };

  if (loading) {
    return (
      <div className="feature-page">
        <div className="feature-header">
          <span>GROW</span>
          <h1>Roadmaps</h1>
          <p>Loading roadmaps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feature-page">

      {/* HEADER */}
      <div className="feature-header">
        <span>GROW</span>

        <h1>
          {selectedRoadmap
            ? selectedRoadmap.title
            : "Roadmaps"}
        </h1>

        <p>
          {selectedRoadmap
            ? "Follow the complete roadmap and build your skills."
            : "Choose a roadmap and start your learning journey."}
        </p>
      </div>


      {/* ROADMAP LIST */}
      {!selectedRoadmap && (
        <div className="feature-content">

          <h2>Learning Paths</h2>

          <div className="feature-list">

            {roadmaps.map((roadmap) => (
              <button
                key={roadmap.id}
                className="feature-row roadmap-clickable"
                onClick={() => openRoadmap(roadmap)}
              >
                <strong>
                  {roadmap.icon} {roadmap.title}
                </strong>

                <span>
                  View Roadmap →
                </span>
              </button>
            ))}

          </div>

        </div>
      )}


     {/* ROADMAP CONTENT */}
{selectedRoadmap && (
  <div className="feature-content">

    {selectedRoadmap.image_url ? (
      <div className="roadmap-image-wrapper">
        <img
          src={selectedRoadmap.image_url}
          alt={`${selectedRoadmap.title} Roadmap`}
          className="roadmap-image"
        />
      </div>
    ) : (
      <div className="roadmap-empty">
        <h2>{selectedRoadmap.title} Roadmap</h2>

        <p>
          Roadmap content will be added soon.
        </p>
      </div>
    )}

  </div>
)}

    </div>
  );
}

export default Roadmaps;