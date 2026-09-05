import { useEffect, useState } from "react";

import "./App.css";

import Header from "./components/Header";
import Courses from "./components/Courses";
import Explore from "./components/Explore";
import Learn from "./components/Learn";
import ContinueLearning from "./components/ContinueLearning";
import CollegeSyllabus from "./components/CollegeSyllabus";

import Build from "./components/Build";
import Grow from "./components/Grow";

import MyProgress from "./components/MyProgress";
import PracticeQuizzes from "./components/PracticeQuizzes";

import Projects from "./components/Projects";
import PracticeProjects from "./components/PracticeProjects";
import Challenges from "./components/Challenges";

import Roadmaps from "./components/Roadmaps";
import Resources from "./components/Resources";

import Auth from "./components/Auth";
import Profile from "./components/Profile";
import AdminDashboard from "./components/AdminDashboard";

import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

import { supabase } from "./lib/supabaseClient";


function App() {

  // =========================================
  // GENERAL STATE
  // =========================================

  const [darkMode, setDarkMode] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState("home");


  // =========================================
  // SEARCH BACK STATE
  // =========================================

  const [searchPreviousPage, setSearchPreviousPage] = useState(null);


  // =========================================
  // AUTH STATE
  // =========================================

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // =========================================
  // CUSTOM SCROLLBAR
  // =========================================

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {

    const updateScrollUI = () => {

      const scrollTop = window.scrollY || window.pageYOffset;

      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      const progress =
        maxScroll > 0
          ? Math.min(Math.max(scrollTop / maxScroll, 0), 1)
          : 0;

      setScrollProgress(progress);

      const header = document.querySelector(".sticky-header");

      if (header) {
        document.documentElement.style.setProperty(
          "--ilmi-header-height",
          `${header.offsetHeight}px`
        );
      }
    };

    updateScrollUI();

    window.addEventListener("scroll", updateScrollUI, { passive: true });
    window.addEventListener("resize", updateScrollUI);

    const header = document.querySelector(".sticky-header");
    let resizeObserver;

    if (header && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateScrollUI);
      resizeObserver.observe(header);
    }

    return () => {
      window.removeEventListener("scroll", updateScrollUI);
      window.removeEventListener("resize", updateScrollUI);

      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };

  }, []);


  const handleScrollbarClick = (event) => {

    const rect = event.currentTarget.getBoundingClientRect();

    const ratio = Math.min(
      Math.max((event.clientY - rect.top) / rect.height, 0),
      1
    );

    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    window.scrollTo({
      top: ratio * Math.max(maxScroll, 0),
      behavior: "smooth",
    });

  };


  // =========================================
  // FETCH USER ROLE
  // =========================================

  const fetchUserRole = async (currentUser) => {

    if (!currentUser) {
      setUserRole(null);
      return null;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", currentUser.id)
      .single();

    if (error) {

      console.error(
        "Profile Role Error:",
        error
      );

      setUserRole("student");

      return "student";
    }

    const role =
      profile?.role || "student";

    setUserRole(role);

    return role;
  };


  // =========================================
  // CHECK SUPABASE SESSION
  // =========================================

  useEffect(() => {

    let mounted = true;

    const getCurrentUser = async () => {

      try {

        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();

        if (error) {

          console.error(
            "Get User Error:",
            error
          );

          if (mounted) {
            setAuthLoading(false);
          }

          return;
        }

        if (!mounted) {
          return;
        }

        setUser(currentUser);

        if (currentUser) {

          const role =
            await fetchUserRole(
              currentUser
            );

          if (!mounted) {
            return;
          }

          if (role === "admin") {
            setCurrentPage("admin");
          } else {
            setCurrentPage("home");
          }

        } else {

          setUserRole(null);
          setCurrentPage("home");

        }

        setAuthLoading(false);

      } catch (error) {

        console.error(
          "Authentication Error:",
          error
        );

        if (mounted) {
          setAuthLoading(false);
        }

      }

    };


    getCurrentUser();


    // =========================================
    // AUTH STATE LISTENER
    // =========================================

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        const currentUser =
          session?.user ?? null;

        if (!mounted) {
          return;
        }


        // =====================================
        // SIGNED OUT
        // =====================================

        if (event === "SIGNED_OUT") {

          setUser(null);

          setUserRole(null);

          setCurrentPage("home");

          setSearchQuery("");

          setSearchResults([]);

          setSearchLoading(false);

          setSearchPreviousPage(null);

          setAuthLoading(false);

          return;
        }


        // =====================================
        // SIGNED IN
        // =====================================

        if (event === "SIGNED_IN") {

          setUser(currentUser);

          if (currentUser) {

            const role =
              await fetchUserRole(
                currentUser
              );

            if (!mounted) {
              return;
            }

            if (role === "admin") {
              setCurrentPage("admin");
            } else {
              setCurrentPage("home");
            }

          }

          setSearchQuery("");

          setSearchResults([]);

          setSearchLoading(false);

          setSearchPreviousPage(null);

          setAuthLoading(false);

        }

      }
    );


    return () => {

      mounted = false;

      subscription.unsubscribe();

    };

  }, []);


  // =========================================
  // GET PARENT PAGE
  // =========================================

  const getParentPage = (page) => {

    if (
      page === "about" ||
      page === "contact" ||
      page === "privacy" ||
      page === "terms"
    ) {
      return "home";
    }

    if (
      page === "explore" ||
      page === "learn" ||
      page === "build" ||
      page === "grow"
    ) {
      return "home";
    }

    if (
      page === "courses" ||
      page === "college-syllabus"
    ) {
      return "explore";
    }

    if (
      page === "continue-learning" ||
      page === "my-progress" ||
      page === "practice-quizzes"
    ) {
      return "learn";
    }

    if (
      page === "projects" ||
      page === "practice-projects" ||
      page === "challenges"
    ) {
      return "build";
    }

    if (
      page === "roadmaps" ||
      page === "resources"
    ) {
      return "grow";
    }

    if (page === "profile") {
      return "home";
    }

    return "home";
  };


  // =========================================
  // NORMAL NAVIGATION
  // =========================================

  const navigateTo = (page) => {

    setCurrentPage(page);

    setSearchQuery("");

    setSearchResults([]);

    setSearchLoading(false);

    setSearchPreviousPage(null);

  };


  // =========================================
  // LOGIN SUCCESS
  // =========================================

  const handleLoginSuccess = async () => {

    setSearchQuery("");

    setSearchResults([]);

    setSearchLoading(false);

    setSearchPreviousPage(null);

    const {
      data: { user: loggedInUser },
    } = await supabase.auth.getUser();

    if (!loggedInUser) {

      setUser(null);

      setUserRole(null);

      setCurrentPage("home");

      return;
    }

    setUser(loggedInUser);

    const role =
      await fetchUserRole(
        loggedInUser
      );

    if (role === "admin") {

      setCurrentPage("admin");

      return;

    }

    setCurrentPage("home");

  };


  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = async () => {

    const { error } =
      await supabase.auth.signOut();

    if (error) {

      console.error(
        "Logout Error:",
        error
      );

      return;
    }

    setUser(null);

    setUserRole(null);

    setCurrentPage("home");

    setSearchQuery("");

    setSearchResults([]);

    setSearchLoading(false);

    setSearchPreviousPage(null);

  };


  // =========================================
  // SEARCH BACK BUTTON
  // =========================================

  const goBackFromSearch = () => {

    const previousPage =
      searchPreviousPage || "home";

    setSearchQuery("");

    setSearchResults([]);

    setSearchLoading(false);

    setSearchPreviousPage(null);

    setCurrentPage(previousPage);

  };


  // =========================================
  // NORMAL PAGE BACK BUTTON
  // =========================================

  const goBack = () => {

    if (searchQuery) {

      goBackFromSearch();

      return;

    }

    if (currentPage === "home") {
      return;
    }

    if (currentPage === "auth") {

      setCurrentPage("home");

      setSearchQuery("");

      setSearchResults([]);

      setSearchLoading(false);

      setSearchPreviousPage(null);

      return;

    }

    if (currentPage === "admin") {
      return;
    }

    const parent =
      getParentPage(
        currentPage
      );

    setCurrentPage(parent);

    setSearchQuery("");

    setSearchResults([]);

    setSearchLoading(false);

    setSearchPreviousPage(null);

  };


  // =========================================
  // BACK BUTTON VISIBILITY
  // =========================================

  const showNormalBackButton =
    !searchQuery &&
    currentPage !== "home" &&
    currentPage !== "admin";


  const showSearchBackButton =
    Boolean(searchQuery);


  // =========================================
  // GLOBAL SEARCH
  // =========================================

  const handleSearch = async (query) => {

    const cleanQuery =
      String(query || "").trim();


    // =====================================
    // EMPTY SEARCH
    // =====================================

    if (!cleanQuery) {

      setSearchQuery("");

      setSearchResults([]);

      setSearchLoading(false);

      setSearchPreviousPage(null);

      return;

    }


    // =====================================
    // SAVE PAGE BEFORE SEARCH
    // =====================================

    if (!searchQuery) {

      setSearchPreviousPage(
        currentPage
      );

    }


    setSearchQuery(cleanQuery);

    setSearchResults([]);

    setSearchLoading(true);


    try {

      console.log(
        "================================="
      );

      console.log(
        "🔥 ILMI GLOBAL SEARCH:",
        cleanQuery
      );

      console.log(
        "🔥 SEARCH STARTED FROM:",
        currentPage
      );

      console.log(
        "================================="
      );


      // =====================================
      // SEARCH TEXT
      // =====================================

      const searchText =
        cleanQuery
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();


      if (!searchText) {

        setSearchResults([]);

        return;

      }


      // =====================================
      // SEARCH ALL TABLES
      // =====================================

      const [
        coursesResponse,
        yearsResponse,
        semestersResponse,
        subjectsResponse,
        unitsResponse,
        topicsResponse,
        topicContentsResponse,
      ] = await Promise.all([

        // COURSES

        supabase
          .from("courses")
          .select(
            "id, title, description, category, icon, display_order"
          )
          .eq("is_active", true),

        // YEARS

        supabase
          .from("years")
          .select(
            "id, year_number"
          ),

        // SEMESTERS

        supabase
          .from("semesters")
          .select(
            "id, year_id, title"
          ),

        // SUBJECTS

        supabase
          .from("subjects")
          .select(
            "id, semester_id, subject_name"
          ),

        // UNITS

        supabase
          .from("units")
          .select(
            "id, subject_id, unit_name"
          ),

        // TOPICS

        supabase
          .from("topics")
          .select(
            "id, unit_id, topic_number, topic_name, short_description, display_order"
          )
          .eq("is_active", true),

        // TOPIC CONTENT

        supabase
          .from("topic_contents")
          .select(
            "id, topic_id, title, content, display_order"
          )
          .eq("is_published", true),

      ]);


      // =====================================
      // CHECK ERRORS
      // =====================================

      const databaseErrors = [

        {
          table: "courses",
          error: coursesResponse.error,
        },

        {
          table: "years",
          error: yearsResponse.error,
        },

        {
          table: "semesters",
          error: semestersResponse.error,
        },

        {
          table: "subjects",
          error: subjectsResponse.error,
        },

        {
          table: "units",
          error: unitsResponse.error,
        },

        {
          table: "topics",
          error: topicsResponse.error,
        },

        {
          table: "topic_contents",
          error: topicContentsResponse.error,
        },

      ];


      const databaseError =
        databaseErrors.find(
          (item) => item.error
        );


      if (databaseError) {

        console.error(
          "❌ ILMI SEARCH DATABASE ERROR:",
          databaseError.table,
          databaseError.error
        );

        setSearchResults([]);

        return;

      }


      // =====================================
      // DATA
      // =====================================

      const courses =
        coursesResponse.data || [];

      const years =
        yearsResponse.data || [];

      const semesters =
        semestersResponse.data || [];

      const subjects =
        subjectsResponse.data || [];

      const units =
        unitsResponse.data || [];

      const topics =
        topicsResponse.data || [];

      const topicContents =
        topicContentsResponse.data || [];


      // =====================================
      // MAPS
      // =====================================

      const yearMap =
        new Map(
          years.map((year) => [
            year.id,
            year,
          ])
        );

      const semesterMap =
        new Map(
          semesters.map((semester) => [
            semester.id,
            semester,
          ])
        );

      const subjectMap =
        new Map(
          subjects.map((subject) => [
            subject.id,
            subject,
          ])
        );

      const unitMap =
        new Map(
          units.map((unit) => [
            unit.id,
            unit,
          ])
        );

      const topicMap =
        new Map(
          topics.map((topic) => [
            topic.id,
            topic,
          ])
        );


      // =====================================
      // SEARCH HELPER
      // =====================================

      const containsSearchText = (value) => {

        if (
          value === null ||
          value === undefined
        ) {
          return false;
        }

        return String(value)
          .toLowerCase()
          .includes(searchText);

      };


      // =====================================
      // RESULTS
      // =====================================

      const results = [];


      // =====================================
      // 1. COURSES
      // =====================================

      courses.forEach((course) => {

        const matched =
          containsSearchText(
            course.title
          ) ||
          containsSearchText(
            course.description
          ) ||
          containsSearchText(
            course.category
          );

        if (!matched) {
          return;
        }

        results.push({

          id:
            `course-${course.id}`,

          title:
            course.title,

          type:
            "Course",

          description:
            course.description ||
            "Explore this course on ILMI.",

          icon:
            course.icon ||
            "📚",

          courseId:
            course.id,

          subject: "",
          unit: "",
          semester: "",
          year: "",

          sortOrder: 1,

        });

      });


      // =====================================
      // 2. YEARS
      // =====================================

      years.forEach((year) => {

        if (
          !containsSearchText(
            year.year_number
          )
        ) {
          return;
        }

        results.push({

          id:
            `year-${year.id}`,

          title:
            `Year ${year.year_number}`,

          type:
            "Year",

          description:
            "Explore subjects and topics available in this academic year.",

          icon:
            "📅",

          courseId: null,

          subject: "",
          unit: "",
          semester: "",

          year:
            year.year_number,

          sortOrder: 2,

        });

      });


      // =====================================
      // 3. SEMESTERS
      // =====================================

      semesters.forEach((semester) => {

        const year =
          yearMap.get(
            semester.year_id
          );

        const matched =
          containsSearchText(
            semester.title
          );

        if (!matched) {
          return;
        }

        results.push({

          id:
            `semester-${semester.id}`,

          title:
            semester.title ||
            "Semester",

          type:
            "Semester",

          description:
            "Explore subjects and learning topics in this semester.",

          icon:
            "🎓",

          courseId: null,

          subject: "",
          unit: "",

          semester:
            semester.title ||
            "Semester",

          year:
            year?.year_number || "",

          sortOrder: 3,

        });

      });


      // =====================================
      // 4. SUBJECTS
      // =====================================

      subjects.forEach((subject) => {

        if (
          !containsSearchText(
            subject.subject_name
          )
        ) {
          return;
        }

        const semester =
          semesterMap.get(
            subject.semester_id
          );

        const year =
          semester
            ? yearMap.get(
                semester.year_id
              )
            : null;

        results.push({

          id:
            `subject-${subject.id}`,

          title:
            subject.subject_name,

          type:
            "Subject",

          description:
            "Explore this subject and its complete syllabus.",

          icon:
            "📘",

          courseId: null,

          subject:
            subject.subject_name,

          unit: "",

          semester:
            semester?.title || "",

          year:
            year?.year_number || "",

          sortOrder: 4,

        });

      });


      // =====================================
      // 5. UNITS
      // =====================================

      units.forEach((unit) => {

        if (
          !containsSearchText(
            unit.unit_name
          )
        ) {
          return;
        }

        const subject =
          subjectMap.get(
            unit.subject_id
          );

        const semester =
          subject
            ? semesterMap.get(
                subject.semester_id
              )
            : null;

        const year =
          semester
            ? yearMap.get(
                semester.year_id
              )
            : null;

        results.push({

          id:
            `unit-${unit.id}`,

          title:
            unit.unit_name,

          type:
            "Unit",

          description:
            "Explore topics and learning content inside this unit.",

          icon:
            "📂",

          courseId: null,

          subject:
            subject?.subject_name || "",

          unit:
            unit.unit_name || "",

          semester:
            semester?.title || "",

          year:
            year?.year_number || "",

          sortOrder: 5,

        });

      });


      // =====================================
      // 6. TOPICS
      // =====================================

      topics.forEach((topic) => {

        const matched =
          containsSearchText(
            topic.topic_name
          ) ||
          containsSearchText(
            topic.short_description
          ) ||
          containsSearchText(
            topic.topic_number
          );

        if (!matched) {
          return;
        }

        const unit =
          unitMap.get(
            topic.unit_id
          );

        const subject =
          unit
            ? subjectMap.get(
                unit.subject_id
              )
            : null;

        const semester =
          subject
            ? semesterMap.get(
                subject.semester_id
              )
            : null;

        const year =
          semester
            ? yearMap.get(
                semester.year_id
              )
            : null;

        results.push({

          id:
            `topic-${topic.id}`,

          title:
            topic.topic_name,

          type:
            "Topic",

          description:
            topic.short_description ||
            "Explore this topic and improve your skills.",

          icon:
            "📚",

          courseId: null,

          subject:
            subject?.subject_name || "",

          unit:
            unit?.unit_name || "",

          semester:
            semester?.title || "",

          year:
            year?.year_number || "",

          topicId:
            topic.id,

          sortOrder: 6,

        });

      });


      // =====================================
      // 7. TOPIC CONTENT
      // =====================================

      topicContents.forEach(
        (contentItem) => {

          const matched =
            containsSearchText(
              contentItem.title
            ) ||
            containsSearchText(
              contentItem.content
            );

          if (!matched) {
            return;
          }

          const topic =
            topicMap.get(
              contentItem.topic_id
            );

          const unit =
            topic
              ? unitMap.get(
                  topic.unit_id
                )
              : null;

          const subject =
            unit
              ? subjectMap.get(
                  unit.subject_id
                )
              : null;

          const semester =
            subject
              ? semesterMap.get(
                  subject.semester_id
                )
              : null;

          const year =
            semester
              ? yearMap.get(
                  semester.year_id
                )
              : null;

          let description =
            "Explore this learning content.";

          if (contentItem.content) {

            description =
              String(
                contentItem.content
              )
                .replace(
                  /<[^>]*>/g,
                  " "
                )
                .replace(
                  /\s+/g,
                  " "
                )
                .trim()
                .slice(
                  0,
                  180
                );

          }

          results.push({

            id:
              `content-${contentItem.id}`,

            title:
              contentItem.title ||
              "Learning Content",

            type:
              "Lesson",

            description:
              description,

            icon:
              "📝",

            courseId: null,

            subject:
              subject?.subject_name || "",

            unit:
              unit?.unit_name || "",

            semester:
              semester?.title || "",

            year:
              year?.year_number || "",

            topic:
              topic?.topic_name || "",

            topicId:
              topic?.id || null,

            sortOrder: 7,

          });

        }
      );


      // =====================================
      // REMOVE DUPLICATES
      // =====================================

      const uniqueResults =
        Array.from(

          new Map(

            results.map(
              (item) => [
                item.id,
                item,
              ]
            )

          ).values()

        );


      // =====================================
      // SORT
      // =====================================

      uniqueResults.sort(
        (a, b) => {

          if (
            a.sortOrder !==
            b.sortOrder
          ) {

            return (
              a.sortOrder -
              b.sortOrder
            );

          }

          return String(
            a.title
          ).localeCompare(
            String(
              b.title
            )
          );

        }
      );


      // =====================================
      // MAX 50 RESULTS
      // =====================================

      const finalResults =
        uniqueResults.slice(
          0,
          50
        );

      console.log(
        "🔥 TOTAL SEARCH RESULTS:",
        finalResults.length
      );

      console.log(
        "🔥 ILMI SEARCH RESULTS:",
        finalResults
      );

      setSearchResults(
        finalResults
      );

    }

    catch (error) {

      console.error(
        "❌ ILMI GLOBAL SEARCH ERROR:",
        error
      );

      setSearchResults([]);

    }

    finally {

      setSearchLoading(false);

    }

  };


  // =========================================
  // AUTH LOADING
  // =========================================

  if (authLoading) {

    return (

      <div className="app-loading">

        <div>

          <strong>IlmI</strong>

          <span>
            Loading...
          </span>

        </div>

      </div>

    );

  }


  // =========================================
  // ADMIN PANEL
  // =========================================

  if (
    currentPage === "admin" &&
    user &&
    userRole === "admin"
  ) {

    return (

      <AdminDashboard
        user={user}
        onLogout={handleLogout}
      />

    );

  }


  // =========================================
  // STUDENT UI
  // =========================================

  return (

    <div
      className={
        darkMode
          ? "app dark"
          : "app"
      }
    >

      {/* =====================================
          STICKY HEADER AREA
      ===================================== */}

      <div className="sticky-header">

        {/* HEADER */}

        <Header

          darkMode={darkMode}

          setDarkMode={
            setDarkMode
          }

          onSearch={
            handleSearch
          }

          onSignIn={() =>
            navigateTo("auth")
          }

          user={user}

          onLogout={
            handleLogout
          }

          onProfile={() =>
            navigateTo("profile")
          }

        />


        {/* NAVIGATION */}

        <nav className="navigation">

          <a
            href="#"
            onClick={(e) => {

              e.preventDefault();

              navigateTo("explore");

            }}
          >
            Explore
          </a>


          <a
            href="#"
            onClick={(e) => {

              e.preventDefault();

              navigateTo("learn");

            }}
          >
            Learn
          </a>


          <a
            href="#"
            onClick={(e) => {

              e.preventDefault();

              navigateTo("build");

            }}
          >
            Build
          </a>


          <a
            href="#"
            onClick={(e) => {

              e.preventDefault();

              navigateTo("grow");

            }}
          >
            Grow
          </a>

        </nav>

      </div>


      {/* =====================================
          CUSTOM LINE SCROLLBAR
      ===================================== */}

      <div
        className="custom-scrollbar"
        onClick={handleScrollbarClick}
        role="scrollbar"
        aria-label="Page scroll position"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={Math.round(scrollProgress * 100)}
        tabIndex="0"
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "PageDown") {
            window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
          }

          if (event.key === "ArrowUp" || event.key === "PageUp") {
            window.scrollBy({ top: -window.innerHeight * 0.8, behavior: "smooth" });
          }
        }}
      >
        <div className="scrollbar-lines">
          {Array.from({ length: 32 }).map((_, index) => {
            const activeIndex = Math.round(scrollProgress * 31);

            return (
              <span
                key={index}
                className={`scroll-line ${
                  index === activeIndex ? "active" : ""
                }`}
              />
            );
          })}
        </div>
      </div>


      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <main className="main-content">


        {/* SEARCH BACK BUTTON */}

        {showSearchBackButton && (

          <button
            className="search-back-button"
            onClick={
              goBackFromSearch
            }
          >

            <span className="search-back-arrow">
              ←
            </span>

            <span>
              Back
            </span>

          </button>

        )}


        {/* NORMAL BACK BUTTON */}

        {showNormalBackButton && (

          <button
            className="back-button"
            onClick={goBack}
          >

            <span className="back-button-arrow">
              ←
            </span>

            <span>
              Go Back
            </span>

          </button>

        )}


        {/* SEARCH RESULTS */}

        {searchQuery ? (

          <section
            className="search-results-section"
          >

            <h2>
              Search Results for "
              {searchQuery}
              "
            </h2>


            {searchLoading ? (

              <div className="no-results">

                <div className="no-results-icon">
                  🔍
                </div>

                <h3>
                  Searching...
                </h3>

                <p>
                  Searching all ILMI learning content.
                </p>

              </div>

            ) : searchResults.length === 0 ? (

              <div className="no-results">

                <div className="no-results-icon">
                  🔍
                </div>

                <h3>
                  No results found
                </h3>

                <p>
                  We couldn't find anything for "
                  {searchQuery}
                  ".
                </p>

              </div>

            ) : (

              <div className="search-results-grid">

                {searchResults.map(
                  (item) => (

                    <div
                      className="search-card"
                      key={item.id}
                    >

                      <div className="search-card-icon">
                        {item.icon}
                      </div>

                      <span className="search-card-type">
                        {item.type}
                      </span>

                      <h3>
                        {item.title}
                      </h3>

                      <p>
                        {item.description}
                        {item.description?.length >= 180
                          ? "..."
                          : ""}
                      </p>

                      <div className="search-card-meta">

                        {item.year && (

                          <span>
                            📅 Year{" "}
                            {item.year}
                          </span>

                        )}

                        {item.semester && (

                          <span>
                            🎓{" "}
                            {item.semester}
                          </span>

                        )}

                        {item.subject && (

                          <span>
                            📘{" "}
                            {item.subject}
                          </span>

                        )}

                        {item.unit && (

                          <span>
                            📂{" "}
                            {item.unit}
                          </span>

                        )}

                        {item.topic && (

                          <span>
                            📚{" "}
                            {item.topic}
                          </span>

                        )}

                      </div>

                      <button
                        onClick={() =>
                          navigateTo(
                            "college-syllabus"
                          )
                        }
                      >
                        View in Syllabus →
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        ) : (

          <>

            {/* ABOUT */}

            {currentPage === "about" ? (

              <About />

            )

            /* CONTACT */

            : currentPage === "contact" ? (

              <Contact />

            )

            /* PRIVACY */

            : currentPage === "privacy" ? (

              <Privacy />

            )

            /* TERMS */

            : currentPage === "terms" ? (

              <Terms />

            )

            /* AUTH */

            : currentPage === "auth" ? (

              <Auth
                onLogin={
                  handleLoginSuccess
                }
              />

            )

            /* PROFILE */

            : currentPage === "profile" ? (

              <Profile
                user={user}
                onLogout={
                  handleLogout
                }
              />

            )

            /* EXPLORE */

            : currentPage === "explore" ? (

              <Explore
                setCurrentPage={
                  navigateTo
                }
              />

            )

            /* COURSES */

            : currentPage === "courses" ? (

              <Courses />

            )

            /* COLLEGE SYLLABUS */

            : currentPage === "college-syllabus" ? (

              <CollegeSyllabus />

            )

            /* LEARN */

            : currentPage === "learn" ? (

              <Learn
                setCurrentPage={
                  navigateTo
                }
              />

            )

            /* CONTINUE LEARNING */

            : currentPage === "continue-learning" ? (

              <ContinueLearning />

            )

            /* MY PROGRESS */

            : currentPage === "my-progress" ? (

              <MyProgress
                setCurrentPage={
                  navigateTo
                }
              />

            )

            /* PRACTICE */

            : currentPage === "practice-quizzes" ? (

              <PracticeQuizzes />

            )

            /* BUILD */

            : currentPage === "build" ? (

              <Build
                setCurrentPage={
                  navigateTo
                }
              />

            )

            /* PROJECTS */

            : currentPage === "projects" ? (

              <Projects />

            )

            /* PRACTICE PROJECTS */

            : currentPage === "practice-projects" ? (

              <PracticeProjects />

            )

            /* CHALLENGES */

            : currentPage === "challenges" ? (

              <Challenges />

            )

            /* GROW */

            : currentPage === "grow" ? (

              <Grow
                setCurrentPage={
                  navigateTo
                }
              />

            )

            /* ROADMAPS */

            : currentPage === "roadmaps" ? (

              <Roadmaps />

            )

            /* RESOURCES */

            : currentPage === "resources" ? (

              <Resources />

            )

            /* HOME */

            : (

              <>

                <section className="home-hero">

                  <div className="hero-image hero-image-left">

                    <img
                      src="/image/bg1.jpg?v=2"
                      alt=""
                    />

                  </div>


                  <div className="hero-image hero-image-right">

                    <img
                      src="/image/bg2.jpg?v=2"
                      alt=""
                    />

                  </div>


                  <div className="hero-content">

                    <h2>
                      Start Your Learning Journey
                    </h2>

                    <p className="learning-path">
                    </p>

                    <p className="hero-description">

                      Learn programming,
                      strengthen your skills,
                      practice with real
                      challenges, build meaningful
                      projects, and grow your
                      knowledge with ILMI.

                    </p>

                    <p className="welcome-tagline">

                      Learn at your own pace.
                      Practice what you learn.
                      Build real skills for
                      your future.

                    </p>

                  </div>

                </section>


                <section className="cards">

                  <div className="card">

                    <div className="card-icon">
                      🎯
                    </div>

                    <h3>
                      Continue Learning
                    </h3>

                    <p>

                      Continue your course
                      from where you left off
                      and keep improving your
                      skills.

                    </p>

                    <button
                      onClick={() =>
                        navigateTo(
                          "continue-learning"
                        )
                      }
                    >
                      Continue Learning
                    </button>

                  </div>


                  <div className="card">

                    <div className="card-icon">
                      📝
                    </div>

                    <h3>
                      Practice
                    </h3>

                    <p>

                      Practice your knowledge
                      with questions, exercises
                      and coding challenges.

                    </p>

                    <button
                      onClick={() =>
                        navigateTo(
                          "practice-quizzes"
                        )
                      }
                    >
                      Start Practice
                    </button>

                  </div>


                  <div className="card">

                    <div className="card-icon">
                      📊
                    </div>

                    <h3>
                      My Progress
                    </h3>

                    <p>

                      Track your learning
                      progress and see how much
                      you have completed.

                    </p>

                    <button
                      onClick={() =>
                        navigateTo(
                          "my-progress"
                        )
                      }
                    >
                      View Progress
                    </button>

                  </div>

                </section>

              </>

            )}

          </>

        )}

      </main>


      {/* =====================================
          FOOTER
      ===================================== */}

      <footer className="footer">

        <p>
          © 2026 ILMI, By Mr Musaddique.
          All rights reserved.
        </p>

        <div>

          <a
            href="#"
            onClick={(e) => {

              e.preventDefault();

              navigateTo("about");

            }}
          >
            About
          </a>


          <a
            href="#"
            onClick={(e) => {

              e.preventDefault();

              navigateTo("contact");

            }}
          >
            Contact
          </a>


          <a
            href="#"
            onClick={(e) => {

              e.preventDefault();

              navigateTo("privacy");

            }}
          >
            Privacy
          </a>


          <a
            href="#"
            onClick={(e) => {

              e.preventDefault();

              navigateTo("terms");

            }}
          >
            Terms
          </a>

        </div>

      </footer>

    </div>

  );

}


export default App;