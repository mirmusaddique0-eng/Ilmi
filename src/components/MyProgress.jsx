import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./MyProgress.css";

function MyProgress() {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState([]);

  const [totalLessons, setTotalLessons] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [learningTimeSeconds, setLearningTimeSeconds] = useState(0);

  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOAD PROGRESS
  // =========================================================

  useEffect(() => {
    fetchProgress();
  }, []);

  async function fetchProgress() {
    try {
      setLoading(true);

      // =====================================================
      // 1. GET CURRENT USER
      // =====================================================

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("User error:", userError);
        return;
      }

      if (!user) {
        console.error("User not logged in");
        return;
      }

      console.log("My Progress User:", user.id);

      // =====================================================
      // 2. GET ACTIVE COURSES
      // =====================================================

      const {
        data: courseData,
        error: courseError,
      } = await supabase
        .from("courses")
        .select("id, title")
        .eq("is_active", true)
        .order("display_order", {
          ascending: true,
        });

      if (courseError) {
        console.error(
          "Courses fetch error:",
          courseError
        );
        return;
      }

      const courseList = courseData || [];

      setCourses(courseList);

      console.log(
        "My Progress Courses:",
        courseList
      );

      if (courseList.length === 0) {
        setProgress([]);
        setTotalLessons(0);
        setCompletedLessons(0);
        setLearningTimeSeconds(0);
        return;
      }

      const courseIds = courseList.map(
        (course) => course.id
      );

      // =====================================================
      // 3. GET USER COURSE PROGRESS
      // =====================================================

      const {
        data: progressData,
        error: progressError,
      } = await supabase
        .from("course_progress")
        .select(
          `
          course_id,
          lesson_id,
          is_completed,
          learning_time_seconds,
          updated_at
          `
        )
        .eq("user_id", user.id)
        .in("course_id", courseIds)
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

      const progressList = progressData || [];

      setProgress(progressList);

      console.log(
        "My Progress Data:",
        progressList
      );

      // =====================================================
      // 4. COURSES STARTED
      // =====================================================

      const startedCourseIds = new Set();

      progressList.forEach((item) => {
        if (item.course_id) {
          startedCourseIds.add(item.course_id);
        }
      });

      console.log(
        "Courses Started:",
        startedCourseIds.size
      );

      // =====================================================
      // 5. GET ACTIVE SECTIONS
      // =====================================================

      const {
        data: sections,
        error: sectionError,
      } = await supabase
        .from("course_sections")
        .select("id, course_id")
        .in("course_id", courseIds)
        .eq("is_active", true);

      if (sectionError) {
        console.error(
          "Sections fetch error:",
          sectionError
        );
        return;
      }

      const sectionList = sections || [];

      // =====================================================
      // 6. GET ACTIVE MODULES
      // =====================================================

      let moduleList = [];

      if (sectionList.length > 0) {
        const sectionIds = sectionList.map(
          (section) => section.id
        );

        const {
          data: modules,
          error: moduleError,
        } = await supabase
          .from("course_modules")
          .select("id, section_id")
          .in("section_id", sectionIds)
          .eq("is_active", true);

        if (moduleError) {
          console.error(
            "Modules fetch error:",
            moduleError
          );
          return;
        }

        moduleList = modules || [];
      }

      // =====================================================
      // 7. GET ACTIVE TOPICS
      // =====================================================

      let topicList = [];

      if (moduleList.length > 0) {
        const moduleIds = moduleList.map(
          (module) => module.id
        );

        const {
          data: topics,
          error: topicError,
        } = await supabase
          .from("course_topics")
          .select("id, module_id")
          .in("module_id", moduleIds)
          .eq("is_active", true);

        if (topicError) {
          console.error(
            "Topics fetch error:",
            topicError
          );
          return;
        }

        topicList = topics || [];
      }

      // =====================================================
      // 8. GET PUBLISHED LESSONS
      // =====================================================

      let lessonList = [];

      if (topicList.length > 0) {
        const topicIds = topicList.map(
          (topic) => topic.id
        );

        const {
          data: lessons,
          error: lessonError,
        } = await supabase
          .from("course_lessons")
          .select("id, topic_id")
          .in("topic_id", topicIds)
          .eq("is_published", true);

        if (lessonError) {
          console.error(
            "Lessons fetch error:",
            lessonError
          );
          return;
        }

        lessonList = lessons || [];
      }

      // =====================================================
      // 9. TOTAL REAL LESSONS
      // =====================================================

      const totalLessonCount =
        lessonList.length;

      setTotalLessons(totalLessonCount);

      console.log(
        "Total Published Lessons:",
        totalLessonCount
      );

      // =====================================================
      // 10. VALID LESSON IDS
      // =====================================================

      const validLessonIds = new Set(
        lessonList.map(
          (lesson) => lesson.id
        )
      );

      // =====================================================
      // 11. UNIQUE COMPLETED LESSONS
      // =====================================================

      const completedLessonIds = new Set();

      progressList.forEach((item) => {
        if (
          item.is_completed === true &&
          item.lesson_id &&
          validLessonIds.has(item.lesson_id)
        ) {
          completedLessonIds.add(
            item.lesson_id
          );
        }
      });

      const completedLessonCount =
        completedLessonIds.size;

      setCompletedLessons(
        completedLessonCount
      );

      console.log(
        "Completed Lessons:",
        completedLessonCount
      );

      // =====================================================
      // 12. REAL LEARNING TIME
      // =====================================================

      const realLearningTime =
        calculateLearningTime(
          progressList
        );

      setLearningTimeSeconds(
        realLearningTime
      );

      console.log(
        "Learning Time Seconds:",
        realLearningTime
      );

      console.log(
        "Learning Time:",
        formatLearningTime(
          realLearningTime
        )
      );

      // =====================================================
      // DEBUG
      // =====================================================

      console.log(
        "================================="
      );

      console.log(
        "TOTAL LESSONS:",
        totalLessonCount
      );

      console.log(
        "COMPLETED LESSONS:",
        completedLessonCount
      );

      console.log(
        "COURSES STARTED:",
        startedCourseIds.size
      );

      console.log(
        "LEARNING TIME:",
        realLearningTime,
        "seconds"
      );

      console.log(
        "OVERALL PROGRESS:",
        totalLessonCount > 0
          ? Math.round(
              (completedLessonCount /
                totalLessonCount) *
                100
            )
          : 0,
        "%"
      );

      console.log(
        "================================="
      );

    } catch (error) {
      console.error(
        "My Progress error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // CALCULATE REAL LEARNING TIME
  // =========================================================

  function calculateLearningTime(progressList) {
    const lessonTimeMap = new Map();

    progressList.forEach((item) => {
      if (!item.lesson_id) {
        return;
      }

      const seconds =
        Number(
          item.learning_time_seconds
        ) || 0;

      // Keep latest record for each lesson
      if (
        !lessonTimeMap.has(
          item.lesson_id
        )
      ) {
        lessonTimeMap.set(
          item.lesson_id,
          seconds
        );
      }
    });

    let totalSeconds = 0;

    lessonTimeMap.forEach(
      (seconds) => {
        totalSeconds += seconds;
      }
    );

    return totalSeconds;
  }

  // =========================================================
  // FORMAT LEARNING TIME
  // =========================================================

  function formatLearningTime(totalSeconds) {
    const seconds = Math.max(
      0,
      Number(totalSeconds) || 0
    );

    const hours = Math.floor(
      seconds / 3600
    );

    const minutes = Math.floor(
      (seconds % 3600) / 60
    );

    const remainingSeconds =
      Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    return `${remainingSeconds}s`;
  }

  // =========================================================
  // COURSES STARTED
  // =========================================================

  const startedCourseIds =
    new Set(
      progress
        .filter(
          (item) => item.course_id
        )
        .map(
          (item) => item.course_id
        )
    );

  const coursesStarted =
    courses.filter(
      (course) =>
        startedCourseIds.has(
          course.id
        )
    ).length;

  // =========================================================
  // REAL OVERALL PROGRESS
  // =========================================================

  const overallProgress =
    totalLessons > 0
      ? Math.min(
          100,
          Math.round(
            (completedLessons /
              totalLessons) *
              100
          )
        )
      : 0;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="my-progress-page">

        <div className="my-progress-header">

          <span>
            LEARN
          </span>

          <h1>
            My Progress
          </h1>

          <p>
            Loading your learning progress...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="my-progress-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="my-progress-header">

        <span>
          LEARN
        </span>

        <h1>
          My Progress
        </h1>

        <p>
          Track your overall learning progress.
        </p>

      </div>


      {/* ===================================================
          OVERALL PROGRESS
      =================================================== */}

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


      {/* ===================================================
          SUMMARY
      =================================================== */}

      <div className="progress-summary">

        {/* COURSES STARTED */}

        <div>

          <span>
            Courses Started
          </span>

          <strong>
            {coursesStarted}
          </strong>

        </div>


        {/* LESSONS COMPLETED */}

        <div>

          <span>
            Lessons Completed
          </span>

          <strong>
            {completedLessons}
          </strong>

        </div>


        {/* LEARNING TIME */}

        <div>

          <span>
            Learning Time
          </span>

          <strong>
            {formatLearningTime(
              learningTimeSeconds
            )}
          </strong>

        </div>

      </div>

    </div>
  );
}

export default MyProgress;