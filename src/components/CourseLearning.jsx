import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./CourseLearning.css";




const formatLessonContent = (content) => {
  if (!content) return null;

  let text = String(content);

  // Convert escaped line breaks into real line breaks
  text = text
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  // If database content has no real line breaks,
  // separate important lesson sections automatically
  text = text.replace(
    /(?=\bDefinition\s)/g,
    "\n\n"
  );

  text = text.replace(
    /(?=\bSimple Explanation\s)/g,
    "\n\n"
  );

  text = text.replace(
    /(?=\bFor example,\s)/g,
    "\n\n"
  );

  text = text.replace(
    /(?=\bAll of these\s)/g,
    "\n\n"
  );

  text = text.replace(
    /(?=\bExample:\s)/g,
    "\n\n"
  );

  text = text.replace(
    /(?=\bKey Point\s)/g,
    "\n\n"
  );

  text = text.replace(
    /(?=\bUser\s*↓)/g,
    "\n\n"
  );

  return text
    .split(/\n/)
    .map((line, index) => {
      const cleanLine = line.trim();

      if (!cleanLine) {
        return <div key={index} className="lesson-content-space" />;
      }

      return (
        <div
          key={index}
          className="lesson-content-line"
        >
          {cleanLine}
        </div>
      );
    });
};


