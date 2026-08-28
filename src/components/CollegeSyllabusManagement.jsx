import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function CollegeSyllabusManagement({ onBack }) {
  // =========================================
  // DATA STATE
  // =========================================

  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);

  // =========================================
  // SELECTED STATE
  // =========================================

  const [selectedYear, setSelectedYear] = useState(null);

  // =========================================
  // LOADING STATE
  // =========================================

  const [loading, setLoading] = useState(true);
  const [semesterLoading, setSemesterLoading] = useState(false);

  const [error, setError] = useState("");

  // =========================================
  // FETCH YEARS
  // =========================================

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("years")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Years Error:", error);
      setError("Unable to load academic years.");
      setYears([]);
    } else {
      setYears(data || []);
    }

    setLoading(false);
  };

  // =========================================
  // YEAR CLICK
  // =========================================

  const handleYearClick = async (year) => {
    setSelectedYear(year);
    setSemesters([]);
    setSemesterLoading(true);

    const { data, error } = await supabase
      .from("semesters")
      .select("*")
      .eq("year_id", year.id)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Semesters Error:", error);
      setSemesters([]);
    } else {
      setSemesters(data || []);
    }

    setSemesterLoading(false);
  };

  // =========================================
  // BACK TO YEARS
  // =========================================

  const handleBackToYears = () => {
    setSelectedYear(null);
    setSemesters([]);
  };

  // =========================================
  // UI
  // =========================================

  return (
    <section className="admin-section">

      {/* HEADER */}

      <div className="admin-section-header">

        <div>
          <h2>🎓 College Syllabus Management</h2>

          <p>
            Manage years, semesters, subjects, units,
            topics and topic content.
          </p>
        </div>

        <button
          className="admin-back-btn"
          onClick={onBack}
        >
          ← Dashboard
        </button>

      </div>

      {/* =====================================
          YEARS
      ===================================== */}

      {!selectedYear && (
        <div className="admin-management-content">

          <h3>Academic Years</h3>

          {loading && (
            <p>Loading years...</p>
          )}

          {error && (
            <p>{error}</p>
          )}

          {!loading && !error && (
            <div className="syllabus-management-list">

              {years.map((year) => (
                <button
                  key={year.id}
                  type="button"
                  className="syllabus-management-item"
                  onClick={() =>
                    handleYearClick(year)
                  }
                >
                  <div>
                    <strong>
                      {year.title}
                    </strong>

                    <span>
                      Year {year.year_number}
                    </span>
                  </div>

                  <span>→</span>
                </button>
              ))}

            </div>
          )}

        </div>
      )}

      {/* =====================================
          SEMESTERS
      ===================================== */}

      {selectedYear && (
        <div className="admin-management-content">

          <button
            type="button"
            onClick={handleBackToYears}
          >
            ← Back to Years
          </button>

          <h3>
            {selectedYear.title} — Semesters
          </h3>

          {semesterLoading ? (
            <p>Loading semesters...</p>
          ) : semesters.length === 0 ? (
            <p>
              No semesters available for this year.
            </p>
          ) : (
            <div className="syllabus-management-list">

              {semesters.map((semester) => (
                <div
                  key={semester.id}
                  className="syllabus-management-item"
                >
                  <div>
                    <strong>
                      {semester.title}
                    </strong>

                    <span>
                      Semester {semester.semester_number}
                    </span>
                  </div>

                  <span>→</span>
                </div>
              ))}

            </div>
          )}

        </div>
      )}

    </section>
  );
}

export default CollegeSyllabusManagement;