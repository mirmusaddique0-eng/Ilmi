
import "./Pages.css";

function About() {
  return (
    <section className="info-page about-page">

      {/* =========================================
          ABOUT HEADER
      ========================================= */}

      <div className="info-page-header">

        <h1>About Ilmi</h1>

        <p>
          A simple learning platform designed to help
          students learn, practice, build and grow.
        </p>

      </div>


      {/* =========================================
          ABOUT CONTENT
      ========================================= */}

      <div className="about-content">

        <div className="about-section">

          <h2>What is Ilmi?</h2>

          <p>
            Ilmi is a student-focused learning platform
            created to make programming and technical
            education easier and more accessible.
          </p>

          <p>
            It brings learning resources, courses,
            college syllabus, practice questions,
            quizzes and projects together in one place.
          </p>

        </div>


        <div className="about-section">

          <h2>Learn. Practice. Build. Grow.</h2>

          <p>
            With Ilmi, students can explore programming
            courses, learn concepts, practice their
            knowledge, build projects and follow useful
            learning roadmaps.
          </p>

        </div>


        <div className="about-section">

          <h2>What You Can Find on Ilmi</h2>

          <ul>

            <li>
              Programming courses and tutorials
            </li>

            <li>
              College syllabus and learning content
            </li>

            <li>
              Practice questions and quizzes
            </li>

            <li>
              Projects, practice projects and challenges
            </li>

            <li>
              Development roadmaps and learning resources
            </li>

            <li>
              Learning progress tracking
            </li>

          </ul>

        </div>


        <div className="about-section">

          <h2>Our Goal</h2>

          <p>
            Our goal is to provide students with a
            straightforward learning environment where
            they can improve their technical skills,
            practice what they learn and become more
            confident in building real projects.
          </p>

        </div>

      </div>

    </section>
  );
}

export default About;

