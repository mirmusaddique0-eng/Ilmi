import "./Build.css";

function Build({ setCurrentPage }) {
  return (
    <div className="build-page">

      {/* HEADER */}
      <div className="build-header">
        <span className="build-label">BUILD</span>

        <h1>Build Your Skills</h1>

        <p>
          Turn what you learn into practical projects and coding experience.
        </p>
      </div>


      {/* PROJECTS */}
      <section className="build-section">

        <div className="build-section-content">

          <div className="build-icon">
            🛠️
          </div>

          <div>
            <h2>Projects</h2>

            <p>
              Build real-world projects using the technologies you are learning.
            </p>

            <div className="build-meta">
              <span>Real Projects</span>
              <span>Beginner → Advanced</span>
            </div>
          </div>

        </div>

        <button
          className="build-action-btn"
          onClick={() => setCurrentPage("projects")}
        >
          Explore Projects →
        </button>

      </section>


      {/* PRACTICE PROJECTS */}
      <section className="build-section">

        <div className="build-section-content">

          <div className="build-icon">
            💻
          </div>

          <div>
            <h2>Practice Projects</h2>

            <p>
              Improve your skills by building small practical projects and tasks.
            </p>

            <div className="build-meta">
              <span>Hands-on Practice</span>
              <span>Skill Based</span>
            </div>
          </div>

        </div>

        <button
          className="build-action-btn"
          onClick={() => setCurrentPage("practice-projects")}
        >
          Start Practice →
        </button>

      </section>


      {/* CHALLENGES */}
      <section className="build-section">

        <div className="build-section-content">

          <div className="build-icon">
            🧩
          </div>

          <div>
            <h2>Challenges</h2>

            <p>
              Test your knowledge with coding problems and practical challenges.
            </p>

            <div className="build-meta">
              <span>Coding Problems</span>
              <span>Multiple Levels</span>
            </div>
          </div>

        </div>

        <button
          className="build-action-btn"
          onClick={() => setCurrentPage("challenges")}
        >
          Solve Challenges →
        </button>

      </section>

    </div>
  );
}

export default Build;