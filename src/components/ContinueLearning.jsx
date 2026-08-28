import { useEffect, useState } from "react";
import "./ContinueLearning.css";
import { supabase } from "../lib/supabaseClient";

function ContinueLearning() {
  const [courses, setCourses] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentLessons, setCurrentLessons] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const [progressData, setProgressData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Courses error:", error);
      setLoading(false);
      return;
    }

    setCourses(data || []);

    await loadProgress(data || []);

    setLoading(false);
  }

  async function loadProgress(courseList) {
    const courseIds = courseList.map((course) => course.id);

    if (courseIds.length === 0) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not logged in");
      return;
    }

    const { data, error } = await supabase
      .from("course_progress")
      .select("*")
      .eq("user_id", user.id)
      .in("course_id", courseIds)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Progress error:", error);
      return;
    }

    const progressMap = {};

    courseList.forEach((course) => {
      const courseProgress = (data || []).filter(
        (item) => item.course_id === course.id
      );

      if (courseProgress.length === 0) {
        progressMap[course.id] = {
          percent: 0,
          lessonId: null,
        };
      } else {
        const latest = courseProgress[0];

        progressMap[course.id] = {
          percent: latest.progress_percent,
          lessonId: latest.lesson_id,
        };
      }
    });

    setProgressData(progressMap);
  }

  async function handleContinue(courseId) {
    setCurrentCourseId(courseId);

    const { data: sections, error: sectionError } = await supabase
      .from("course_sections")
      .select("id, title, display_order")
      .eq("course_id", courseId)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (sectionError) {
      console.error("Sections error:", sectionError);
      return;
    }

    if (!sections || sections.length === 0) {
      alert("No sections found.");
      return;
    }

    const sectionId = sections[0].id;

    const { data: modules, error: moduleError } = await supabase
      .from("course_modules")
      .select("id, title, display_order")
      .eq("section_id", sectionId)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (moduleError) {
      console.error("Modules error:", moduleError);
      return;
    }

    if (!modules || modules.length === 0) {
      alert("No modules found.");
      return;
    }

    const moduleId = modules[0].id;

    const { data: topics, error: topicError } = await supabase
      .from("course_topics")
      .select("id, title, display_order")
      .eq("module_id", moduleId)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (topicError) {
      console.error("Topics error:", topicError);
      return;
    }

    if (!topics || topics.length === 0) {
      alert("No topics found.");
      return;
    }

    const topicId = topics[0].id;

    const { data: lessons, error: lessonError } = await supabase
      .from("course_lessons")
      .select("*")
      .eq("topic_id", topicId)
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (lessonError) {
      console.error("Lessons error:", lessonError);
      return;
    }

    if (!lessons || lessons.length === 0) {
      alert("No lessons found.");
      return;
    }

    setCurrentLessons(lessons);

    const savedProgress = progressData[courseId];

    let startIndex = 0;

    if (savedProgress?.lessonId) {
      const savedIndex = lessons.findIndex(
        (lesson) => lesson.id === savedProgress.lessonId
      );

      if (savedIndex !== -1) {
        startIndex = savedIndex;
      }
    }

    setCurrentLessonIndex(startIndex);
    setSelectedLesson(lessons[startIndex]);
  }

  async function saveProgress(lesson, courseId, index) {
    const totalLessons = currentLessons.length;

    if (totalLessons === 0) return;

    const percent = Math.round(
      ((index + 1) / totalLessons) * 100
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("❌ User not logged in");
      return;
    }

    console.log("👤 Current User:", user.id);

    const completed = index === totalLessons - 1;

    const { error: progressError } = await supabase
      .from("course_progress")
      .upsert(
        {
          user_id: user.id,
          course_id: courseId,
          lesson_id: lesson.id,
          progress_percent: percent,
          is_completed: completed,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,course_id,lesson_id",
        }
      );

    if (progressError) {
      console.error(
        "❌ Save progress error:",
        progressError
      );
      return;
    }

    console.log(
      "✅ Progress saved:",
      percent + "%"
    );

    setProgressData((prev) => ({
      ...prev,
      [courseId]: {
        percent,
        lessonId: lesson.id,
      },
    }));
  }

  async function handleNextLesson() {
    const currentLesson = currentLessons[currentLessonIndex];

    await saveProgress(
      currentLesson,
      currentCourseId,
      currentLessonIndex
    );

    const nextIndex = currentLessonIndex + 1;

    if (nextIndex >= currentLessons.length) {
      alert("You completed all lessons in this topic! 🎉");
      return;
    }

    setCurrentLessonIndex(nextIndex);
    setSelectedLesson(currentLessons[nextIndex]);
  }

  async function handleBackToCourses() {
    if (selectedLesson && currentCourseId) {
      await saveProgress(
        selectedLesson,
        currentCourseId,
        currentLessonIndex
      );
    }

    setSelectedLesson(null);
    setCurrentLessons([]);
    setCurrentLessonIndex(0);
    setCurrentCourseId(null);

    await loadProgress(courses);
  }

  if (loading) {
    return (
      <div className="continue-learning-page">
        <div className="continue-learning-header">
          <span>LEARN</span>
          <h1>Continue Learning</h1>
          <p>Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (selectedLesson) {
    const isLastLesson =
      currentLessonIndex === currentLessons.length - 1;

    return (
      <div className="continue-learning-page">

        <div className="continue-learning-header">
          <span>LESSON</span>

          <h1>{selectedLesson.title}</h1>

          <p>{selectedLesson.type}</p>
        </div>

        <div className="lesson-content">

          <h2>{selectedLesson.title}</h2>

          <p>{selectedLesson.content}</p>

          <div className="lesson-navigation">

            <button onClick={handleBackToCourses}>
              ← Back to Courses
            </button>

            {!isLastLesson && (
              <button onClick={handleNextLesson}>
                Next Lesson →
              </button>
            )}

            {isLastLesson && (
              <button onClick={handleNextLesson}>
                Complete Lesson ✓
              </button>
            )}

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="continue-learning-page">

      <div className="continue-learning-header">
        <span>LEARN</span>

        <h1>Continue Learning</h1>

        <p>
          Continue your courses from where you left off.
        </p>
      </div>

      <div className="continue-course-list">

        {courses.map((course) => {

          const progress =
            progressData[course.id]?.percent || 0;

          return (
            <div
              className="continue-course-card"
              key={course.id}
            >

              <div className="continue-course-info">

                <div className="continue-course-icon">
                  {course.icon}
                </div>

                <div className="continue-course-details">

                  <h2>{course.title}</h2>

                  <p>{course.description}</p>

                  <div className="continue-progress">

                    <div className="continue-progress-bar">

                      <div
                        className="continue-progress-fill"
                        style={{
                          width: `${progress}%`,
                        }}
                      ></div>

                    </div>

                    <span>{progress}%</span>

                  </div>

                </div>

              </div>

              <div className="continue-course-action">

                <p>
                  {progress === 0
                    ? "Start this course"
                    : `${progress}% completed`}
                </p>

                <button
                  onClick={() =>
                    handleContinue(course.id)
                  }
                >
                  Continue
                </button>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default ContinueLearning;