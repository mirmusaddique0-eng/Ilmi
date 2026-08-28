import { useState } from "react";
import "./Grow.css";
import Roadmaps from "./Roadmaps";

function Grow({ setCurrentPage }) {
  const [showRoadmap, setShowRoadmap] = useState(false);

  if (showRoadmap) {
  return <Roadmaps />;
}

  return (
    <div className="grow-page">

      {/* HEADER */}
      <div className="grow-header">
        <span className="grow-label">GROW</span>

        <h1>Grow Your Knowledge</h1>

       
      </div>

      {/* ROADMAPS */}
      <section className="grow-section">

        <div className="grow-section-content">

          <div className="grow-icon">
            🗺️
          </div>

          <div>
            <h2>Roadmaps</h2>

            <p>
              Follow structured learning paths to reach your goals.
            </p>

            <div className="grow-meta">
              <span>Learning Paths</span>
              <span>Skill Based</span>
            </div>
          </div>

        </div>

        <button
          className="grow-action-btn"
          onClick={() => setShowRoadmap(true)}
        >
          Explore Roadmaps →
        </button>

      </section>

      {/* RESOURCES */}
      <section className="grow-section">

        <div className="grow-section-content">

          <div className="grow-icon">
            📚
          </div>

          <div>
            <h2>Resources</h2>

            <p>
              Find useful documentation, tutorials and learning resources.
            </p>

            <div className="grow-meta">
              <span>Documentation</span>
              <span>Learning Tools</span>
            </div>
          </div>

        </div>

        <button
          className="grow-action-btn"
          onClick={() => setCurrentPage("resources")}
        >
          Explore Resources →
        </button>

      </section>

      {/* ACHIEVEMENTS */}
    
        

          
          

        </div>

        

     
  );
}

export default Grow;