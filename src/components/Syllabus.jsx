import { useEffect, useState } from "react";
import "./Syllabus.css";
import { supabase } from "../lib/supabaseClient";

function Syllabus() {
  // =========================
  // SELECTION STATES
  // =========================

  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // =========================
  // DATA STATES
  // =========================

  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [topics, setTopics] = useState([]);
  const [topicContents, setTopicContents] = useState([]);

  // =========================
  // LOADING STATES
  // =========================

  const [loadingYears, setLoadingYears] = useState(true);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);

  // =========================
  // FETCH YEARS
  // =========================

  useEffect(() => {
    const fetchYears = async () => {
      setLoadingYears(true);

      const { data, error } = await supabase
        .from("years")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) {
        console.error("Years fetch error:", error);
        setYears([]);
      } else {
        console.log("Syllabus Years:", data);
        setYears(data || []);
      }

      setLoadingYears(false);
    };

    fetchYears();
  }, []);

  // =========================
  // FETCH SEMESTERS
  // =========================

  useEffect(() => {
    if (!selectedYear) return;

    const fetchSemesters = async () => {
      setLoadingSemesters(true);

      const { data, error } = await supabase
        .from("semesters")
        .select("*")
        .eq("year_id", selectedYear)
        .eq("is_active", true)
        .order("display_order");

      if (error) {
        console.error("Semesters fetch error:", error);
        setSemesters([]);
      } else {
        console.log("Syllabus Semesters:", data);
        setSemesters(data || []);
      }

      setLoadingSemesters(false);
    };

    fetchSemesters();
  }, [selectedYear]);

  // =========================
  // FETCH SUBJECTS
  // =========================

  useEffect(() => {
    if (!selectedSemester) return;

    const fetchSubjects = async () => {
      setLoadingSubjects(true);

      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("semester_id", selectedSemester)
        .eq("is_active", true)
        .order("display_order");

      if (error) {
        console.error("Subjects fetch error:", error);
        setSubjects([]);
      } else {
        console.log("Syllabus Subjects:", data);
        setSubjects(data || []);
      }

      setLoadingSubjects(false);
    };

    fetchSubjects();
  }, [selectedSemester]);

  // =========================
  // FETCH UNITS
  // =========================

  useEffect(() => {
    if (!selectedSubject) return;

    const fetchUnits = async () => {
      setLoadingUnits(true);

      const { data, error } = await supabase
        .from("units")
        .select("*")
        .eq("subject_id", selectedSubject)
        .eq("is_active", true)
        .order("display_order");

      if (error) {
        console.error("Units fetch error:", error);
        setUnits([]);
      } else {
        console.log("Syllabus Units:", data);
        setUnits(data || []);
      }

      setLoadingUnits(false);
    };

    fetchUnits();
  }, [selectedSubject]);

  // =========================
  // FETCH TOPICS
  // =========================

  useEffect(() => {
    if (!selectedUnit) return;

    const fetchTopics = async () => {
      setLoadingTopics(true);

      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("unit_id", selectedUnit)
        .eq("is_active", true)
        .order("display_order");

      if (error) {
        console.error("Topics fetch error:", error);
        setTopics([]);
      } else {
        console.log("Syllabus Topics:", data);
        setTopics(data || []);
      }

      setLoadingTopics(false);
    };

    fetchTopics();
  }, [selectedUnit]);

  // =========================
  // FETCH TOPIC CONTENT
  // =========================

  useEffect(() => {
    if (!selectedTopic) return;

    const fetchTopicContent = async () => {
      setLoadingContent(true);

      const { data, error } = await supabase
        .from("topic_contents")
        .select("*")
        .eq("topic_id", selectedTopic)
        .eq("is_published", true)
        .order("display_order");

      if (error) {
        console.error("Topic content fetch error:", error);
        setTopicContents([]);
      } else {
        console.log("Syllabus Topic Content:", data);
        setTopicContents(data || []);
      }

      setLoadingContent(false);
    };

    fetchTopicContent();
  }, [selectedTopic]);

  // =========================
  // CURRENT DATA
  // =========================

  const currentYear = years.find(
    (year) => year.id === selectedYear
  );

  const currentSemester = semesters.find(
    (semester) => semester.id === selectedSemester
  );

  const currentSubject = subjects.find(
    (subject) => subject.id === selectedSubject
  );

  const currentUnit = units.find(
    (unit) => unit.id === selectedUnit
  );

  const currentTopic = topics.find(
    (topic) => topic.id === selectedTopic
  );

  // =========================
  // RESET HELPERS
  // =========================

  const goBackToYears = () => {
    setSelectedYear(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedUnit(null);
    setSelectedTopic(null);

    setSemesters([]);
    setSubjects([]);
    setUnits([]);
    setTopics([]);
    setTopicContents([]);
  };

  const goBackToSemesters = () => {
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedUnit(null);
    setSelectedTopic(null);

    setSubjects([]);
    setUnits([]);
    setTopics([]);
    setTopicContents([]);
  };

  const goBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedUnit(null);
    setSelectedTopic(null);

    setUnits([]);
    setTopics([]);
    setTopicContents([]);
  };

  const goBackToUnits = () => {
    setSelectedUnit(null);
    setSelectedTopic(null);

    setTopics([]);
    setTopicContents([]);
  };

  const goBackToTopics = () => {
    setSelectedTopic(null);
    setTopicContents([]);
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="syllabus-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="syllabus-header">

        <span className="syllabus-label">
          COLLEGE LEARNING
        </span>

        <h1>
          College Syllabus
        </h1>

        <p>
          Explore your complete college syllabus,
          subjects, units, topics and learning content.
        </p>

      </div>


      {/* =====================================================
          YEAR PAGE
      ===================================================== */}

      {!selectedYear && (

        <div className="syllabus-section">

          <h2>
            Select Your Year
          </h2>

          {loadingYears ? (

            <p>Loading years...</p>

          ) : years.length === 0 ? (

            <p>No years available.</p>

          ) : (

            <div className="year-grid">

              {years.map((year) => (

                <button
                  key={year.id}
                  className="year-card"
                  onClick={() => {
                    setSelectedYear(year.id);
                    setSelectedSemester(null);
                    setSelectedSubject(null);
                    setSelectedUnit(null);
                    setSelectedTopic(null);

                    setSemesters([]);
                    setSubjects([]);
                    setUnits([]);
                    setTopics([]);
                    setTopicContents([]);
                  }}
                >

                  <div className="year-number">
                    {year.year_number}
                  </div>

                  <div className="year-content">

                    <h3>
                      {year.title}
                    </h3>

                    <p>
                      {year.description}
                    </p>

                  </div>

                  <span className="year-arrow">
                    →
                  </span>

                </button>

              ))}

            </div>

          )}

        </div>

      )}


      {/* =====================================================
          SEMESTER PAGE
      ===================================================== */}

      {selectedYear &&
        !selectedSemester && (

        <div className="semester-page">

          <button
            className="syllabus-back-button"
            onClick={goBackToYears}
          >
            ← Back to Years
          </button>

          <div className="semester-header">

            <span className="semester-label">
              {currentYear?.title}
            </span>

            <h2>
              Select Semester
            </h2>

            <p>
              Choose a semester to explore its subjects,
              units and topics.
            </p>

          </div>


          {loadingSemesters ? (

            <p>Loading semesters...</p>

          ) : semesters.length === 0 ? (

            <p>
              No semesters available for this year.
            </p>

          ) : (

            <div className="semester-grid">

              {semesters.map((semester) => (

                <button
                  key={semester.id}
                  className="semester-card"
                  onClick={() => {
                    setSelectedSemester(semester.id);
                    setSelectedSubject(null);
                    setSelectedUnit(null);
                    setSelectedTopic(null);

                    setSubjects([]);
                    setUnits([]);
                    setTopics([]);
                    setTopicContents([]);
                  }}
                >

                  <div className="semester-number">
                    {semester.semester_number}
                  </div>

                  <div className="semester-content">

                    <h3>
                      {semester.title}
                    </h3>

                    <p>
                      {semester.description}
                    </p>

                  </div>

                  <span className="semester-arrow">
                    →
                  </span>

                </button>

              ))}

            </div>

          )}

        </div>

      )}


      {/* =====================================================
          SUBJECT PAGE
      ===================================================== */}

      {selectedYear &&
        selectedSemester &&
        !selectedSubject && (

        <div className="subjects-page">

          <button
            className="syllabus-back-button"
            onClick={goBackToSemesters}
          >
            ← Back to Semesters
          </button>

          <div className="semester-header">

            <span className="semester-label">
              {currentYear?.title}
            </span>

            <h2>
              {currentSemester?.title}
            </h2>

            <p>
              Select a subject to explore its units.
            </p>

          </div>


          {loadingSubjects ? (

            <p>Loading subjects...</p>

          ) : subjects.length === 0 ? (

            <p>
              No subjects available for this semester.
            </p>

          ) : (

            <div className="subjects-grid">

              {subjects.map((subject) => (

                <button
                  key={subject.id}
                  className="subject-card"
                  onClick={() => {
                    setSelectedSubject(subject.id);
                    setSelectedUnit(null);
                    setSelectedTopic(null);

                    setUnits([]);
                    setTopics([]);
                    setTopicContents([]);
                  }}
                >

                  <div className="subject-icon">
                    📚
                  </div>

                  <div className="subject-content">

                    <h3>
                      {subject.subject_name ||
                        subject.subject_code}
                    </h3>

                    <p>
                      {subject.description ||
                        "Explore this subject."}
                    </p>

                  </div>

                  <span className="subject-arrow">
                    →
                  </span>

                </button>

              ))}

            </div>

          )}

        </div>

      )}


      {/* =====================================================
          UNITS PAGE
      ===================================================== */}

      {selectedSubject &&
        !selectedUnit && (

        <div className="subjects-page">

          <button
            className="syllabus-back-button"
            onClick={goBackToSubjects}
          >
            ← Back to Subjects
          </button>

          <div className="semester-header">

            <span className="semester-label">
              {currentYear?.title} •{" "}
              {currentSemester?.title}
            </span>

            <h2>
              {currentSubject?.subject_name ||
                currentSubject?.subject_code}
            </h2>

            <p>
              Select a unit to explore its topics.
            </p>

          </div>


          {loadingUnits ? (

            <p>Loading units...</p>

          ) : units.length === 0 ? (

            <p>
              No units available for this subject.
            </p>

          ) : (

            <div className="subjects-grid">

              {units.map((unit) => (

                <button
                  key={unit.id}
                  className="subject-card"
                  onClick={() => {
                    setSelectedUnit(unit.id);
                    setSelectedTopic(null);

                    setTopics([]);
                    setTopicContents([]);
                  }}
                >

                  <div className="subject-icon">
                    📖
                  </div>

                  <div className="subject-content">

                    <h3>
                      {unit.unit_name}
                    </h3>

                    <p>
                      {unit.description ||
                        "Explore this unit."}
                    </p>

                  </div>

                  <span className="subject-arrow">
                    →
                  </span>

                </button>

              ))}

            </div>

          )}

        </div>

      )}


      {/* =====================================================
          TOPICS PAGE
      ===================================================== */}

      {selectedUnit &&
        !selectedTopic && (

        <div className="subjects-page">

          <button
            className="syllabus-back-button"
            onClick={goBackToUnits}
          >
            ← Back to Units
          </button>

          <div className="semester-header">

            <span className="semester-label">
              {currentSubject?.subject_name ||
                currentSubject?.subject_code}
            </span>

            <h2>
              {currentUnit?.unit_name}
            </h2>

            <p>
              Select a topic to start learning.
            </p>

          </div>


          {loadingTopics ? (

            <p>Loading topics...</p>

          ) : topics.length === 0 ? (

            <p>
              No topics available for this unit.
            </p>

          ) : (

            <div className="subjects-grid">

              {topics.map((topic) => (

                <button
                  key={topic.id}
                  className="subject-card"
                  onClick={() => {
                    setSelectedTopic(topic.id);
                    setTopicContents([]);
                  }}
                >

                  <div className="subject-icon">
                    📝
                  </div>

                  <div className="subject-content">

                    <h3>
                      {topic.topic_name}
                    </h3>

                    <p>
                      {topic.short_description ||
                        "Start learning this topic."}
                    </p>

                  </div>

                  <span className="subject-arrow">
                    →
                  </span>

                </button>

              ))}

            </div>

          )}

        </div>

      )}


      {/* =====================================================
          TOPIC CONTENT PAGE
      ===================================================== */}

      {selectedTopic && (

        <div className="subjects-page">

          <button
            className="syllabus-back-button"
            onClick={goBackToTopics}
          >
            ← Back to Topics
          </button>

          <div className="semester-header">

            <span className="semester-label">
              {currentUnit?.unit_name}
            </span>

            <h2>
              {currentTopic?.topic_name}
            </h2>

            <p>
              Learning content
            </p>

          </div>


          {loadingContent ? (

            <p>Loading content...</p>

          ) : topicContents.length === 0 ? (

            <p>
              No published content available.
            </p>

          ) : (

            <div className="topic-content-list">

              {topicContents.map((content) => (

                <div
                  key={content.id}
                  className="topic-content-card"
                >

                  <h3>
                    {content.title}
                  </h3>

                  <div>
                    {content.content}
                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      )}

    </div>
  );
}

export default Syllabus;