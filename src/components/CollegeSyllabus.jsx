import { useEffect, useState } from "react";
import "./CollegeSyllabus.css";
import { supabase } from "../lib/supabaseClient";

function CollegeSyllabus({ adminMode = false, onBack }) {
  // =========================================
  // DATA STATE
  // =========================================

  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [topics, setTopics] = useState([]);
  const [topicContents, setTopicContents] = useState([]);

  // =========================================
  // SELECTED STATE
  // =========================================

  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // =========================================
  // LOADING STATE
  // =========================================

  const [loading, setLoading] = useState(true);
  const [levelLoading, setLevelLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);

  const [error, setError] = useState("");

  // =========================================
  // CRUD STATE
  // =========================================

  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [formType, setFormType] = useState("");

  const [formData, setFormData] = useState({});

  // =========================================
  // FETCH YEARS
  // =========================================

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    setLoading(true);
    setError("");

    console.log("🔥 CollegeSyllabus: Fetching years...");

    const { data, error } = await supabase
      .from("years")
      .select("*")
      .order("display_order", { ascending: true });

    console.log("🔥 CollegeSyllabus YEARS DATA:", data);
    console.log("🔥 CollegeSyllabus YEARS ERROR:", error);
    console.log("🔥 CollegeSyllabus YEARS COUNT:", data?.length);

    if (error) {
      console.error("Years Error:", error);
      setError("Unable to load college syllabus.");
      setYears([]);
      setLoading(false);
      return;
    }

    setYears(data || []);
    setLoading(false);
  };

  // =========================================
  // FETCH FUNCTIONS
  // =========================================

  const fetchSemesters = async (yearId) => {
    const { data, error } = await supabase
      .from("semesters")
      .select("*")
      .eq("year_id", yearId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Semesters Error:", error);
      setSemesters([]);
      return;
    }

    setSemesters(data || []);
  };

  const fetchSubjects = async (semesterId) => {
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("semester_id", semesterId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Subjects Error:", error);
      setSubjects([]);
      return;
    }

    setSubjects(data || []);
  };

  const fetchUnits = async (subjectId) => {
    const { data, error } = await supabase
      .from("units")
      .select("*")
      .eq("subject_id", subjectId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Units Error:", error);
      setUnits([]);
      return;
    }

    setUnits(data || []);
  };

  const fetchTopics = async (unitId) => {
    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .eq("unit_id", unitId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Topics Error:", error);
      setTopics([]);
      return;
    }

    setTopics(data || []);
  };

  const fetchTopicContents = async (topicId) => {
    const { data, error } = await supabase
      .from("topic_contents")
      .select("*")
      .eq("topic_id", topicId)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Topic Content Error:", error);
      setTopicContents([]);
      return;
    }

    setTopicContents(data || []);
  };

  // =========================================
  // RESET CHILD DATA
  // =========================================

  const resetFromYear = () => {
    setSemesters([]);
    setSubjects([]);
    setUnits([]);
    setTopics([]);
    setTopicContents([]);

    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedUnit(null);
    setSelectedTopic(null);
  };

  const resetFromSemester = () => {
    setSubjects([]);
    setUnits([]);
    setTopics([]);
    setTopicContents([]);

    setSelectedSubject(null);
    setSelectedUnit(null);
    setSelectedTopic(null);
  };

  const resetFromSubject = () => {
    setUnits([]);
    setTopics([]);
    setTopicContents([]);

    setSelectedUnit(null);
    setSelectedTopic(null);
  };

  const resetFromUnit = () => {
    setTopics([]);
    setTopicContents([]);

    setSelectedTopic(null);
  };

  // =========================================
  // YEAR CLICK
  // =========================================

  const handleYearClick = async (year) => {
    setSelectedYear(year);
    resetFromYear();

    setLevelLoading(true);

    await fetchSemesters(year.id);

    setLevelLoading(false);
  };

  // =========================================
  // SEMESTER CLICK
  // =========================================

  const handleSemesterClick = async (semester) => {
    setSelectedSemester(semester);
    resetFromSemester();

    setLevelLoading(true);

    await fetchSubjects(semester.id);

    setLevelLoading(false);
  };

  // =========================================
  // SUBJECT CLICK
  // =========================================

  const handleSubjectClick = async (subject) => {
    setSelectedSubject(subject);
    resetFromSubject();

    setLevelLoading(true);

    await fetchUnits(subject.id);

    setLevelLoading(false);
  };

  // =========================================
  // UNIT CLICK
  // =========================================

  const handleUnitClick = async (unit) => {
    setSelectedUnit(unit);
    resetFromUnit();

    setLevelLoading(true);

    await fetchTopics(unit.id);

    setLevelLoading(false);
  };

  // =========================================
  // TOPIC CLICK
  // =========================================

  const handleTopicClick = async (topic) => {
    setSelectedTopic(topic);
    setTopicContents([]);
    setContentLoading(true);

    await fetchTopicContents(topic.id);

    setContentLoading(false);
  };

  // =========================================
  // CRUD - OPEN ADD FORM
  // =========================================

  const openAddForm = (type) => {
    setEditingItem(null);
    setFormType(type);

    if (type === "year") {
      setFormData({
        year_number: "",
        title: "",
        description: "",
        display_order: years.length + 1,
      });
    }

    if (type === "semester") {
      setFormData({
        semester_number: "",
        title: "",
        description: "",
        display_order: semesters.length + 1,
      });
    }

    if (type === "subject") {
      setFormData({
        subject_code: "",
        subject_name: "",
        description: "",
        icon: "",
        display_order: subjects.length + 1,
      });
    }

    if (type === "unit") {
      setFormData({
        unit_number: "",
        unit_name: "",
        description: "",
        display_order: units.length + 1,
      });
    }

    if (type === "topic") {
      setFormData({
        topic_number: "",
        topic_name: "",
        short_description: "",
        display_order: topics.length + 1,
      });
    }

    if (type === "content") {
      setFormData({
        title: "",
        content: "",
        display_order: topicContents.length + 1,
      });
    }

    setShowForm(true);
  };

  // =========================================
  // CRUD - OPEN EDIT FORM
  // =========================================

  const openEditForm = (type, item) => {
    setEditingItem(item);
    setFormType(type);

    if (type === "year") {
      setFormData({
        year_number: item.year_number || "",
        title: item.title || "",
        description: item.description || "",
        display_order: item.display_order || 1,
      });
    }

    if (type === "semester") {
      setFormData({
        semester_number: item.semester_number || "",
        title: item.title || "",
        description: item.description || "",
        display_order: item.display_order || 1,
      });
    }

    if (type === "subject") {
      setFormData({
        subject_code: item.subject_code || "",
        subject_name: item.subject_name || "",
        description: item.description || "",
        icon: item.icon || "",
        display_order: item.display_order || 1,
      });
    }

    if (type === "unit") {
      setFormData({
        unit_number: item.unit_number || "",
        unit_name: item.unit_name || "",
        description: item.description || "",
        display_order: item.display_order || 1,
      });
    }

    if (type === "topic") {
      setFormData({
        topic_number: item.topic_number || "",
        topic_name: item.topic_name || "",
        short_description: item.short_description || "",
        display_order: item.display_order || 1,
      });
    }

    if (type === "content") {
      let contentValue = item.content || "";

      if (typeof contentValue === "object") {
        contentValue = JSON.stringify(contentValue, null, 2);
      }

      setFormData({
        title: item.title || "",
        content: contentValue,
        display_order: item.display_order || 1,
      });
    }

    setShowForm(true);
  };

  // =========================================
  // FORM CHANGE
  // =========================================

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================
  // CRUD - SAVE
  // =========================================

  const handleSave = async (e) => {
    e.preventDefault();

    setFormLoading(true);

    try {
      let table = "";
      let payload = {};

      // -----------------------------------------
      // YEAR
      // -----------------------------------------

      if (formType === "year") {
        table = "years";

        payload = {
          year_number: Number(formData.year_number),
          title: formData.title,
          description: formData.description,
          display_order: Number(formData.display_order),
        };
      }

      // -----------------------------------------
      // SEMESTER
      // -----------------------------------------

      if (formType === "semester") {
        table = "semesters";

        payload = {
          year_id: selectedYear.id,
          semester_number: Number(formData.semester_number),
          title: formData.title,
          description: formData.description,
          display_order: Number(formData.display_order),
        };
      }

      // -----------------------------------------
      // SUBJECT
      // -----------------------------------------

      if (formType === "subject") {
        table = "subjects";

        payload = {
          semester_id: selectedSemester.id,
          subject_code: formData.subject_code,
          subject_name: formData.subject_name,
          description: formData.description,
          icon: formData.icon || null,
          display_order: Number(formData.display_order),
        };
      }

      // -----------------------------------------
      // UNIT
      // -----------------------------------------

      if (formType === "unit") {
        table = "units";

        payload = {
          subject_id: selectedSubject.id,
          unit_number: Number(formData.unit_number),
          unit_name: formData.unit_name,
          description: formData.description,
          display_order: Number(formData.display_order),
        };
      }

      // -----------------------------------------
      // TOPIC
      // -----------------------------------------

      if (formType === "topic") {
        table = "topics";

        payload = {
          unit_id: selectedUnit.id,
          topic_number: formData.topic_number,
          topic_name: formData.topic_name,
          short_description: formData.short_description,
          display_order: Number(formData.display_order),
        };
      }

      // -----------------------------------------
      // CONTENT
      // -----------------------------------------

      if (formType === "content") {
        table = "topic_contents";

        let finalContent = formData.content;

        try {
          finalContent = JSON.parse(formData.content);
        } catch {
          finalContent = formData.content;
        }

        payload = {
          topic_id: selectedTopic.id,
          title: formData.title,
          content: finalContent,
          display_order: Number(formData.display_order),
        };
      }

      // -----------------------------------------
      // UPDATE
      // -----------------------------------------

      if (editingItem) {
        const { error } = await supabase
          .from(table)
          .update(payload)
          .eq("id", editingItem.id);

        if (error) {
          throw error;
        }
      }

      // -----------------------------------------
      // INSERT
      // -----------------------------------------

      else {
        const { error } = await supabase
          .from(table)
          .insert([payload]);

        if (error) {
          throw error;
        }
      }

      // -----------------------------------------
      // REFRESH CURRENT LEVEL
      // -----------------------------------------

      if (formType === "year") {
        await fetchYears();
      }

      if (formType === "semester") {
        await fetchSemesters(selectedYear.id);
      }

      if (formType === "subject") {
        await fetchSubjects(selectedSemester.id);
      }

      if (formType === "unit") {
        await fetchUnits(selectedSubject.id);
      }

      if (formType === "topic") {
        await fetchTopics(selectedUnit.id);
      }

      if (formType === "content") {
        await fetchTopicContents(selectedTopic.id);
      }

      setShowForm(false);
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      console.error("CRUD Save Error:", error);

      alert(
        error.message ||
          "Unable to save this item."
      );
    }

    setFormLoading(false);
  };

  // =========================================
  // CRUD - HIDE / SHOW
  // =========================================

  const toggleActive = async (table, item) => {
    const newStatus = !item.is_active;

    const { error } = await supabase
      .from(table)
      .update({
        is_active: newStatus,
      })
      .eq("id", item.id);

    if (error) {
      console.error("Toggle Error:", error);
      alert(error.message);
      return;
    }

    if (table === "years") {
      await fetchYears();
    }

    if (table === "semesters") {
      await fetchSemesters(selectedYear.id);
    }

    if (table === "subjects") {
      await fetchSubjects(selectedSemester.id);
    }

    if (table === "units") {
      await fetchUnits(selectedSubject.id);
    }

    if (table === "topics") {
      await fetchTopics(selectedUnit.id);
    }
  };

  // =========================================
  // CRUD - PUBLISH / UNPUBLISH CONTENT
  // =========================================

  const togglePublished = async (content) => {
    const { error } = await supabase
      .from("topic_contents")
      .update({
        is_published: !content.is_published,
      })
      .eq("id", content.id);

    if (error) {
      console.error("Publish Error:", error);
      alert(error.message);
      return;
    }

    await fetchTopicContents(selectedTopic.id);
  };

  // =========================================
  // CRUD - DELETE
  // =========================================

  const deleteItem = async (table, item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.title || item.name || item.subject_name || item.unit_name || item.topic_name || "this item"}"?`
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", item.id);

    if (error) {
      console.error("Delete Error:", error);

      alert(
        "Delete failed. If this item has child data, remove the child data first."
      );

      return;
    }

    if (table === "years") {
      await fetchYears();
    }

    if (table === "semesters") {
      await fetchSemesters(selectedYear.id);
    }

    if (table === "subjects") {
      await fetchSubjects(selectedSemester.id);
    }

    if (table === "units") {
      await fetchUnits(selectedSubject.id);
    }

    if (table === "topics") {
      await fetchTopics(selectedUnit.id);
    }

    if (table === "topic_contents") {
      await fetchTopicContents(selectedTopic.id);
    }
  };

  // =========================================
  // BREADCRUMB NAVIGATION
  // =========================================

  const goToYears = () => {
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

  const goToSemesters = () => {
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedUnit(null);
    setSelectedTopic(null);

    setSubjects([]);
    setUnits([]);
    setTopics([]);
    setTopicContents([]);
  };

  const goToSubjects = () => {
    setSelectedSubject(null);
    setSelectedUnit(null);
    setSelectedTopic(null);

    setUnits([]);
    setTopics([]);
    setTopicContents([]);
  };

  const goToUnits = () => {
    setSelectedUnit(null);
    setSelectedTopic(null);

    setTopics([]);
    setTopicContents([]);
  };

  const goToTopics = () => {
    setSelectedTopic(null);
    setTopicContents([]);
  };

  // =========================================
  // CONTENT RENDER
  // =========================================

  const renderContent = (content) => {
    if (content === null || content === undefined) {
      return null;
    }

    if (typeof content === "object") {
      return (
        <pre className="content-json">
          {JSON.stringify(content, null, 2)}
        </pre>
      );
    }

    return String(content);
  };

  // =========================================
  // CRUD ACTION BUTTONS
  // =========================================

  const ActionButtons = ({
    table,
    item,
    type,
    content = false,
  }) => {
    if (!adminMode) {
      return null;
    }

    return (
      <div
        className="crud-actions"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="crud-edit"
          onClick={() =>
            openEditForm(type, item)
          }
        >
          ✏️ Edit
        </button>

        {content ? (
          <button
            type="button"
            className={
              item.is_published
                ? "crud-hide"
                : "crud-show"
            }
            onClick={() =>
              togglePublished(item)
            }
          >
            {item.is_published
              ? "🚫 Unpublish"
              : "✅ Publish"}
          </button>
        ) : (
          <button
            type="button"
            className={
              item.is_active
                ? "crud-hide"
                : "crud-show"
            }
            onClick={() =>
              toggleActive(table, item)
            }
          >
            {item.is_active
              ? "🚫 Hide"
              : "👁 Show"}
          </button>
        )}

        <button
          type="button"
          className="crud-delete"
          onClick={() =>
            deleteItem(table, item)
          }
        >
          🗑 Delete
        </button>
      </div>
    );
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <section className="college-syllabus">
        <div className="syllabus-loading">
          <div className="loading-spinner"></div>

          <h3>
            Loading College Syllabus...
          </h3>

          <p>
            Please wait while we load your syllabus.
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
      <section className="college-syllabus">
        <div className="syllabus-error">
          <div className="error-icon">
            ⚠️
          </div>

          <h2>
            Unable to Load Syllabus
          </h2>

          <p>{error}</p>

          <button onClick={fetchYears}>
            Try Again
          </button>
        </div>
      </section>
    );
  }

  // =========================================
  // COMMON LOADING UI
  // =========================================

  const LevelLoading = () => {
    if (!levelLoading) return null;

    return (
      <div className="level-loading">
        <div className="small-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  };

  // =========================================
  // EMPTY STATE
  // =========================================

  const EmptyState = ({
    icon,
    title,
    message,
  }) => {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          {icon}
        </div>

        <h3>{title}</h3>

        <p>{message}</p>
      </div>
    );
  };

  // =========================================
  // FORM TITLE
  // =========================================

  const getFormTitle = () => {
    const names = {
      year: "Academic Year",
      semester: "Semester",
      subject: "Subject",
      unit: "Unit",
      topic: "Topic",
      content: "Topic Content",
    };

    return `${editingItem ? "Edit" : "Add"} ${
      names[formType]
    }`;
  };

  // =========================================
  // MAIN UI
  // =========================================

  return (
    <section className="college-syllabus">

      {/* =====================================
          ADMIN HEADER
      ===================================== */}

      {adminMode && (
        <div className="admin-syllabus-header">
          <div>
            <span>
              🎓 ADMIN PANEL
            </span>

            <h1>
              College Syllabus Management
            </h1>

            <p>
              Manage years, semesters, subjects,
              units, topics and topic content.
            </p>
          </div>

          {onBack && (
            <button
              type="button"
              className="admin-syllabus-back"
              onClick={onBack}
            >
              ← Dashboard
            </button>
          )}
        </div>
      )}

      {/* =====================================
          NORMAL HEADER
      ===================================== */}

      {!adminMode && (
        <div className="syllabus-header">
          <div className="header-content">

            <span className="syllabus-label">
              COLLEGE SYLLABUS
            </span>

            <h1>
              Explore Your College Syllabus
            </h1>

            <p>
              Explore your complete syllabus from
              academic year to topic content.
            </p>

          </div>
        </div>
      )}

      {/* =====================================
          BREADCRUMB
      ===================================== */}

      <div className="syllabus-breadcrumb">

        <button
          type="button"
          onClick={goToYears}
        >
          Years
        </button>

        {selectedYear && (
          <>
            <span>›</span>

            <button
              type="button"
              onClick={goToSemesters}
            >
              {selectedYear.title}
            </button>
          </>
        )}

        {selectedSemester && (
          <>
            <span>›</span>

            <button
              type="button"
              onClick={goToSubjects}
            >
              {selectedSemester.title}
            </button>
          </>
        )}

        {selectedSubject && (
          <>
            <span>›</span>

            <button
              type="button"
              onClick={goToUnits}
            >
              {selectedSubject.subject_name}
            </button>
          </>
        )}

        {selectedUnit && (
          <>
            <span>›</span>

            <button
              type="button"
              onClick={goToTopics}
            >
              {selectedUnit.unit_name}
            </button>
          </>
        )}

        {selectedTopic && (
          <>
            <span>›</span>

            <span className="current-breadcrumb">
              {selectedTopic.topic_name}
            </span>
          </>
        )}

      </div>

      {/* =====================================
          YEARS
      ===================================== */}

      {!selectedYear && (
        <div className="syllabus-section">

          <div className="section-heading">

            <div>
              <span className="section-label">
                ACADEMIC PROGRAM
              </span>

              <h2>
                {adminMode
                  ? "Academic Years"
                  : "Select Your Year"}
              </h2>

              <p>
                {adminMode
                  ? "Add and manage academic years."
                  : "Choose your academic year to explore the syllabus."}
              </p>
            </div>

            {adminMode && (
              <button
                type="button"
                className="crud-add-btn"
                onClick={() =>
                  openAddForm("year")
                }
              >
                + Add Year
              </button>
            )}

          </div>

          {years.length === 0 ? (
            <EmptyState
              icon="📚"
              title="No academic years available"
              message="Please add years."
            />
          ) : (
            <div className="syllabus-grid">

              {years.map((year) => (
                <div
                  className="syllabus-card-wrapper"
                  key={year.id}
                >
                  <button
                    type="button"
                    className="syllabus-card"
                    onClick={() =>
                      handleYearClick(year)
                    }
                  >

                    <div className="card-number">
                      {year.year_number}
                    </div>

                    <div className="card-content">

                      <span>
                        ACADEMIC YEAR
                      </span>

                      <h3>
                        {year.title}
                      </h3>

                      <p>
                        {year.description ||
                          "Explore syllabus"}
                      </p>

                    </div>

                    <div className="card-arrow">
                      →
                    </div>

                  </button>

                  <ActionButtons
                    table="years"
                    item={year}
                    type="year"
                  />
                </div>
              ))}

            </div>
          )}

        </div>
      )}

      {/* =====================================
          SEMESTERS
      ===================================== */}

      {selectedYear &&
        !selectedSemester && (
          <div className="syllabus-section">

            <div className="section-heading">

              <div>
                <span className="section-label">
                  {selectedYear.title}
                </span>

                <h2>
                  {adminMode
                    ? "Semesters"
                    : "Select Semester"}
                </h2>

                <p>
                  {adminMode
                    ? "Manage semesters for this year."
                    : "Choose a semester to view its subjects."}
                </p>
              </div>

              {adminMode && (
                <button
                  type="button"
                  className="crud-add-btn"
                  onClick={() =>
                    openAddForm("semester")
                  }
                >
                  + Add Semester
                </button>
              )}

            </div>

            <LevelLoading />

            {!levelLoading &&
            semesters.length === 0 ? (
              <EmptyState
                icon="📘"
                title="No semesters available"
                message="No semesters have been added for this year yet."
              />
            ) : (
              !levelLoading && (
                <div className="list-container">

                  {semesters.map(
                    (semester) => (
                      <div
                        className="crud-item-wrapper"
                        key={semester.id}
                      >

                        <button
                          type="button"
                          className="list-card"
                          onClick={() =>
                            handleSemesterClick(
                              semester
                            )
                          }
                        >

                          <div className="list-icon">
                            📘
                          </div>

                          <div className="list-content">

                            <span className="item-label">
                              SEMESTER
                            </span>

                            <h3>
                              {semester.title}
                            </h3>

                            <p>
                              {semester.description ||
                                "Explore subjects"}
                            </p>

                          </div>

                          <span className="list-arrow">
                            →
                          </span>

                        </button>

                        <ActionButtons
                          table="semesters"
                          item={semester}
                          type="semester"
                        />

                      </div>
                    )
                  )}

                </div>
              )
            )}

          </div>
        )}

      {/* =====================================
          SUBJECTS
      ===================================== */}

      {selectedSemester &&
        !selectedSubject && (
          <div className="syllabus-section">

            <div className="section-heading">

              <div>
                <span className="section-label">
                  {selectedSemester.title}
                </span>

                <h2>
                  {adminMode
                    ? "Subjects"
                    : "Select Subject"}
                </h2>

                <p>
                  {adminMode
                    ? "Manage subjects for this semester."
                    : "Choose a subject to explore its units."}
                </p>
              </div>

              {adminMode && (
                <button
                  type="button"
                  className="crud-add-btn"
                  onClick={() =>
                    openAddForm("subject")
                  }
                >
                  + Add Subject
                </button>
              )}

            </div>

            <LevelLoading />

            {!levelLoading &&
            subjects.length === 0 ? (
              <EmptyState
                icon="📚"
                title="No subjects available"
                message="No subjects have been added for this semester yet."
              />
            ) : (
              !levelLoading && (
                <div className="list-container">

                  {subjects.map(
                    (subject) => (
                      <div
                        className="crud-item-wrapper"
                        key={subject.id}
                      >

                        <button
                          type="button"
                          className="list-card"
                          onClick={() =>
                            handleSubjectClick(
                              subject
                            )
                          }
                        >

                          <div className="list-icon">
                            {subject.icon ||
                              "📚"}
                          </div>

                          <div className="list-content">

                            <span className="item-label">
                              {subject.subject_code ||
                                "SUBJECT"}
                            </span>

                            <h3>
                              {subject.subject_name}
                            </h3>

                            <p>
                              {subject.description ||
                                "Explore subject units"}
                            </p>

                          </div>

                          <span className="list-arrow">
                            →
                          </span>

                        </button>

                        <ActionButtons
                          table="subjects"
                          item={subject}
                          type="subject"
                        />

                      </div>
                    )
                  )}

                </div>
              )
            )}

          </div>
        )}

      {/* =====================================
          UNITS
      ===================================== */}

      {selectedSubject &&
        !selectedUnit && (
          <div className="syllabus-section">

            <div className="section-heading">

              <div>
                <span className="section-label">
                  {selectedSubject.subject_name}
                </span>

                <h2>
                  {adminMode
                    ? "Course Units"
                    : "Course Units"}
                </h2>

                <p>
                  {adminMode
                    ? "Manage units for this subject."
                    : "Select a unit to view its topics."}
                </p>
              </div>

              {adminMode && (
                <button
                  type="button"
                  className="crud-add-btn"
                  onClick={() =>
                    openAddForm("unit")
                  }
                >
                  + Add Unit
                </button>
              )}

            </div>

            <LevelLoading />

            {!levelLoading &&
            units.length === 0 ? (
              <EmptyState
                icon="📖"
                title="No units available"
                message="No units have been added for this subject yet."
              />
            ) : (
              !levelLoading && (
                <div className="unit-list">

                  {units.map((unit) => (
                    <div
                      className="crud-item-wrapper"
                      key={unit.id}
                    >

                      <button
                        type="button"
                        className="unit-card"
                        onClick={() =>
                          handleUnitClick(
                            unit
                          )
                        }
                      >

                        <div className="unit-number">
                          {unit.unit_number}
                        </div>

                        <div className="unit-content">

                          <span className="item-label">
                            UNIT
                          </span>

                          <h3>
                            {unit.unit_name}
                          </h3>

                          <p>
                            {unit.description ||
                              "Explore topics in this unit"}
                          </p>

                        </div>

                        <span className="list-arrow">
                          →
                        </span>

                      </button>

                      <ActionButtons
                        table="units"
                        item={unit}
                        type="unit"
                      />

                    </div>
                  ))}

                </div>
              )
            )}

          </div>
        )}

      {/* =====================================
          TOPICS
      ===================================== */}

      {selectedUnit &&
        !selectedTopic && (
          <div className="syllabus-section">

            <div className="section-heading">

              <div>
                <span className="section-label">
                  {selectedUnit.unit_name}
                </span>

                <h2>
                  Topics
                </h2>

                <p>
                  {adminMode
                    ? "Manage topics for this unit."
                    : "Select a topic to view its learning content."}
                </p>
              </div>

              {adminMode && (
                <button
                  type="button"
                  className="crud-add-btn"
                  onClick={() =>
                    openAddForm("topic")
                  }
                >
                  + Add Topic
                </button>
              )}

            </div>

            <LevelLoading />

            {!levelLoading &&
            topics.length === 0 ? (
              <EmptyState
                icon="📝"
                title="No topics available"
                message="No topics have been added for this unit yet."
              />
            ) : (
              !levelLoading && (
                <div className="topic-list">

                  {topics.map((topic) => (
                    <div
                      className="crud-item-wrapper"
                      key={topic.id}
                    >

                      <button
                        type="button"
                        className="topic-card"
                        onClick={() =>
                          handleTopicClick(
                            topic
                          )
                        }
                      >

                        <div className="topic-number">
                          {topic.topic_number}
                        </div>

                        <div className="topic-content">

                          <span className="item-label">
                            TOPIC
                          </span>

                          <h3>
                            {topic.topic_name}
                          </h3>

                          <p>
                            {topic.short_description ||
                              "Explore this topic"}
                          </p>

                        </div>

                        <span className="list-arrow">
                          →
                        </span>

                      </button>

                      <ActionButtons
                        table="topics"
                        item={topic}
                        type="topic"
                      />

                    </div>
                  ))}

                </div>
              )
            )}

          </div>
        )}

      {/* =====================================
          TOPIC CONTENT
      ===================================== */}

      {selectedTopic && (
        <div className="syllabus-section">

          <div className="section-heading">

            <div className="topic-detail">

              <span className="section-label">
                TOPIC {selectedTopic.topic_number}
              </span>

              <h2>
                {selectedTopic.topic_name}
              </h2>

              <p>
                {selectedTopic.short_description ||
                  "Explore the learning content for this topic."}
              </p>

            </div>

            {adminMode && (
              <button
                type="button"
                className="crud-add-btn"
                onClick={() =>
                  openAddForm("content")
                }
              >
                + Add Content
              </button>
            )}

          </div>

          {contentLoading ? (
            <div className="content-loading">

              <div className="small-spinner"></div>

              <p>
                Loading learning content...
              </p>

            </div>
          ) : topicContents.length === 0 ? (
            <EmptyState
              icon="📖"
              title="No learning content available"
              message={
                adminMode
                  ? "Add learning content for this topic."
                  : "Published content for this topic has not been added yet."
              }
            />
          ) : (
            <div className="content-container">

              {topicContents.map(
                (content, index) => (
                  <div
                    className="crud-item-wrapper"
                    key={content.id}
                  >

                    <article className="content-card">

                      <div className="content-number">
                        {index + 1}
                      </div>

                      <div className="content-body">

                        <h3>
                          {content.title}
                        </h3>

                        <div className="content-text">

                          {renderContent(
                            content.content
                          )}

                        </div>

                      </div>

                    </article>

                    <ActionButtons
                      table="topic_contents"
                      item={content}
                      type="content"
                      content={true}
                    />

                  </div>
                )
              )}

            </div>
          )}

        </div>
      )}

      {/* =====================================
          CRUD FORM MODAL
      ===================================== */}

      {adminMode && showForm && (
        <div
          className="crud-modal-overlay"
          onClick={() =>
            !formLoading &&
            setShowForm(false)
          }
        >

          <div
            className="crud-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="crud-modal-header">

              <div>
                <span>
                  🎓 COLLEGE SYLLABUS
                </span>

                <h2>
                  {getFormTitle()}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  !formLoading &&
                  setShowForm(false)
                }
              >
                ✕
              </button>

            </div>

            <form
              onSubmit={handleSave}
              className="crud-form"
            >

              {/* YEAR FORM */}

              {formType === "year" && (
                <>
                  <label>
                    Year Number
                    <input
                      type="number"
                      name="year_number"
                      value={
                        formData.year_number ||
                        ""
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                    />
                  </label>

                  <label>
                    Title
                    <input
                      type="text"
                      name="title"
                      value={
                        formData.title || ""
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="1st Year"
                      required
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      name="description"
                      value={
                        formData.description ||
                        ""
                      }
                      onChange={
                        handleFormChange
                      }
                    />
                  </label>

                  <label>
                    Display Order
                    <input
                      type="number"
                      name="display_order"
                      value={
                        formData.display_order ||
                        ""
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                    />
                  </label>
                </>
              )}

              {/* SEMESTER FORM */}

              {formType === "semester" && (
                <>
                  <label>
                    Semester Number
                    <input
                      type="number"
                      name="semester_number"
                      value={
                        formData.semester_number ||
                        ""
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                    />
                  </label>

                  <label>
                    Title
                    <input
                      type="text"
                      name="title"
                      value={
                        formData.title || ""
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Semester 1"
                      required
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      name="description"
                      value={
                        formData.description ||
                        ""
                      }
                      onChange={
                        handleFormChange
                      }
                    />
                  </label>

                  <label>
                    Display Order
                    <input
                      type="number"
                      name="display_order"
                      value={
                        formData.display_order ||
                        ""
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                    />
                  </label>
                </>
              )}

              {/* SUBJECT FORM */}

              {formType === "subject" && (
                <>
                  <label>
                    Subject Code
                    <input
                      type="text"
                      name="subject_code"
                      value={
                        formData.subject_code ||
                        ""
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="CS-101"
                      required
                    />
                  </label>

                  <label>
                    Subject Name
                    <input
                      type="text"
                      name="subject_name"
                      value={
                        formData.subject_name ||
                        ""
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                    />
                  </label>

                  <label>
                    Icon
                    <input
                      type="text"
                      name="icon"
                      value={
                        formData.icon || ""
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="📚"
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      name="description"
                      value={
                        formData.description ||
                        ""
                      }
                      onChange={
                        handleFormChange
                      }
                    />
                  </label>

                  <label>
                    Display Order
                    <input
                      type="number"
                      name="display_order"
                      value={
                        formData.display_order ||
                        ""
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                    />
                  </label>
                </>
              )}

              {/* UNIT FORM */}

              {formType === "unit" && (
                <>
                  <label>
                    Unit Number
                    <input
                      type="number"
                      name="unit_number"
                      value={
                        formData.unit_number ||
                        ""
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                    />
                  </label>

                  <label>
                    Unit Name
                    <input
                      type="text"
                      name="unit_name"
                      value={
                        formData.unit_name || ""
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Unit 1 - Introduction"
                      required
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      name="description"
                      value={
                        formData.description ||
                        ""
                      }
                      onChange={
                        handleFormChange
                      }
                    />
                  </label>

                  <label>
                    Display Order
                    <input
                      type="number"
                      name="display_order"
                      value={
                        formData.display_order ||
                        ""
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                    />
                  </label>
                </>
              )}

              {/* TOPIC FORM */}

              {formType === "topic" && (
                <>
                  <label>
                    Topic Number
                    <input
                      type="text"
                      name="topic_number"
                      value={
                        formData.topic_number ||
                        ""
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="1.1"
                      required
                    />
                  </label>

                  <label>
                    Topic Name
                    <input
                      type="text"
                      name="topic_name"
                      value={
                        formData.topic_name || ""
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                    />
                  </label>

                  <label>
                    Short Description
                    <textarea
                      name="short_description"
                      value={
                        formData.short_description ||
                        ""
                      }
                      onChange={
                        handleFormChange
                      }
                    />
                  </label>

                  <label>
                    Display Order
                    <input
                      type="number"
                      name="display_order"
                      value={
                        formData.display_order ||
                        ""
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                    />
                  </label>
                </>
              )}

              {/* CONTENT FORM */}

              {formType === "content" && (
                <>
                  <label>
                    Content Title
                    <input
                      type="text"
                      name="title"
                      value={
                        formData.title || ""
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Introduction"
                      required
                    />
                  </label>

                  <label>
                    Learning Content
                    <textarea
                      className="crud-content-textarea"
                      name="content"
                      value={
                        formData.content || ""
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Write the learning content here..."
                      required
                    />
                  </label>

                  <label>
                    Display Order
                    <input
                      type="number"
                      name="display_order"
                      value={
                        formData.display_order ||
                        ""
                      }
                      onChange={
                        handleFormChange
                      }
                      required
                    />
                  </label>
                </>
              )}

              <div className="crud-form-actions">

                <button
                  type="button"
                  className="crud-cancel-btn"
                  onClick={() =>
                    setShowForm(false)
                  }
                  disabled={formLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="crud-save-btn"
                  disabled={formLoading}
                >
                  {formLoading
                    ? "Saving..."
                    : editingItem
                    ? "Update"
                    : "Add"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </section>
  );
}

export default CollegeSyllabus;