import { useEffect, useState } from "react";
import "./FeaturePage.css";
import { supabase } from "../lib/supabaseClient";

function PracticeProjects() {
  const [projects, setProjects] = useState([]);
  const [phases, setPhases] = useState([]);
  const [contents, setContents] = useState([]);

  const [selectedProject, setSelectedProject] =
    useState(null);

  const [selectedPhase, setSelectedPhase] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] =
    useState(false);

  // =========================================
  // FETCH PRACTICE PROJECTS + PHASES
  // =========================================

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // PRACTICE PROJECTS
      const {
        data: projectData,
        error: projectError,
      } = await supabase
        .from("build_practice_projects")
        .select("*")
        .eq("is_active", true)
        .order("display_order", {
          ascending: true,
        });

      if (projectError) {
        console.error(
          "Practice projects fetch error:",
          projectError
        );

        setProjects([]);
        setLoading(false);
        return;
      }

      console.log(
        "Practice Projects from Supabase:",
        projectData
      );

      setProjects(projectData || []);

      // PHASES
      const {
        data: phaseData,
        error: phaseError,
      } = await supabase
        .from("build_practice_project_phases")
        .select("*")
        .eq("is_active", true)
        .order("display_order", {
          ascending: true,
        });

      if (phaseError) {
        console.error(
          "Practice project phases fetch error:",
          phaseError
        );

        setPhases([]);
        setLoading(false);
        return;
      }

      console.log(
        "Practice Project Phases from Supabase:",
        phaseData
      );

      setPhases(phaseData || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  // =========================================
  // GET PROJECT PHASES
  // =========================================

  const getProjectPhases = (projectId) => {
    return phases.filter(
      (phase) =>
        phase.practice_project_id === projectId
    );
  };

  // =========================================
  // LOAD PHASE CONTENT
  // =========================================

  const loadPhaseContent = async (
    project,
    phase
  ) => {
    setSelectedProject(project);
    setSelectedPhase(phase);

    setContentLoading(true);
    setContents([]);

    const {
      data,
      error,
    } = await supabase
      .from(
        "build_practice_project_phase_content"
      )
      .select("*")
      .eq("phase_id", phase.id)
      .eq("is_active", true)
      .order("display_order", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Practice project phase content error:",
        error
      );

      setContents([]);
      setContentLoading(false);
      return;
    }

    console.log(
      "Practice Project Phase Content from Supabase:",
      data
    );

    setContents(data || []);
    setContentLoading(false);
  };

  // =========================================
  // WHOLE PROJECT CLICK
  // =========================================

  const handleProjectClick = (project) => {
    const projectPhases =
      getProjectPhases(project.id);

    if (projectPhases.length === 0) {
      setSelectedProject(project);
      setSelectedPhase(null);
      setContents([]);
      return;
    }

    const learnPhase =
      projectPhases.find(
        (phase) =>
          phase.phase_name?.toLowerCase() ===
          "learn"
      ) || projectPhases[0];

    loadPhaseContent(
      project,
      learnPhase
    );
  };

  // =========================================
  // PHASE CLICK
  // =========================================

  const handlePhaseClick = (
    event,
    project,
    phase
  ) => {
    event.stopPropagation();

    loadPhaseContent(
      project,
      phase
    );
  };

  // =========================================
  // BACK
  // =========================================

  const handleBack = () => {
    setSelectedProject(null);
    setSelectedPhase(null);
    setContents([]);
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="feature-page">

        <div className="feature-header">
          <span>BUILD</span>

          <h1>
            Practice Projects
          </h1>

          <p>
            Strengthen your skills with small
            hands-on projects.
          </p>
        </div>

        <div className="feature-content">
          <p>
            Loading practice projects...
          </p>
        </div>

      </div>
    );
  }

  // =========================================
  // DETAIL PAGE
  // =========================================

  if (selectedProject) {
    return (
      <div className="feature-page">

        <div className="feature-header">

          <span>BUILD</span>

          <h1>
            {selectedProject.title}
          </h1>

          <p>
            {selectedProject.description}
          </p>

        </div>

        <div className="feature-content">

          <button
            className="practice-primary-btn"
            onClick={handleBack}
          >
            ← Back to Practice Projects
          </button>

          {/* PHASE BUTTONS */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "25px",
              marginBottom: "25px",
              flexWrap: "wrap",
            }}
          >

            {getProjectPhases(
              selectedProject.id
            ).map((phase) => (

              <button
                key={phase.id}
                onClick={() =>
                  loadPhaseContent(
                    selectedProject,
                    phase
                  )
                }
                style={{
                  padding: "8px 16px",
                  border:
                    selectedPhase?.id === phase.id
                      ? "1px solid #2563eb"
                      : "1px solid #ddd",
                  borderRadius: "8px",
                  background:
                    selectedPhase?.id === phase.id
                      ? "#eff6ff"
                      : "#fff",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >

                {selectedPhase?.id === phase.id
                  ? "✓ "
                  : ""}

                {phase.phase_name}

              </button>

            ))}

          </div>

          {/* PHASE DESCRIPTION */}

          {selectedPhase && (

            <div
              style={{
                marginBottom: "25px",
              }}
            >

              <h2>
                {selectedPhase.phase_name}
              </h2>

              <p>
                {selectedPhase.phase_description}
              </p>

            </div>

          )}

          {/* CONTENT */}

          {contentLoading ? (

            <div className="feature-row">
              <div>
                <p>
                  Loading content...
                </p>
              </div>
            </div>

          ) : contents.length === 0 ? (

            <div className="feature-row">

              <div>
                <h2>
                  Content Coming Soon
                </h2>

                <p>
                  Content for this phase will
                  be added from the Admin Panel.
                </p>
              </div>

            </div>

          ) : (

            contents.map((content) => (

              <div
                className="feature-row"
                key={content.id}
              >

                <div>

                  <h2>
                    {content.title}
                  </h2>

                  <p>
                    {content.content}
                  </p>

                </div>

              </div>

            ))

          )}

        </div>

      </div>
    );
  }

  // =========================================
  // MAIN LIST
  // =========================================

  return (
    <div className="feature-page">

      <div className="feature-header">

        <span>BUILD</span>

        <h1>
          Practice Projects
        </h1>

        <p>
          Strengthen your skills with small
          hands-on projects.
        </p>

      </div>

      <div className="feature-content">

        {projects.map((project) => {

          const projectPhases =
            getProjectPhases(project.id);

          return (

            <div
              className="feature-row"
              key={project.id}
              onClick={() =>
                handleProjectClick(project)
              }
              style={{
                cursor: "pointer",
              }}
            >

              <div>

                <h2>
                  {project.title}
                </h2>

                <p>
                  {project.description}
                </p>

                <span className="feature-tag">
                  {project.technologies}
                </span>

                {/* PHASE BUTTONS */}

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "15px",
                    flexWrap: "wrap",
                  }}
                >

                  {projectPhases.map(
                    (phase) => (

                      <button
                        key={phase.id}
                        onClick={(event) =>
                          handlePhaseClick(
                            event,
                            project,
                            phase
                          )
                        }
                        style={{
                          padding:
                            "6px 12px",
                          border:
                            "1px solid #ddd",
                          borderRadius:
                            "7px",
                          background:
                            "#fff",
                          cursor:
                            "pointer",
                          fontWeight:
                            "600",
                        }}
                      >
                        {phase.phase_name}
                      </button>

                    )
                  )}

                </div>

              </div>

              <span
                className={`difficulty ${
                  project.difficulty ===
                  "Beginner"
                    ? "beginner"
                    : project.difficulty ===
                      "Intermediate"
                    ? "intermediate"
                    : "advanced"
                }`}
              >
                {project.difficulty}
              </span>

            </div>

          );
        })}

      </div>

    </div>
  );
}

export default PracticeProjects;