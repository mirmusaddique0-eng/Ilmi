import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./FeaturePage.css";

function PracticeQuizzes() {
  const [practiceType, setPracticeType] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState(null);

  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const [loading, setLoading] = useState(false);
  const [savingResult, setSavingResult] =
    useState(false);

  // =========================================
  // START PRACTICE
  // =========================================

  const startPractice = async (type) => {
    setPracticeType(type);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
    setLoading(true);

    let questionType = "quiz";

    if (type === "Syllabus Questions") {
      questionType = "syllabus";
    }

    if (type === "Coding Practice") {
      questionType = "coding";
    }

    // =========================================
    // FETCH QUESTIONS
    // =========================================

    const { data, error } = await supabase
      .from("practice_questions")
      .select(`
        id,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        explanation
      `)
      .eq("question_type", questionType)
      .eq("is_active", true)
      .order("id", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Practice questions error:",
        error
      );

      setQuestions([]);
      setLoading(false);
      return;
    }

    console.log(
      "Practice Questions:",
      data
    );

    setQuestions(data || []);
    setLoading(false);
  };

  // =========================================
  // SAVE PRACTICE RESULT
  // =========================================

  const savePracticeResult = async (finalScore) => {
    try {
      setSavingResult(true);

      const totalQuestions =
        questions.length;

      const correctAnswers =
        finalScore;

      const wrongAnswers =
        totalQuestions -
        correctAnswers;

      const scorePercent =
        totalQuestions > 0
          ? Math.round(
              (correctAnswers /
                totalQuestions) *
                100
            )
          : 0;

      // =========================================
      // GET LOGGED-IN USER
      // =========================================

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "Get user error:",
          userError
        );
        return;
      }

      if (!user) {
        console.error(
          "No logged-in user found."
        );

        alert(
          "Please login before completing a quiz."
        );

        return;
      }

      console.log(
        "Logged-in user:",
        user.id
      );

      // =========================================
      // SAVE INTO quiz_attempts
      // =========================================

      const startedAt =
        new Date().toISOString();

      const completedAt =
        new Date().toISOString();

      const { data, error } =
        await supabase
          .from("quiz_attempts")
          .insert({
            quiz_id: null,

            user_id: user.id,

            score: scorePercent,

            total_marks:
              totalQuestions,

            correct_answers:
              correctAnswers,

            wrong_answers:
              wrongAnswers,

            started_at:
              startedAt,

            completed_at:
              completedAt,
          })
          .select();

      if (error) {
        console.error(
          "Quiz attempt save error:",
          error
        );

        alert(
          `Unable to save quiz attempt.\n\n${error.message}`
        );

        return;
      }

      console.log(
        "Quiz attempt saved successfully:",
        data
      );

    } catch (error) {
      console.error(
        "Quiz attempt error:",
        error
      );
    } finally {
      setSavingResult(false);
    }
  };

  // =========================================
  // NEXT / FINISH
  // =========================================

  const handleNext = async () => {
    if (selectedAnswer === null) {
      return;
    }

    const question =
      questions[currentQuestion];

    if (!question) {
      return;
    }

    const selectedOption =
      String.fromCharCode(
        65 + selectedAnswer
      );

    const isCorrect =
      selectedOption ===
      question.correct_option;

    const updatedScore =
      score +
      (isCorrect ? 1 : 0);

    setScore(updatedScore);

    // =========================================
    // LAST QUESTION
    // =========================================

    if (
      currentQuestion ===
      questions.length - 1
    ) {
      await savePracticeResult(
        updatedScore
      );

      setFinished(true);

      return;
    }

    // =========================================
    // NEXT QUESTION
    // =========================================

    setCurrentQuestion(
      currentQuestion + 1
    );

    setSelectedAnswer(null);
  };

  // =========================================
  // RESTART
  // =========================================

  const restart = () => {
    setPracticeType(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
    setSavingResult(false);
  };

  // =========================================
  // LOADING QUESTIONS
  // =========================================

  if (
    practiceType &&
    loading
  ) {
    return (
      <div className="feature-page">

        <div className="feature-header">

          <span>LEARN</span>

          <h1>
            {practiceType}
          </h1>

          <p>
            Loading questions...
          </p>

        </div>

      </div>
    );
  }

  // =========================================
  // NO QUESTIONS
  // =========================================

  if (
    practiceType &&
    !loading &&
    questions.length === 0
  ) {
    return (
      <div className="feature-page">

        <div className="feature-header">

          <span>LEARN</span>

          <h1>
            {practiceType}
          </h1>

          <p>
            No questions available.
          </p>

        </div>

        <button
          className="practice-primary-btn"
          onClick={restart}
        >
          Back to Practice
        </button>

      </div>
    );
  }

  // =========================================
  // RESULT
  // =========================================

  if (
    practiceType &&
    finished
  ) {
    const percentage =
      questions.length > 0
        ? Math.round(
            (score /
              questions.length) *
              100
          )
        : 0;

    return (
      <div className="feature-page">

        <div className="feature-header">

          <span>LEARN</span>

          <h1>
            Practice Completed
          </h1>

          <p>
            You have completed your
            practice session.
          </p>

        </div>

        <div className="practice-result">

          <h2>
            Your Score
          </h2>

          <div className="practice-score">
            {score} / {questions.length}
          </div>

          <p>
            Correct Answers:{" "}
            {score}
          </p>

          <p>
            Wrong Answers:{" "}
            {questions.length - score}
          </p>

          <p>
            Score: {percentage}%
          </p>

          {savingResult && (
            <p>
              Saving result...
            </p>
          )}

          {!savingResult && (
            <p>
              Result saved successfully.
            </p>
          )}

          <button
            className="practice-primary-btn"
            onClick={restart}
          >
            Back to Practice
          </button>

        </div>

      </div>
    );
  }

  // =========================================
  // QUESTION PAGE
  // =========================================

  if (practiceType) {
    const question =
      questions[currentQuestion];

    if (!question) {
      return (
        <div className="feature-page">
          <div className="feature-header">
            <h1>
              Question not found
            </h1>
          </div>

          <button
            className="practice-primary-btn"
            onClick={restart}
          >
            Back to Practice
          </button>
        </div>
      );
    }

    const options = [
      question.option_a,
      question.option_b,
      question.option_c,
      question.option_d,
    ];

    return (
      <div className="feature-page">

        <div className="feature-header">

          <span>LEARN</span>

          <h1>
            {practiceType}
          </h1>

          <p>
            Question{" "}
            {currentQuestion + 1} of{" "}
            {questions.length}
          </p>

        </div>

        <div className="practice-question">

          <h2>
            {question.question}
          </h2>

          <div className="practice-options">

            {options.map(
              (option, index) => (

                <button
                  key={index}
                  className={
                    selectedAnswer ===
                    index
                      ? "practice-option selected"
                      : "practice-option"
                  }
                  onClick={() =>
                    setSelectedAnswer(
                      index
                    )
                  }
                >

                  <span>
                    {String.fromCharCode(
                      65 + index
                    )}
                  </span>

                  {option}

                </button>

              )
            )}

          </div>

          <button
            className="practice-primary-btn"
            onClick={handleNext}
            disabled={
              selectedAnswer === null ||
              savingResult
            }
          >
            {currentQuestion ===
            questions.length - 1
              ? "Finish"
              : "Next →"}
          </button>

        </div>

      </div>
    );
  }

  // =========================================
  // MAIN PAGE
  // =========================================

  return (
    <div className="feature-page">

      <div className="feature-header">

        <span>LEARN</span>

        <h1>
          Practice & Quizzes
        </h1>

        <p>
          Practice what you learn and
          test your knowledge.
        </p>

      </div>

      <div className="feature-content">

        <h2>
          Choose Practice
        </h2>

        <div className="practice-list">

          {/* =================================
              SYLLABUS QUESTIONS
          ================================= */}

          <div className="practice-item">

            <div>

              <h3>
                Syllabus Questions
              </h3>

              <p>
                Practice questions based
                on your college syllabus
                and subjects.
              </p>

            </div>

            <button
              className="practice-primary-btn"
              onClick={() =>
                startPractice(
                  "Syllabus Questions"
                )
              }
            >
              Start
            </button>

          </div>

          {/* =================================
              QUIZZES
          ================================= */}

          <div className="practice-item">

            <div>

              <h3>
                Quizzes
              </h3>

              <p>
                Test your knowledge with
                random course questions.
              </p>

            </div>

            <button
              className="practice-primary-btn"
              onClick={() =>
                startPractice("Quiz")
              }
            >
              Start
            </button>

          </div>

          {/* =================================
              CODING PRACTICE
          ================================= */}

          <div className="practice-item">

            <div>

              <h3>
                Coding Practice
              </h3>

              <p>
                Improve your programming
                skills with coding questions.
              </p>

            </div>

            <button
              className="practice-primary-btn"
              onClick={() =>
                startPractice(
                  "Coding Practice"
                )
              }
            >
              Start
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default PracticeQuizzes;