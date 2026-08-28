import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./MyProgress.css";

function MyProgress() {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);

        // =========================================
        // GET COURSES
        // =========================================

        const { data: courseData, error: courseError } =
          await supabase
            .from("courses")
            .select("id, title")
            .eq("is_active", true);

        if (courseError) {
          console.error(
            "Courses fetch error:",
            courseError
          );
          return;
        }

        // =========================================
        // GET COURSE PROGRESS
        // =========================================

        const { data: progressData, error: progressError } =
          await supabase
            .from("course_progress")
            .select(
              "course_id, lesson_id, progress_percent, is_completed, updated_at"
            )
            .order("updated_at", {
              ascending: false,
            });

        if (progressError) {
          console.error(
            "Progress fetch error:",
            progressError
          );
          return;
        }

        console.log(
          "My Progress Courses:",
          courseData
        );

        console.log(
          "My Progress Data:",
          progressData
        );

        setCourses(courseData || []);
        setProgress(progressData || []);
      } catch (error) {
        console.error(
          "My Progress error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  // =========================================
  // CALCULATE OVERALL PROGRESS
  // =========================================

  const totalLessons = progress.length;

  const completedLessons =
    progress.filter(
      (item) => item.is_completed === true
    ).length;

  const overallProgress =
    totalLessons > 0
      ? Math.round(
          progress.reduce(
            (sum, item) =>
              sum +
              (item.progress_percent || 0),
            0
          ) / totalLessons
        )
      : 0;

  // =========================================
  // COURSES STARTED
  // =========================================

  const coursesStarted = courses.filter(
    (course) =>
      progress.some(
        (item) =>
          item.course_id === course.id
      )
  ).length;

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="my-progress-page">
        <div className="my-progress-header">
          <span>LEARN</span>

          <h1>My Progress</h1>

          <p>
            Loading your learning progress...
          </p>
        </div>
      </div>
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div className="my-progress-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="my-progress-header">

        <span>LEARN</span>

        <h1>My Progress</h1>

        <p>
          Track your overall learning progress.
        </p>

      </div>


      {/* =====================================
          MAIN PROGRESS
      ===================================== */}

      <div className="progress-section">

        <div className="progress-top">

          <div>

            <h2>
              Overall Learning Progress
            </h2>

            <p>
              Keep learning and complete your courses.
            </p>

          </div>

          <strong>
            {overallProgress}%
          </strong>

        </div>


        <div className="progress-bar">

          <div
            className="progress-fill"
            style={{
              width: `${overallProgress}%`,
            }}
          ></div>

        </div>

      </div>


      {/* =====================================
          SUMMARY
      ===================================== */}

      <div className="progress-summary">

        <div>

          <span>
            Courses Started
          </span>

          <strong>
            {coursesStarted}
          </strong>

        </div>


        <div>

          <span>
            Lessons Completed
          </span>

          <strong>
            {completedLessons}
          </strong>

        </div>


        <div>

          <span>
            Learning Time
          </span>

          <strong>
            Not tracked
          </strong>

        </div>

      </div>

    </div>
  );
}

export default MyProgress;