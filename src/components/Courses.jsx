import { useEffect, useState } from "react";
import "./Courses.css";
import { supabase } from "../lib/supabaseClient";
import CourseLearning from "./CourseLearning";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =========================================
  // FETCH COURSES FROM SUPABASE
  // =========================================

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("courses")
        .select(`
          id,
          title,
          category,
          icon,
          description,
          display_order,
          is_active,
          course_sections (
            id,
            title,
            display_order,
            is_active,
            course_modules (
              id,
              title,
              description,
              display_order,
              is_active
            )
          )
        `)
        .eq("is_active", true)
        .order("display_order", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Courses fetch error:",
          error
        );

        setCourses([]);
        setError(
          "Unable to load courses. Please try again."
        );

        setLoading(false);
        return;
      }

      console.log(
        "Courses from Supabase:",
        data
      );

      // =========================================
      // FORMAT COURSE DATA
      // =========================================

      const formattedCourses = (data || [])
        .map((course) => {
          const sections = (course.course_sections || [])
            .filter(
              (section) =>
                section.is_active
            )
            .sort(
              (a, b) =>
                a.display_order -
                b.display_order
            )
            .map((section) => {
              const modules = (
                section.course_modules || []
              )
                .filter(
                  (module) =>
                    module.is_active
                )
                .sort(
                  (a, b) =>
                    a.display_order -
                    b.display_order
                );

              return {
                ...section,
                modules,
              };
            });

          return {
            ...course,
            sections,
          };
        })
        .sort(
          (a, b) =>
            a.display_order -
            b.display_order
        );

      setCourses(formattedCourses);
      setLoading(false);
    };

    fetchCourses();
  }, []);

  // =========================================
  // OPEN COURSE
  // =========================================

  const handleStartLearning = (course) => {
    setSelectedCourse(course);
  };

  // =========================================
  // BACK TO COURSES
  // =========================================

  const handleBackToCourses = () => {
    setSelectedCourse(null);
  };

  // =========================================
  // COURSE LEARNING PAGE
  // =========================================

  if (selectedCourse) {
    return (
      <CourseLearning
        course={selectedCourse}
        onBack={handleBackToCourses}
      />
    );
  }

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <section className="courses-page">

        <div className="courses-heading">
          <h1>
            Explore Courses
          </h1>

          <p>
            Learn programming and technology
            step by step with EDUVANTA.
          </p>
        </div>

        <div className="courses-loading">
          <p>
            Loading courses...
          </p>
        </div>

      </section>
    );
  }

  // =========================================
  // ERROR
  // =========================================

  if (error) {
    return (
      <section className="courses-page">

        <div className="courses-heading">
          <h1>
            Explore Courses
          </h1>

          <p>
            Learn programming and technology
            step by step with EDUVANTA.
          </p>
        </div>

        <div className="courses-error">
          <p>{error}</p>
        </div>

      </section>
    );
  }

  // =========================================
  // NO COURSES
  // =========================================

  if (courses.length === 0) {
    return (
      <section className="courses-page">

        <div className="courses-heading">
          <h1>
            Explore Courses
          </h1>

          <p>
            Learn programming and technology
            step by step with EDUVANTA.
          </p>
        </div>

        <div className="courses-empty">
          <p>
            No courses available.
          </p>
        </div>

      </section>
    );
  }

  // =========================================
  // COURSES UI
  // =========================================

  return (
    <section className="courses-page">

      {/* =====================================
          PAGE HEADING
      ===================================== */}

      <div className="courses-heading">

        <h1>
          Explore Courses
        </h1>

        <p>
          Learn programming and technology
          step by step with EDUVANTA.
        </p>

      </div>


      {/* =====================================
          COURSE GRID
      ===================================== */}

      <div className="courses-grid">

        {courses.map((course) => {

          // -----------------------------------
          // COURSE STATS
          // -----------------------------------

          const sectionCount =
            course.sections?.length || 0;

          const moduleCount =
            course.sections?.reduce(
              (total, section) =>
                total +
                (section.modules?.length || 0),
              0
            ) || 0;

          return (

            <article
              className="course-card"
              key={course.id}
            >

              {/* =================================
                  COURSE ICON
              ================================= */}

              <div className="course-icon">
                {course.icon}
              </div>


              {/* =================================
                  CATEGORY
              ================================= */}

              {course.category && (
                <span className="course-category">
                  {course.category}
                </span>
              )}


              {/* =================================
                  TITLE
              ================================= */}

              <h2>
                {course.title}
              </h2>


              {/* =================================
                  DESCRIPTION
              ================================= */}

              <p className="course-description">
                {course.description}
              </p>


              {/* =================================
                  COURSE STATS
              ================================= */}

              <div className="course-stats">

                <span>
                  {sectionCount} Sections
                </span>

                <span>
                  {moduleCount} Modules
                </span>

              </div>


              {/* =================================
                  SECTIONS + MODULES
              ================================= */}

              <div className="course-sections">

                {course.sections?.map(
                  (section) => (

                    <div
                      className="course-section"
                      key={section.id}
                    >

                      <h3>
                        {section.title}
                      </h3>

                      <div className="module-list">

                        {section.modules?.map(
                          (module) => (

                            <span
                              className="module-item"
                              key={module.id}
                            >
                              {module.title}
                            </span>

                          )
                        )}

                      </div>

                    </div>

                  )
                )}

              </div>


              {/* =================================
                  START LEARNING
              ================================= */}

              <button
                className="start-learning-btn"
                onClick={() =>
                  handleStartLearning(course)
                }
              >
                Start Learning →
              </button>

            </article>

          );
        })}

      </div>

    </section>
  );
}

export default Courses;