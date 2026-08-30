import { useEffect, useRef, useState } from "react";
import "./ContinueLearning.css";
import { supabase } from "../lib/supabaseClient";

function ContinueLearning() {
  const [courses, setCourses] = useState([]);

  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentLessons, setCurrentLessons] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  const [currentCourseId, setCurrentCourseId] = useState(null);

  const [progressData, setProgressData] = useState({});
  const [courseStats, setCourseStats] = useState({});

  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);

  // =========================================================
  // LESSON TIMER
  // =========================================================

  const lessonTimeRef = useRef(0);

  // Prevent duplicate saves
  const savingTimeRef = useRef(false);

  // =========================================================
  // LOAD COURSES
  // =========================================================

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)
        .order("display_order", {
          ascending: true,
        });

      if (error) {
        console.error("Courses error:", error);
        return;
      }

      const courseList = data || [];

      setCourses(courseList);

      await loadCourseStats(courseList);
      await loadProgress(courseList);
    } catch (error) {
      console.error("Load courses error:", error);
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // BACKGROUND LESSON TIMER
  // NO TIMER UI
  // NO TIMER CONSOLE LOGS
  // =========================================================

  useEffect(() => {
    if (!selectedLesson || !currentCourseId) {
      return;
    }

    // -------------------------------------------------------
    // FIND SAVED TIME FOR CURRENT LESSON
    // -------------------------------------------------------

    const savedRow =
      progressData[currentCourseId]?.progressRows?.find(
        (item) =>
          Number(item.lesson_id) ===
          Number(selectedLesson.id)
      );

    // IMPORTANT:
    // DATABASE COLUMN = learning_time_seconds

    const savedSeconds =
      Number(savedRow?.learning_time_seconds) || 0;

    lessonTimeRef.current = savedSeconds;

    // -------------------------------------------------------
    // START BACKGROUND TIMER
    // -------------------------------------------------------

    const timer = setInterval(() => {
      lessonTimeRef.current += 1;
    }, 1000);

    // -------------------------------------------------------
    // AUTO SAVE EVERY 5 SECONDS
    // -------------------------------------------------------

    const autoSaveTimer = setInterval(() => {
      saveLessonTime(
        selectedLesson.id,
        currentCourseId,
        lessonTimeRef.current
      );
    }, 5000);

    // -------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------

    return () => {
      clearInterval(timer);
      clearInterval(autoSaveTimer);

      // Save latest time when leaving lesson
      saveLessonTime(
        selectedLesson.id,
        currentCourseId,
        lessonTimeRef.current
      );
    };

    // IMPORTANT:
    // progressData intentionally NOT included.
  }, [selectedLesson, currentCourseId]);

  // =========================================================
  // SAVE LESSON TIME
  // =========================================================

  async function saveLessonTime(
    lessonId,
    courseId,
    seconds
  ) {
    if (
      !lessonId ||
      !courseId ||
      seconds <= 0
    ) {
      return;
    }

    if (savingTimeRef.current) {
      return;
    }

    try {
      savingTimeRef.current = true;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      // -----------------------------------------------------
      // GET EXISTING ROW
      // -----------------------------------------------------

      const {
        data: existingRows,
        error: fetchError,
      } = await supabase
        .from("course_progress")
        .select(
          `
          id,
          lesson_id,
          course_id,
          progress_percent,
          is_completed,
          learning_time_seconds
          `
        )
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .eq("lesson_id", lessonId)
        .limit(1);

      if (fetchError) {
        console.error(
          "Timer existing row error:",
          fetchError
        );
        return;
      }

      const existingRow =
        existingRows?.[0];

      // -----------------------------------------------------
      // NEVER REDUCE SAVED TIME
      // -----------------------------------------------------

      const oldSeconds =
        Number(
          existingRow?.learning_time_seconds
        ) || 0;

      const newSeconds = Math.max(
        oldSeconds,
        Number(seconds) || 0
      );

      // -----------------------------------------------------
      // SAVE PAYLOAD
      // -----------------------------------------------------

      const payload = {
        user_id: user.id,
        course_id: courseId,
        lesson_id: lessonId,

        progress_percent:
          existingRow?.progress_percent || 0,

        is_completed:
          existingRow?.is_completed || false,

        // EXACT DATABASE COLUMN
        learning_time_seconds:
          newSeconds,

        updated_at:
          new Date().toISOString(),
      };

      let saveError;

      // -----------------------------------------------------
      // UPDATE EXISTING ROW
      // -----------------------------------------------------

      if (existingRow?.id) {
        const result = await supabase
          .from("course_progress")
          .update(payload)
          .eq("id", existingRow.id);

        saveError = result.error;
      }

      // -----------------------------------------------------
      // INSERT NEW ROW
      // -----------------------------------------------------

      else {
        const result = await supabase
          .from("course_progress")
          .insert(payload);

        saveError = result.error;
      }

      if (saveError) {
        console.error(
          "Timer save error:",
          saveError
        );
        return;
      }

      // -----------------------------------------------------
      // UPDATE LOCAL STATE
      // -----------------------------------------------------

      setProgressData((prev) => {
        const courseInfo =
          prev[courseId] || {};

        const rows =
          courseInfo.progressRows || [];

        const existingIndex =
          rows.findIndex(
            (row) =>
              Number(row.lesson_id) ===
              Number(lessonId)
          );

        let updatedRows;

        if (existingIndex !== -1) {
          updatedRows = [...rows];

          updatedRows[existingIndex] = {
            ...updatedRows[existingIndex],

            learning_time_seconds:
              newSeconds,

            updated_at:
              new Date().toISOString(),
          };
        } else {
          updatedRows = [
            ...rows,

            {
              lesson_id: lessonId,
              course_id: courseId,

              learning_time_seconds:
                newSeconds,

              progress_percent: 0,
              is_completed: false,

              updated_at:
                new Date().toISOString(),
            },
          ];
        }

        return {
          ...prev,

          [courseId]: {
            ...courseInfo,
            progressRows: updatedRows,
          },
        };
      });
    } catch (error) {
      console.error(
        "Save lesson time error:",
        error
      );
    } finally {
      savingTimeRef.current = false;
    }
  }

  // =========================================================
  // LOAD REAL COURSE STATISTICS
  // COURSE → SECTION → MODULE → TOPIC → LESSON
  // =========================================================

  async function loadCourseStats(courseList) {
    if (!courseList.length) {
      return;
    }

    try {
      const courseIds =
        courseList.map(
          (course) => course.id
        );

      // =====================================================
      // SECTIONS
      // =====================================================

      const {
        data: sections,
        error: sectionError,
      } = await supabase
        .from("course_sections")
        .select(
          "id, course_id, display_order"
        )
        .in(
          "course_id",
          courseIds
        )
        .eq(
          "is_active",
          true
        );

      if (sectionError) {
        console.error(
          "Course stats sections error:",
          sectionError
        );
        return;
      }

      if (!sections?.length) {
        return;
      }

      const sectionIds =
        sections.map(
          (section) => section.id
        );

      // =====================================================
      // MODULES
      // =====================================================

      const {
        data: modules,
        error: moduleError,
      } = await supabase
        .from("course_modules")
        .select(
          "id, section_id, display_order"
        )
        .in(
          "section_id",
          sectionIds
        )
        .eq(
          "is_active",
          true
        );

      if (moduleError) {
        console.error(
          "Course stats modules error:",
          moduleError
        );
        return;
      }

      if (!modules?.length) {
        return;
      }

      const moduleIds =
        modules.map(
          (module) => module.id
        );

      // =====================================================
      // TOPICS
      // =====================================================

      const {
        data: topics,
        error: topicError,
      } = await supabase
        .from("course_topics")
        .select(
          "id, module_id, display_order"
        )
        .in(
          "module_id",
          moduleIds
        )
        .eq(
          "is_active",
          true
        );

      if (topicError) {
        console.error(
          "Course stats topics error:",
          topicError
        );
        return;
      }

      if (!topics?.length) {
        return;
      }

      const topicIds =
        topics.map(
          (topic) => topic.id
        );

      // =====================================================
      // LESSONS
      // =====================================================

      const {
        data: lessons,
        error: lessonError,
      } = await supabase
        .from("course_lessons")
        .select(
          "id, topic_id, display_order"
        )
        .in(
          "topic_id",
          topicIds
        )
        .eq(
          "is_published",
          true
        );

      if (lessonError) {
        console.error(
          "Course stats lessons error:",
          lessonError
        );
        return;
      }

      // =====================================================
      // MAPS
      // =====================================================

      const topicMap = {};
      const moduleMap = {};
      const sectionMap = {};

      topics.forEach((topic) => {
        topicMap[topic.id] = topic;
      });

      modules.forEach((module) => {
        moduleMap[module.id] = module;
      });

      sections.forEach((section) => {
        sectionMap[section.id] = section;
      });

      // =====================================================
      // CREATE STATS
      // =====================================================

      const stats = {};

      courseList.forEach((course) => {
        stats[course.id] = {
          totalLessons: 0,
          lessonIds: new Set(),
        };
      });

      // =====================================================
      // COUNT LESSONS
      // =====================================================

      (lessons || []).forEach((lesson) => {
        const topic =
          topicMap[lesson.topic_id];

        const module =
          moduleMap[topic?.module_id];

        const section =
          sectionMap[module?.section_id];

        const courseId =
          section?.course_id;

        if (
          courseId &&
          stats[courseId]
        ) {
          stats[courseId].totalLessons += 1;

          stats[courseId].lessonIds.add(
            lesson.id
          );
        }
      });

      setCourseStats(stats);
    } catch (error) {
      console.error(
        "Load course stats error:",
        error
      );
    }
  }

  // =========================================================
  // LOAD USER PROGRESS
  // =========================================================

  async function loadProgress(courseList) {
    if (!courseList.length) {
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error(
          "User not logged in"
        );
        return;
      }

      const courseIds =
        courseList.map(
          (course) => course.id
        );

      const {
        data,
        error,
      } = await supabase
        .from("course_progress")
        .select(
          `
          id,
          course_id,
          lesson_id,
          progress_percent,
          is_completed,
          learning_time_seconds,
          updated_at
          `
        )
        .eq(
          "user_id",
          user.id
        )
        .in(
          "course_id",
          courseIds
        )
        .order(
          "updated_at",
          {
            ascending: false,
          }
        );

      if (error) {
        console.error(
          "Progress error:",
          error
        );
        return;
      }

      const progressMap = {};

      courseList.forEach((course) => {
        const courseProgress =
          (data || []).filter(
            (item) =>
              item.course_id ===
              course.id
          );

        const completedLessonIds =
          new Set(
            courseProgress
              .filter(
                (item) =>
                  item.is_completed ===
                  true
              )
              .map(
                (item) =>
                  item.lesson_id
              )
          );

        progressMap[course.id] = {
          completedLessons:
            completedLessonIds.size,

          lastLessonId:
            courseProgress.length > 0
              ? courseProgress[0]
                  .lesson_id
              : null,

          progressRows:
            courseProgress,
        };
      });

      setProgressData(progressMap);
    } catch (error) {
      console.error(
        "Load progress error:",
        error
      );
    }
  }

  // =========================================================
  // LOAD COMPLETE COURSE
  // =========================================================

  async function handleContinue(courseId) {
    try {
      setLessonLoading(true);

      setCurrentCourseId(courseId);

      // =====================================================
      // SECTIONS
      // =====================================================

      const {
        data: sections,
        error: sectionError,
      } = await supabase
        .from("course_sections")
        .select(
          "id, title, display_order, course_id"
        )
        .eq(
          "course_id",
          courseId
        )
        .eq(
          "is_active",
          true
        )
        .order(
          "display_order",
          {
            ascending: true,
          }
        );

      if (sectionError) {
        console.error(
          "Sections error:",
          sectionError
        );
        return;
      }

      if (!sections?.length) {
        alert("No sections found.");
        return;
      }

      const sectionIds =
        sections.map(
          (section) =>
            section.id
        );

      // =====================================================
      // MODULES
      // =====================================================

      const {
        data: modules,
        error: moduleError,
      } = await supabase
        .from("course_modules")
        .select(
          "id, title, display_order, section_id"
        )
        .in(
          "section_id",
          sectionIds
        )
        .eq(
          "is_active",
          true
        )
        .order(
          "display_order",
          {
            ascending: true,
          }
        );

      if (moduleError) {
        console.error(
          "Modules error:",
          moduleError
        );
        return;
      }

      if (!modules?.length) {
        alert("No modules found.");
        return;
      }

      const moduleIds =
        modules.map(
          (module) =>
            module.id
        );

      // =====================================================
      // TOPICS
      // =====================================================

      const {
        data: topics,
        error: topicError,
      } = await supabase
        .from("course_topics")
        .select(
          "id, title, display_order, module_id"
        )
        .in(
          "module_id",
          moduleIds
        )
        .eq(
          "is_active",
          true
        )
        .order(
          "display_order",
          {
            ascending: true,
          }
        );

      if (topicError) {
        console.error(
          "Topics error:",
          topicError
        );
        return;
      }

      if (!topics?.length) {
        alert("No topics found.");
        return;
      }

      const topicIds =
        topics.map(
          (topic) =>
            topic.id
        );

      // =====================================================
      // LESSONS
      // =====================================================

      const {
        data: lessons,
        error: lessonError,
      } = await supabase
        .from("course_lessons")
        .select("*")
        .in(
          "topic_id",
          topicIds
        )
        .eq(
          "is_published",
          true
        )
        .order(
          "display_order",
          {
            ascending: true,
          }
        );

      if (lessonError) {
        console.error(
          "Lessons error:",
          lessonError
        );
        return;
      }

      if (!lessons?.length) {
        alert("No lessons found.");
        return;
      }

      // =====================================================
      // MAPS
      // =====================================================

      const moduleMap = {};
      const topicMap = {};
      const sectionMap = {};

      modules.forEach((module) => {
        moduleMap[module.id] = module;
      });

      topics.forEach((topic) => {
        topicMap[topic.id] = topic;
      });

      sections.forEach((section) => {
        sectionMap[section.id] = section;
      });

      // =====================================================
      // SORT LESSONS
      // =====================================================

      const sortedLessons =
        [...lessons].sort(
          (a, b) => {
            const topicA =
              topicMap[a.topic_id];

            const topicB =
              topicMap[b.topic_id];

            const moduleA =
              moduleMap[
                topicA?.module_id
              ];

            const moduleB =
              moduleMap[
                topicB?.module_id
              ];

            const sectionA =
              sectionMap[
                moduleA?.section_id
              ];

            const sectionB =
              sectionMap[
                moduleB?.section_id
              ];

            const sectionCompare =
              (
                sectionA?.display_order ??
                0
              ) -
              (
                sectionB?.display_order ??
                0
              );

            if (sectionCompare !== 0) {
              return sectionCompare;
            }

            const moduleCompare =
              (
                moduleA?.display_order ??
                0
              ) -
              (
                moduleB?.display_order ??
                0
              );

            if (moduleCompare !== 0) {
              return moduleCompare;
            }

            const topicCompare =
              (
                topicA?.display_order ??
                0
              ) -
              (
                topicB?.display_order ??
                0
              );

            if (topicCompare !== 0) {
              return topicCompare;
            }

            return (
              (
                a.display_order ??
                0
              ) -
              (
                b.display_order ??
                0
              )
            );
          }
        );

      setCurrentLessons(
        sortedLessons
      );

      // =====================================================
      // COMPLETED LESSONS
      // =====================================================

      const savedProgress =
        progressData[courseId];

      const completedLessonIds =
        new Set(
          (
            savedProgress?.progressRows ||
            []
          )
            .filter(
              (item) =>
                item.is_completed ===
                true
            )
            .map(
              (item) =>
                item.lesson_id
            )
        );

      // =====================================================
      // NEXT INCOMPLETE LESSON
      // =====================================================

      let startIndex =
        sortedLessons.findIndex(
          (lesson) =>
            !completedLessonIds.has(
              lesson.id
            )
        );

      if (startIndex === -1) {
        startIndex =
          sortedLessons.length - 1;
      }

      setCurrentLessonIndex(
        startIndex
      );

      setSelectedLesson(
        sortedLessons[startIndex]
      );
    } catch (error) {
      console.error(
        "Continue learning error:",
        error
      );

      alert(
        "Something went wrong while loading the course."
      );
    } finally {
      setLessonLoading(false);
    }
  }

  // =========================================================
  // SAVE COMPLETE LESSON
  // =========================================================

  async function saveProgress(
    lesson,
    courseId
  ) {
    if (
      !lesson ||
      !courseId
    ) {
      return;
    }

    try {
      // Save latest timer first
      await saveLessonTime(
        lesson.id,
        courseId,
        lessonTimeRef.current
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const totalLessons =
        currentLessons.length;

      if (totalLessons === 0) {
        return;
      }

      // =====================================================
      // EXISTING PROGRESS
      // =====================================================

      const {
        data: existingProgress,
        error,
      } = await supabase
        .from("course_progress")
        .select(
          `
          id,
          lesson_id,
          is_completed,
          progress_percent,
          learning_time_seconds,
          updated_at
          `
        )
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "course_id",
          courseId
        );

      if (error) {
        console.error(
          "Existing progress error:",
          error
        );
        return;
      }

      // =====================================================
      // COMPLETED IDS
      // =====================================================

      const completedIds =
        new Set(
          (existingProgress || [])
            .filter(
              (item) =>
                item.is_completed ===
                true
            )
            .map(
              (item) =>
                item.lesson_id
            )
        );

      completedIds.add(
        lesson.id
      );

      const completedCount =
        completedIds.size;

      // =====================================================
      // PERCENTAGE
      // =====================================================

      const percent =
        Math.min(
          100,
          Math.round(
            (completedCount /
              totalLessons) *
              100
          )
        );

      // =====================================================
      // CURRENT LESSON TIME
      // =====================================================

      const currentSeconds =
        Math.max(
          Number(
            lessonTimeRef.current
          ) || 0,

          Number(
            existingProgress?.find(
              (item) =>
                Number(
                  item.lesson_id
                ) ===
                Number(
                  lesson.id
                )
            )
              ?.learning_time_seconds
          ) || 0
        );

      // =====================================================
      // CURRENT LESSON ROW
      // =====================================================

      const existingRow =
        (
          existingProgress ||
          []
        ).find(
          (item) =>
            Number(
              item.lesson_id
            ) ===
            Number(
              lesson.id
            )
        );

      // =====================================================
      // SAVE PAYLOAD
      // =====================================================

      const payload = {
        user_id: user.id,
        course_id: courseId,
        lesson_id: lesson.id,

        progress_percent:
          percent,

        is_completed: true,

        // EXACT DATABASE COLUMN
        learning_time_seconds:
          currentSeconds,

        updated_at:
          new Date().toISOString(),
      };

      let progressError;

      // =====================================================
      // UPDATE
      // =====================================================

      if (existingRow?.id) {
        const result =
          await supabase
            .from("course_progress")
            .update(payload)
            .eq(
              "id",
              existingRow.id
            );

        progressError =
          result.error;
      }

      // =====================================================
      // INSERT
      // =====================================================

      else {
        const result =
          await supabase
            .from("course_progress")
            .insert(payload);

        progressError =
          result.error;
      }

      if (progressError) {
        console.error(
          "Save progress error:",
          progressError
        );
        return;
      }

      // Refresh progress
      await loadProgress(
        courses
      );

      return {
        percent,
        completedCount,
        totalLessons,

        isCompleted:
          completedCount >=
          totalLessons,
      };
    } catch (error) {
      console.error(
        "Save progress error:",
        error
      );
    }
  }

  // =========================================================
  // NEXT LESSON
  // =========================================================

  async function handleNextLesson() {
    const currentLesson =
      currentLessons[
        currentLessonIndex
      ];

    if (!currentLesson) {
      return;
    }

    // SAVE CURRENT LESSON + TIME
    await saveProgress(
      currentLesson,
      currentCourseId
    );

    const nextIndex =
      currentLessonIndex + 1;

    if (
      nextIndex >=
      currentLessons.length
    ) {
      alert(
        "🎉 Congratulations! You completed the entire course!"
      );

      return;
    }

    setCurrentLessonIndex(
      nextIndex
    );

    setSelectedLesson(
      currentLessons[nextIndex]
    );
  }

  // =========================================================
  // BACK TO COURSES
  // =========================================================

  async function handleBackToCourses() {
    // Save current lesson time before leaving
    if (
      selectedLesson &&
      currentCourseId
    ) {
      await saveLessonTime(
        selectedLesson.id,
        currentCourseId,
        lessonTimeRef.current
      );
    }

    setSelectedLesson(null);
    setCurrentLessons([]);
    setCurrentLessonIndex(0);
    setCurrentCourseId(null);

    await loadProgress(
      courses
    );
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="continue-learning-page">

        <div className="continue-learning-header">

          <span>
            LEARN
          </span>

          <h1>
            Continue Learning
          </h1>

          <p>
            Loading your courses...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // LESSON LOADING
  // =========================================================

  if (lessonLoading) {
    return (
      <div className="continue-learning-page">

        <div className="continue-learning-header">

          <span>
            LEARN
          </span>

          <h1>
            Continue Learning
          </h1>

          <p>
            Preparing your course...
          </p>

        </div>

        <div className="lesson-loading">

          <div className="lesson-spinner"></div>

          <h3>
            Preparing your course
          </h3>

          <p>
            Loading modules, topics and lessons...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // LESSON PAGE
  // =========================================================

  if (selectedLesson) {
    const totalLessons =
      currentLessons.length;

    const currentLessonNumber =
      currentLessonIndex + 1;

    const isLastLesson =
      currentLessonIndex ===
      totalLessons - 1;

    return (
      <div className="continue-learning-page">

        <div className="continue-learning-header">

          <span>
            LESSON
          </span>

          <h1>
            {selectedLesson.title}
          </h1>

          <p>
            {selectedLesson.type ||
              "Learning Lesson"}
          </p>

        </div>

        <div className="lesson-progress-info">

          <span>
            Lesson{" "}
            {currentLessonNumber}{" "}
            of{" "}
            {totalLessons}
          </span>

        </div>

        <div className="lesson-content">

          <h2>
            {selectedLesson.title}
          </h2>

          <p>
            {selectedLesson.content}
          </p>

          {/* TIMER UI COMPLETELY REMOVED */}

          <div className="lesson-navigation">

            <button
              onClick={
                handleBackToCourses
              }
            >
              ← Back to Courses
            </button>

            {!isLastLesson && (
              <button
                onClick={
                  handleNextLesson
                }
              >
                Next Lesson →
              </button>
            )}

            {isLastLesson && (
              <button
                onClick={
                  handleNextLesson
                }
              >
                Complete Course ✓
              </button>
            )}

          </div>

        </div>

      </div>
    );
  }

  // =========================================================
  // COURSE LIST
  // =========================================================

  return (
    <div className="continue-learning-page">

      <div className="continue-learning-header">

        <span>
          LEARN
        </span>

        <h1>
          Continue Learning
        </h1>

        <p>
          Continue your courses from where
          you left off.
        </p>

      </div>

      <div className="continue-course-list">

        {courses.map((course) => {

          const progressInfo =
            progressData[
              course.id
            ];

          const progressRows =
            progressInfo?.progressRows ||
            [];

          const validLessonIds =
            courseStats[
              course.id
            ]?.lessonIds ||
            new Set();

          const completedLessonIds =
            new Set(
              progressRows
                .filter(
                  (item) =>
                    item.is_completed ===
                      true &&
                    validLessonIds.has(
                      item.lesson_id
                    )
                )
                .map(
                  (item) =>
                    item.lesson_id
                )
            );

          const completedCount =
            completedLessonIds.size;

          const totalLessons =
            courseStats[
              course.id
            ]?.totalLessons ||
            0;

          const progress =
            totalLessons > 0
              ? Math.min(
                  100,
                  Math.round(
                    (completedCount /
                      totalLessons) *
                      100
                  )
                )
              : 0;

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

                  <h2>
                    {course.title}
                  </h2>

                  <p>
                    {course.description}
                  </p>

                  <div className="continue-progress">

                    <div className="continue-progress-bar">

                      <div
                        className="continue-progress-fill"
                        style={{
                          width: `${progress}%`,
                        }}
                      ></div>

                    </div>

                    <span>
                      {progress}%
                    </span>

                  </div>

                  {completedCount > 0 && (
                    <small>
                      {completedCount}{" "}
                      lesson
                      {completedCount !== 1
                        ? "s"
                        : ""}{" "}
                      completed
                    </small>
                  )}

                </div>

              </div>

              <div className="continue-course-action">

                <p>
                  {completedCount === 0
                    ? "Start this course"
                    : completedCount >=
                      totalLessons
                    ? "Course completed"
                    : `${completedCount} of ${totalLessons} lessons completed`}
                </p>

                <button
                  onClick={() =>
                    handleContinue(
                      course.id
                    )
                  }
                  disabled={
                    lessonLoading
                  }
                >
                  {lessonLoading
                    ? "Loading..."
                    : completedCount === 0
                    ? "Start"
                    : "Continue"}
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