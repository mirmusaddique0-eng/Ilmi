import { useEffect, useState } from "react";
import "./Profile.css";
import { supabase } from "../lib/supabaseClient";

function Profile({ user, onLogout }) {

  // =========================================
  // PROFILE DATA
  // =========================================

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");


  // =========================================
  // LEARNING STATS
  // =========================================

  const [coursesStarted, setCoursesStarted] = useState(0);
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState(0);


  // =========================================
  // EDIT PROFILE
  // =========================================

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");


  // =========================================
  // UI STATE
  // =========================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");


  // =========================================
  // LOAD PROFILE + LEARNING STATS
  // =========================================

  useEffect(() => {

    const loadProfile = async () => {

      if (!user) {
        setLoading(false);
        return;
      }

      try {

        setLoading(true);
        setError("");


        // =====================================
        // PROFILE INFORMATION
        // =====================================

        const userFullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          "EDUVANTA User";

        setFullName(userFullName);

        setEmail(user.email || "");

        setCreatedAt(user.created_at || "");

        setEditName(userFullName);


        // =====================================
        // COURSE PROGRESS
        // =====================================

        const {
          data: progressData,
          error: progressError
        } = await supabase
          .from("course_progress")
          .select(
            "course_id, lesson_id, progress_percent, is_completed"
          )
          .eq("user_id", user.id);


        if (progressError) {

          console.error(
            "Course Progress Error:",
            progressError
          );

        } else {

          const progress =
            progressData || [];


          // ===================================
          // COURSES STARTED
          // ===================================

          const uniqueCourses =
            new Set(
              progress
                .map(
                  (item) =>
                    item.course_id
                )
                .filter(Boolean)
            );

          setCoursesStarted(
            uniqueCourses.size
          );


          // ===================================
          // LESSONS COMPLETED
          // ===================================

          const completedLessons =
            progress.filter(
              (item) =>
                item.is_completed === true
            ).length;

          setLessonsCompleted(
            completedLessons
          );


          // ===================================
          // OVERALL PROGRESS
          // ===================================

          const validProgress =
            progress
              .map(
                (item) =>
                  Number(
                    item.progress_percent
                  )
              )
              .filter(
                (value) =>
                  !Number.isNaN(value)
              );


          const averageProgress =
            validProgress.length > 0
              ? Math.round(
                  validProgress.reduce(
                    (sum, value) =>
                      sum + value,
                    0
                  ) /
                    validProgress.length
                )
              : 0;


          setOverallProgress(
            averageProgress
          );

        }


        // =====================================
        // QUIZ ATTEMPTS
        // =====================================

        const {
          data: quizData,
          error: quizError
        } = await supabase
          .from("quiz_attempts")
          .select("id")
          .eq("user_id", user.id);


        if (quizError) {

          console.error(
            "Quiz Attempts Error:",
            quizError
          );

        }


        // =====================================
        // PRACTICE RESULTS
        // =====================================

        const {
          data: practiceData,
          error: practiceError
        } = await supabase
          .from("practice_results")
          .select("id")
          .eq("user_id", user.id);


        if (practiceError) {

          console.error(
            "Practice Results Error:",
            practiceError
          );

        }


        // =====================================
        // TOTAL PRACTICE / QUIZ ATTEMPTS
        // =====================================

        const quizCount =
          quizData?.length || 0;

        const practiceCount =
          practiceData?.length || 0;


        setQuizAttempts(
          quizCount +
          practiceCount
        );


      } catch (err) {

        console.error(
          "Profile Loading Error:",
          err
        );

        setError(
          "Unable to load profile data."
        );

      } finally {

        setLoading(false);

      }

    };


    loadProfile();

  }, [user]);


  // =========================================
  // INITIALS
  // =========================================

  const getInitials = (name) => {

    const words =
      name
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    if (words.length === 0) {
      return "U";
    }


    if (words.length === 1) {

      return words[0]
        .substring(0, 2)
        .toUpperCase();

    }


    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase();

  };


  const initials =
    getInitials(fullName);


  // =========================================
  // ACCOUNT DATE
  // =========================================

  const formatDate = (date) => {

    if (!date) {
      return "Not available";
    }


    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

  };


  // =========================================
  // EDIT PROFILE
  // =========================================

  const handleSaveProfile = async () => {

    const name =
      editName.trim();


    if (!name) {

      setError(
        "Please enter your full name."
      );

      return;

    }


    try {

      setSaving(true);

      setError("");
      setMessage("");


      const {
        data,
        error
      } =
        await supabase.auth.updateUser({

          data: {
            full_name: name,
          },

        });


      if (error) {

        setError(
          error.message
        );

        return;

      }


      const updatedName =
        data.user?.user_metadata
          ?.full_name ||
        name;


      setFullName(
        updatedName
      );

      setEditName(
        updatedName
      );

      setIsEditing(false);


      setMessage(
        "Profile updated successfully."
      );


    } catch (err) {

      console.error(
        "Profile Update Error:",
        err
      );

      setError(
        "Something went wrong. Please try again."
      );

    } finally {

      setSaving(false);

    }

  };


  // =========================================
  // CANCEL EDIT
  // =========================================

  const handleCancelEdit = () => {

    setEditName(fullName);

    setIsEditing(false);

    setError("");

    setMessage("");

  };


  // =========================================
  // LOADING
  // =========================================

  if (loading) {

    return (

      <section className="profile-page">

        <div className="profile-loading">

          Loading profile...

        </div>

      </section>

    );

  }


  // =========================================
  // PROFILE UI
  // =========================================

  return (

    <section className="profile-page">


      {/* =====================================
          HEADER
      ===================================== */}

      <div className="profile-page-header">

        <div>

          <h1>
            My Profile
          </h1>

          <p>
            Manage your account and learning progress.
          </p>

        </div>

      </div>


      {/* =====================================
          PROFILE INFORMATION
      ===================================== */}

      <div className="profile-section">

        <div className="profile-section-title">

          <h2>
            Profile Information
          </h2>

        </div>


        <div className="profile-main-card">


          {/* AVATAR */}

          <div className="profile-main-avatar">

            {initials}

          </div>


          {/* USER DETAILS */}

          <div className="profile-main-details">


            {isEditing ? (

              <div className="profile-edit-box">

                <label>
                  Full Name
                </label>


                <input
                  type="text"
                  value={editName}
                  onChange={(e) =>
                    setEditName(
                      e.target.value
                    )
                  }
                  placeholder="Enter your full name"
                />


                <div className="profile-edit-actions">


                  <button
                    className="profile-save-btn"
                    onClick={
                      handleSaveProfile
                    }
                    disabled={saving}
                  >

                    {saving
                      ? "Saving..."
                      : "Save Changes"}

                  </button>


                  <button
                    className="profile-cancel-btn"
                    onClick={
                      handleCancelEdit
                    }
                    disabled={saving}
                  >

                    Cancel

                  </button>


                </div>

              </div>

            ) : (

              <>

                <h3>
                  {fullName}
                </h3>

                <p>
                  {email}
                </p>

                <span>

                  Member since{" "}

                  {formatDate(
                    createdAt
                  )}

                </span>

              </>

            )}

          </div>


          {/* EDIT BUTTON */}

          {!isEditing && (

            <button
              className="profile-edit-btn"
              onClick={() => {

                setIsEditing(true);

                setError("");

                setMessage("");

              }}
            >

              Edit Profile

            </button>

          )}

        </div>


        {/* SUCCESS MESSAGE */}

        {message && (

          <p className="profile-success">

            {message}

          </p>

        )}


        {/* ERROR MESSAGE */}

        {error && (

          <p className="profile-error">

            {error}

          </p>

        )}

      </div>


      {/* =====================================
          LEARNING STATS
      ===================================== */}

      <div className="profile-section">

        <div className="profile-section-title">

          <h2>
            Learning Stats
          </h2>

        </div>


        <div className="profile-stats-grid">


          {/* COURSES STARTED */}

          <div className="profile-stat-card">

            <div className="profile-stat-icon">
              📚
            </div>

            <div>

              <strong>
                {coursesStarted}
              </strong>

              <span>
                Courses Started
              </span>

            </div>

          </div>


          {/* LESSONS COMPLETED */}

          <div className="profile-stat-card">

            <div className="profile-stat-icon">
              ✅
            </div>

            <div>

              <strong>
                {lessonsCompleted}
              </strong>

              <span>
                Lessons Completed
              </span>

            </div>

          </div>


          {/* OVERALL PROGRESS */}

          <div className="profile-stat-card">

            <div className="profile-stat-icon">
              📈
            </div>

            <div>

              <strong>
                {overallProgress}%
              </strong>

              <span>
                Overall Progress
              </span>

            </div>

          </div>


          {/* PRACTICE / QUIZ ATTEMPTS */}

          <div className="profile-stat-card">

            <div className="profile-stat-icon">
              📝
            </div>

            <div>

              <strong>
                {quizAttempts}
              </strong>

              <span>
                Practice / Quiz Attempts
              </span>

            </div>

          </div>


        </div>

      </div>


      {/* =====================================
          ACCOUNT ACTIONS
      ===================================== */}

      <div className="profile-section">

        <div className="profile-section-title">

          <h2>
            Account Actions
          </h2>

        </div>


        <div className="profile-actions-card">


          <button
            className="profile-action-btn logout-profile-btn"
            onClick={onLogout}
          >

            🚪 Logout

          </button>


        </div>

      </div>


    </section>

  );

}

export default Profile;