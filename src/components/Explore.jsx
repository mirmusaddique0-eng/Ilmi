import "./Explore.css";

function Explore({ setCurrentPage }) {
  return (
    <section className="explore-page">

      <div className="explore-header">
        <h1>Explore EDUVANTA</h1>

        <p>
          Discover courses, programming languages,
          and your college syllabus.
        </p>
      </div>

      <div className="explore-grid">

        {/* =====================================
            COURSES
        ===================================== */}

        <div className="explore-card">

          <div className="explore-icon">
            📚
          </div>

          <h2>
            Courses
          </h2>

          <p>
            Learn programming and technology
            through structured courses.
          </p>

          <button
            type="button"
            onClick={() =>
              setCurrentPage("courses")
            }
          >
            Explore Courses →
          </button>

        </div>


        {/* =====================================
            COLLEGE SYLLABUS
        ===================================== */}

        <div className="explore-card">

          <div className="explore-icon">
            🎓
          </div>

          <h2>
            College Syllabus
          </h2>

          <p>
            Study your college subjects unit by
            unit with topics and explanations.
          </p>

          <button
  onClick={() => setCurrentPage("college-syllabus")}
>
  Explore Syllabus
</button>

        </div>

      </div>

    </section>
  );
}

export default Explore;