function CourseLearning({ course, onBack }) {
  const [topics, setTopics] = useState([]);
  const [lessons, setLessons] = useState([]);

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [openSection, setOpenSection] = useState(
    course.sections?.[0]?.id || null
  );

  const [openModule, setOpenModule] = useState(
    course.sections?.[0]?.modules?.[0]?.id || null
  );

  const [loading, setLoading] = useState(true);

  // =========================================
  // FETCH TOPICS + LESSONS FROM SUPABASE
  // =========================================

  useEffect(() => {
    const fetchCourseContent = async () => {
      setLoading(true);

      try {
        // -----------------------------------------
        // GET ALL MODULE IDS
        // -----------------------------------------

        const moduleIds =
          course.sections?.flatMap(
            (section) =>
              section.modules?.map((module) => module.id) || []
          ) || [];

        console.log("Module IDs:", moduleIds);

        if (moduleIds.length === 0) {
          setTopics([]);
          setLessons([]);
          setSelectedTopic(null);
          setSelectedLesson(null);
          setLoading(false);
          return;
        }

        // -----------------------------------------
        // FETCH TOPICS
        // -----------------------------------------

        const { data: topicData, error: topicError } =
          await supabase
            .from("course_topics")
            .select("*")
            .in("module_id", moduleIds)
            .eq("is_active", true)
            .order("display_order", {
              ascending: true,
            });

        if (topicError) {
          console.error(
            "Course topics fetch error:",
            topicError
          );

          setTopics([]);
          setLessons([]);
          setLoading(false);
          return;
        }

        console.log(
          "Course Topics from Supabase:",
          topicData
        );

        setTopics(topicData || []);

        // -----------------------------------------
        // GET TOPIC IDS
        // -----------------------------------------

        const topicIds = (topicData || []).map(
          (topic) => topic.id
        );

        if (topicIds.length === 0) {
          setLessons([]);
          setSelectedTopic(null);
          setSelectedLesson(null);
          setLoading(false);
          return;
        }

        // -----------------------------------------
        // FETCH LESSONS
        // -----------------------------------------

        const { data: lessonData, error: lessonError } =
          await supabase
            .from("course_lessons")
            .select("*")
            .in("topic_id", topicIds)
            .eq("is_published", true)
            .order("display_order", {
              ascending: true,
            });

        if (lessonError) {
          console.error(
            "Course lessons fetch error:",
            lessonError
          );

          setLessons([]);
          setLoading(false);
          return;
        }

        console.log(
          "Course Lessons from Supabase:",
          lessonData
        );

        setLessons(lessonData || []);

        // -----------------------------------------
        // SELECT FIRST TOPIC
        // -----------------------------------------

        const firstTopic = topicData?.[0] || null;

        setSelectedTopic(firstTopic);

        // -----------------------------------------
        // SELECT FIRST LESSON
        // -----------------------------------------

        if (firstTopic) {
          const firstLesson =
            (lessonData || []).find(
              (lesson) =>
                lesson.topic_id === firstTopic.id
            ) || null;

          setSelectedLesson(firstLesson);
        } else {
          setSelectedLesson(null);
        }
      } catch (error) {
        console.error(
          "Course content error:",
          error
        );

        setTopics([]);
        setLessons([]);
        setSelectedTopic(null);
        setSelectedLesson(null);
      } finally {
        setLoading(false);
      }
    };

    if (course) {
      fetchCourseContent();
    }
  }, [course]);

  // =========================================
  // GET MODULE TOPICS
  // =========================================

  const getModuleTopics = (moduleId) => {
    return topics.filter(
      (topic) => topic.module_id === moduleId
    );
  };

  // =========================================
  // GET TOPIC LESSONS
  // =========================================

  const getTopicLessons = (topicId) => {
    return lessons.filter(
      (lesson) => lesson.topic_id === topicId
    );
  };

  // =========================================
  // ALL LESSONS
  // =========================================

  const allLessons = lessons;

  const currentLessonIndex = selectedLesson
    ? allLessons.findIndex(
        (lesson) =>
          lesson.id === selectedLesson.id
      )
    : -1;

  // =========================================
  // SELECT TOPIC
  // =========================================

  const handleTopicClick = (topic, moduleId) => {
    setSelectedTopic(topic);
    setOpenModule(moduleId);

    const topicLessons =
      getTopicLessons(topic.id);

    if (topicLessons.length > 0) {
      setSelectedLesson(topicLessons[0]);
    } else {
      setSelectedLesson(null);
    }
  };

  // =========================================
  // SELECT LESSON
  // =========================================

  const handleLessonClick = (lesson, topic) => {
    setSelectedLesson(lesson);
    setSelectedTopic(topic);
  };

  // =========================================
  // FIND MODULE
  // =========================================

  const findModuleByTopic = (topicId) => {
    const topic = topics.find(
      (item) => item.id === topicId
    );

    if (!topic) {
      return null;
    }

    return (
      course.sections
        ?.flatMap(
          (section) => section.modules || []
        )
        .find(
          (module) =>
            module.id === topic.module_id
        ) || null
    );
  };

  // =========================================
  // FIND SECTION
  // =========================================

  const findSectionByModule = (moduleId) => {
    return (
      course.sections?.find((section) =>
        section.modules?.some(
          (module) =>
            module.id === moduleId
        )
      ) || null
    );
  };

  // =========================================
  // NEXT LESSON
  // =========================================

  const goToNextLesson = () => {
    if (
      currentLessonIndex >= 0 &&
      currentLessonIndex <
        allLessons.length - 1
    ) {
      const nextLesson =
        allLessons[currentLessonIndex + 1];

      setSelectedLesson(nextLesson);

      const nextTopic = topics.find(
        (topic) =>
          topic.id === nextLesson.topic_id
      );

      if (nextTopic) {
        setSelectedTopic(nextTopic);

        const nextModule =
          findModuleByTopic(nextTopic.id);

        if (nextModule) {
          setOpenModule(nextModule.id);

          const nextSection =
            findSectionByModule(
              nextModule.id
            );

          if (nextSection) {
            setOpenSection(nextSection.id);
          }
        }
      }
    }
  };

  // =========================================
  // PREVIOUS LESSON
  // =========================================

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      const previousLesson =
        allLessons[
          currentLessonIndex - 1
        ];

      setSelectedLesson(previousLesson);

      const previousTopic =
        topics.find(
          (topic) =>
            topic.id ===
            previousLesson.topic_id
        );

      if (previousTopic) {
        setSelectedTopic(previousTopic);

        const previousModule =
          findModuleByTopic(
            previousTopic.id
          );

        if (previousModule) {
          setOpenModule(previousModule.id);

          const previousSection =
            findSectionByModule(
              previousModule.id
            );

          if (previousSection) {
            setOpenSection(previousSection.id);
          }
        }
      }
    }
  };

  // =========================================
  // LESSON CONTENT
  // =========================================

  

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <section className="learning-page">

        <div className="learning-header">

          <button
            className="back-course-btn"
            onClick={onBack}
          >
            ← Back to Courses
          </button>

          <div>

            <h1>
              {course.icon}{" "}
              {course.title}
            </h1>

            <p>
              Loading course content...
            </p>

          </div>

        </div>

      </section>
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <section className="learning-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="learning-header">

        <button
          className="back-course-btn"
          onClick={onBack}
        >
          ← Back to Courses
        </button>

        <div>

          <h1>
            {course.icon}{" "}
            {course.title}
          </h1>

          <p>
            Learn step by step with
            EDUVANTA.
          </p>

        </div>

      </div>

      {/* =====================================
          LEARNING LAYOUT
      ===================================== */}

      <div className="learning-layout">

        {/* ===================================
            LEFT SIDEBAR
        =================================== */}

        <aside className="learning-sidebar">

          <h2>
            Course Content
          </h2>

          {course.sections?.map(
            (section) => (

              <div
                className="learning-section"
                key={section.id}
              >

                {/* SECTION */}

                <div
                  className="learning-section-title"
                  onClick={() =>
                    setOpenSection(
                      openSection === section.id
                        ? null
                        : section.id
                    )
                  }
                >

                  <span>
                    {section.title}
                  </span>

                  <span>
                    {openSection === section.id
                      ? "⌃"
                      : "⌄"}
                  </span>

                </div>

                {/* MODULES */}

                {openSection === section.id && (

                  <div className="learning-topics">

                    {section.modules?.map(
                      (module) => {

                        const moduleTopics =
                          getModuleTopics(
                            module.id
                          );

                        return (

                          <div
                            key={module.id}
                          >

                            {/* MODULE */}

                            <div
                              className="learning-topic"
                              onClick={() =>
                                setOpenModule(
                                  openModule === module.id
                                    ? null
                                    : module.id
                                )
                              }
                            >

                              <span>
                                {module.title}
                              </span>

                              <span>
                                {openModule === module.id
                                  ? "⌃"
                                  : "⌄"}
                              </span>

                            </div>

                            {/* TOPICS */}

                            {openModule === module.id && (

                              <div className="module-lessons">

                                {moduleTopics.length === 0 ? (

                                  <div className="lesson-item">
                                    No topics available.
                                  </div>

                                ) : (

                                  moduleTopics.map(
                                    (topic) => {

                                      const topicLessons =
                                        getTopicLessons(
                                          topic.id
                                        );

                                      return (

                                        <div
                                          key={topic.id}
                                        >

                                          {/* TOPIC */}

                                          <div
                                            className={`learning-topic ${
                                              selectedTopic?.id ===
                                              topic.id
                                                ? "active-topic"
                                                : ""
                                            }`}
                                            onClick={() =>
                                              handleTopicClick(
                                                topic,
                                                module.id
                                              )
                                            }
                                          >
                                            {topic.title}
                                          </div>

                                          {/* LESSONS */}

                                          {selectedTopic?.id ===
                                            topic.id && (

                                            <div className="lesson-list">

                                              {topicLessons.length === 0 ? (

                                                <div className="lesson-item">
                                                  No lessons available.
                                                </div>

                                              ) : (

                                                topicLessons.map(
                                                  (lesson) => (

                                                    <div
                                                      key={lesson.id}
                                                      className={`lesson-item ${
                                                        selectedLesson?.id ===
                                                        lesson.id
                                                          ? "active-lesson"
                                                          : ""
                                                      }`}
                                                      onClick={() =>
                                                        handleLessonClick(
                                                          lesson,
                                                          topic
                                                        )
                                                      }
                                                    >
                                                      {lesson.title}
                                                    </div>

                                                  )
                                                )

                                              )}

                                            </div>

                                          )}

                                        </div>

                                      );
                                    }
                                  )

                                )}

                              </div>

                            )}

                          </div>

                        );
                      }
                    )}

                  </div>

                )}

              </div>

            )
          )}

        </aside>

        {/* ===================================
            RIGHT CONTENT
        =================================== */}

        <main className="learning-content">

          {selectedLesson ? (

            <>

              <span className="content-label">
                COURSE LESSON
              </span>

              <h2>
                {selectedLesson.title}
              </h2>

              <p className="content-description">
                {selectedTopic?.title}
              </p>

              {/* =================================
                  LESSON CONTENT
              ================================= */}
<div className="lesson-box">

  {selectedLesson.content ? (

    <div className="lesson-content">
      {formatLessonContent(selectedLesson.content)}
    </div>

  ) : (

    <p>
      Lesson content will be available here.
    </p>

  )}

</div>
              {/* =================================
                  NAVIGATION
              ================================= */}

              <div className="lesson-navigation">

                <button
                  onClick={goToPreviousLesson}
                  disabled={
                    currentLessonIndex <= 0
                  }
                >
                  ← Previous Lesson
                </button>

                <button
                  onClick={goToNextLesson}
                  disabled={
                    currentLessonIndex ===
                    allLessons.length - 1
                  }
                >
                  Next Lesson →
                </button>

              </div>

            </>

          ) : (

            <div className="lesson-box">

              <h3>
                No lesson selected
              </h3>

              <p>
                Add lessons from the
                database to start learning
                this course.
              </p>

            </div>

          )}

        </main>

      </div>

    </section>
  );
}

export default CourseLearning;