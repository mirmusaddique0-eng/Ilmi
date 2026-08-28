import "./Learn.css";

function Learn({ setCurrentPage }) {
  return (
    <div className="learn-page">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="learn-header">
        <div>
          <span className="learn-label">LEARNING</span>

          <h1>Learn</h1>

          <p>
            Continue your learning journey and improve your skills.
          </p>
        </div>
      </div>


      {/* =========================
          LEARNING CARDS
      ========================= */}

      <div className="learn-grid">

        {/* =========================
            CONTINUE LEARNING
        ========================= */}

        <div className="learn-card">

          <div className="learn-card-icon">
            📖
          </div>

          <div className="learn-card-content">

            <h2>
              Continue Learning
            </h2>

            <p>
              Pick up where you left off and continue your courses.
            </p>

            <button
              className="learn-card-btn"
              onClick={() => setCurrentPage("continue-learning")}
            >
              Continue Learning
            </button>

          </div>

        </div>


        {/* =========================
            MY PROGRESS
        ========================= */}

        <div className="learn-card">

          <div className="learn-card-icon">
            📊
          </div>

          <div className="learn-card-content">

            <h2>
              My Progress
            </h2>

            <p>
              Track your course progress and see how much you have learned.
            </p>

            <button
              className="learn-card-btn"
              onClick={() => setCurrentPage("my-progress")}
            >
              View Progress
            </button>

          </div>

        </div>


        {/* =========================
            PRACTICE & QUIZZES
        ========================= */}

        <div className="learn-card">

          <div className="learn-card-icon">
            📝
          </div>

          <div className="learn-card-content">

            <h2>
              Practice & Quizzes
            </h2>

            <p>
              Practice what you have learned and test your knowledge.
            </p>

            <button
              className="learn-card-btn"
              onClick={() => setCurrentPage("practice-quizzes")}
            >
              Start Practice
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Learn;