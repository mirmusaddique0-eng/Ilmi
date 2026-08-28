import { useEffect, useState } from "react";
import "./AdminPracticeQuiz.css";
import { supabase } from "../lib/supabaseClient";

function AdminPracticeQuiz() {
  // =========================================
  // QUESTIONS
  // =========================================

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================
  // FILTER
  // =========================================

  const [filterType, setFilterType] = useState("all");
  const [searchText, setSearchText] = useState("");

  // =========================================
  // MODAL
  // =========================================

  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [saving, setSaving] = useState(false);

  // =========================================
  // FORM
  // =========================================

  const emptyForm = {
    question_type: "quiz",
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A",
    explanation: "",
    is_active: true,
  };

  const [form, setForm] = useState(emptyForm);

  // =========================================
  // LOAD QUESTIONS
  // =========================================

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("practice_questions")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Practice Questions Error:", error);
        setError(error.message);
        return;
      }

      setQuestions(data || []);
    } catch (err) {
      console.error("Practice Questions Error:", err);
      setError("Unable to load questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  // =========================================
  // FORM CHANGE
  // =========================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================================
  // OPEN ADD
  // =========================================

  const openAddQuestion = () => {
    setEditingQuestion(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  // =========================================
  // OPEN EDIT
  // =========================================

  const openEditQuestion = (question) => {
  setEditingQuestion(question);

  setForm({
    question_type: question.question_type || "quiz",
    question_text: question.question || "",
    option_a: question.option_a || "",
    option_b: question.option_b || "",
    option_c: question.option_c || "",
    option_d: question.option_d || "",
    correct_option: question.correct_option || "A",
    explanation: question.explanation || "",
    is_active: question.is_active !== false,
  });

  setShowModal(true);
};

  // =========================================
  // CLOSE MODAL
  // =========================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingQuestion(null);
    setForm(emptyForm);
  };

  // =========================================
  // SAVE QUESTION
  // =========================================

  const saveQuestion = async (e) => {
    e.preventDefault();

    if (!form.question_text.trim()) {
      alert("Please enter the question.");
      return;
    }

    if (
      !form.option_a.trim() ||
      !form.option_b.trim() ||
      !form.option_c.trim() ||
      !form.option_d.trim()
    ) {
      alert("Please fill all four options.");
      return;
    }

    try {
      setSaving(true);

     const payload = {
  question_type: form.question_type,
  question: form.question_text.trim(),
  option_a: form.option_a.trim(),
  option_b: form.option_b.trim(),
  option_c: form.option_c.trim(),
  option_d: form.option_d.trim(),
  correct_option: form.correct_option,
  explanation: form.explanation.trim() || null,
  is_active: form.is_active,
  updated_at: new Date().toISOString(),
};

      let result;

      if (editingQuestion) {
        result = await supabase
          .from("practice_questions")
          .update(payload)
          .eq("id", editingQuestion.id);
      } else {
        result = await supabase
          .from("practice_questions")
          .insert([
            {
              ...payload,
              created_at: new Date().toISOString(),
            },
          ]);
      }

      if (result.error) {
        console.error("Save Question Error:", result.error);
        alert(result.error.message);
        return;
      }

      alert(
        editingQuestion
          ? "Question updated successfully."
          : "Question added successfully."
      );

      closeModal();
      loadQuestions();
    } catch (err) {
      console.error("Save Question Error:", err);
      alert("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // DELETE QUESTION
  // =========================================

  const deleteQuestion = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("practice_questions")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Delete Question Error:", error);
        alert(error.message);
        return;
      }

      loadQuestions();
    } catch (err) {
      console.error("Delete Question Error:", err);
      alert("Unable to delete question.");
    }
  };

  // =========================================
  // TOGGLE ACTIVE
  // =========================================

  const toggleQuestionStatus = async (question) => {
    try {
      const { error } = await supabase
        .from("practice_questions")
        .update({
          is_active: !question.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", question.id);

      if (error) {
        console.error("Status Update Error:", error);
        alert(error.message);
        return;
      }

      loadQuestions();
    } catch (err) {
      console.error("Status Update Error:", err);
      alert("Unable to update question status.");
    }
  };

  // =========================================
  // FILTER QUESTIONS
  // =========================================

  const filteredQuestions = questions.filter((question) => {
    const matchesType =
      filterType === "all" ||
      question.question_type === filterType;

    const search = searchText.toLowerCase().trim();

    const matchesSearch =
      !search ||
      question.question_text?.toLowerCase().includes(search) ||
      String(question.id).includes(search);

    return matchesType && matchesSearch;
  });

  // =========================================
  // STATS
  // =========================================

  const totalQuestions = questions.length;

  const syllabusQuestions = questions.filter(
    (q) => q.question_type === "syllabus"
  ).length;

  const courseQuestions = questions.filter(
    (q) => q.question_type === "quiz"
  ).length;

  const codingQuestions = questions.filter(
    (q) => q.question_type === "coding"
  ).length;

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="admin-practice-quiz">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="practice-header">
        <div>
          <h1>Practice & Quizzes</h1>
          <p>
            Manage practice questions and quiz question bank.
          </p>
        </div>

        <button
          className="practice-add-btn"
          onClick={openAddQuestion}
        >
          + Add Question
        </button>
      </div>

      {/* =====================================
          STATS
      ===================================== */}

      <div className="practice-stats">

        <div className="practice-stat-card">
          <span>Total Questions</span>
          <strong>{totalQuestions}</strong>
        </div>

        <div className="practice-stat-card">
          <span>Syllabus</span>
          <strong>{syllabusQuestions}</strong>
        </div>

        <div className="practice-stat-card">
          <span>Course</span>
          <strong>{courseQuestions}</strong>
        </div>

        <div className="practice-stat-card">
          <span>Coding</span>
          <strong>{codingQuestions}</strong>
        </div>

      </div>

      {/* =====================================
          QUESTION BANK
      ===================================== */}

      <div className="question-bank">

        <div className="question-bank-header">

          <div>
            <h2>Question Bank</h2>
            <p>
              Manage all practice and quiz questions.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search questions..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

        </div>

        {/* FILTERS */}

        <div className="question-filters">

          <button
            className={filterType === "all" ? "active" : ""}
            onClick={() => setFilterType("all")}
          >
            All
          </button>

          <button
            className={filterType === "syllabus" ? "active" : ""}
            onClick={() => setFilterType("syllabus")}
          >
            Syllabus
          </button>

          <button
            className={filterType === "quiz" ? "active" : ""}
            onClick={() => setFilterType("quiz")}
          >
            Course
          </button>

          <button
            className={filterType === "coding" ? "active" : ""}
            onClick={() => setFilterType("coding")}
          >
            Coding
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="practice-error">
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="practice-loading">
            Loading questions...
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="practice-empty">
            No questions found.
          </div>
        ) : (
          <div className="question-list">

            {filteredQuestions.map((question) => (
              <div
                className="question-item"
                key={question.id}
              >

                <div className="question-main">

                  <div className="question-top">

                    <span className="question-id">
                      #{question.id}
                    </span>

                    <span
                      className={`question-type ${question.question_type}`}
                    >
                      {question.question_type}
                    </span>

                    <span
                      className={
                        question.is_active
                          ? "status active"
                          : "status inactive"
                      }
                    >
                      {question.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </div>

                  <h3>
                    {question.question_text}
                  </h3>

                  <div className="question-options">

                    <span>
                      A. {question.option_a}
                    </span>

                    <span>
                      B. {question.option_b}
                    </span>

                    <span>
                      C. {question.option_c}
                    </span>

                    <span>
                      D. {question.option_d}
                    </span>

                  </div>

                  <div className="question-answer">
                    Correct Answer:{" "}
                    <strong>
                      {question.correct_option}
                    </strong>
                  </div>

                </div>

                <div className="question-actions">

                  <button
                    onClick={() =>
                      toggleQuestionStatus(question)
                    }
                  >
                    {question.is_active
                      ? "Disable"
                      : "Enable"}
                  </button>

                  <button
                    onClick={() =>
                      openEditQuestion(question)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      deleteQuestion(question.id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

      {/* =====================================
          ADD / EDIT MODAL
      ===================================== */}

      {showModal && (
        <div className="practice-modal-overlay">

          <div className="practice-modal">

            <div className="practice-modal-header">

              <div>
                <h2>
                  {editingQuestion
                    ? "Edit Question"
                    : "Add Question"}
                </h2>

                <p>
                  Add a question to the question bank.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form onSubmit={saveQuestion}>

              {/* TYPE */}

              <div className="form-group">

                <label>
                  Question Type
                </label>

                <select
                  name="question_type"
                  value={form.question_type}
                  onChange={handleChange}
                >
                  <option value="syllabus">
                    Syllabus
                  </option>

                  <option value="quiz">
                    Course
                  </option>

                  <option value="coding">
                    Coding
                  </option>
                </select>

              </div>

              {/* QUESTION */}

              <div className="form-group">

                <label>
                  Question
                </label>

                <textarea
                  name="question_text"
                  value={form.question_text}
                  onChange={handleChange}
                  placeholder="Enter question..."
                  rows="4"
                  required
                />

              </div>

              {/* OPTIONS */}

              <div className="form-grid">

                <div className="form-group">
                  <label>Option A</label>

                  <input
                    type="text"
                    name="option_a"
                    value={form.option_a}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Option B</label>

                  <input
                    type="text"
                    name="option_b"
                    value={form.option_b}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Option C</label>

                  <input
                    type="text"
                    name="option_c"
                    value={form.option_c}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Option D</label>

                  <input
                    type="text"
                    name="option_d"
                    value={form.option_d}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              {/* CORRECT */}

              <div className="form-group">

                <label>
                  Correct Option
                </label>

                <select
                  name="correct_option"
                  value={form.correct_option}
                  onChange={handleChange}
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>

              </div>

              {/* EXPLANATION */}

              <div className="form-group">

                <label>
                  Explanation
                </label>

                <textarea
                  name="explanation"
                  value={form.explanation}
                  onChange={handleChange}
                  placeholder="Explain the correct answer..."
                  rows="3"
                />

              </div>

              {/* ACTIVE */}

              <label className="checkbox-row">

                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                />

                <span>
                  Question is active
                </span>

              </label>

              {/* ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingQuestion
                    ? "Update Question"
                    : "Add Question"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default AdminPracticeQuiz;