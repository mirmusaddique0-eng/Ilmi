import { useEffect, useState } from "react";

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

  const [darkMode, setDarkMode] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState("home");


  // =========================================
  // AUTH USER
  // =========================================

  const [user, setUser] = useState(null);

  const [userRole, setUserRole] = useState(null);

  const [authLoading, setAuthLoading] = useState(true);


  // =========================================
  // FETCH USER ROLE
  // =========================================

  const fetchUserRole = async (currentUser) => {

    if (!currentUser) {

      setUserRole(null);

      return null;
    }


    const {
      data: profile,
      error
    } = await supabase
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
          data: {
            user: currentUser
          },
          error
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


        // =====================================
        // INITIAL SESSION
        // =====================================

        if (currentUser) {

          const role =
            await fetchUserRole(
              currentUser
            );


          if (!mounted) {

            return;
          }


          // ===================================
          // ADMIN
          // ===================================

          if (role === "admin") {

            setCurrentPage("admin");

          }

          // ===================================
          // STUDENT
          // ===================================

          else {

            setCurrentPage("home");

          }

        }

        else {

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
      data: {
        subscription
      }
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


            // =================================
            // ADMIN LOGIN
            // =================================

            if (role === "admin") {

              setCurrentPage("admin");

            }

          }


          setSearchQuery("");

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

    // FOOTER PAGES

    if (
      page === "about" ||
      page === "contact" ||
      page === "privacy" ||
      page === "terms"
    ) {

      return "home";

    }


    // MAIN NAVIGATION

    if (
      page === "explore" ||
      page === "learn" ||
      page === "build" ||
      page === "grow"
    ) {

      return "home";

    }


    // EXPLORE CHILDREN

    if (
      page === "courses" ||
      page === "college-syllabus"
    ) {

      return "explore";

    }


    // LEARN CHILDREN

    if (
      page === "continue-learning" ||
      page === "my-progress" ||
      page === "practice-quizzes"
    ) {

      return "learn";

    }


    // BUILD CHILDREN

    if (
      page === "projects" ||
      page === "practice-projects" ||
      page === "challenges"
    ) {

      return "build";

    }


    // GROW CHILDREN

    if (
      page === "roadmaps" ||
      page === "resources"
    ) {

      return "grow";

    }


    // PROFILE

    if (page === "profile") {

      return "home";

    }


    return "home";

  };


  // =========================================
  // NAVIGATION
  // =========================================

  const navigateTo = (page) => {

    setCurrentPage(page);

    setSearchQuery("");

  };


  // =========================================
  // LOGIN SUCCESS
  // =========================================

  const handleLoginSuccess = async () => {

    setSearchQuery("");


    const {
      data: {
        user: loggedInUser
      }
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


    // ADMIN LOGIN

    if (role === "admin") {

      setCurrentPage("admin");

      return;

    }


    // STUDENT LOGIN

    setCurrentPage("home");

  };


  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = async () => {

    const {
      error
    } = await supabase.auth.signOut();


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

  };


  // =========================================
  // BACK BUTTON
  // =========================================

  const goBack = () => {

    if (currentPage === "home") {

      return;

    }


    // AUTH → HOME

    if (currentPage === "auth") {

      setCurrentPage("home");

      setSearchQuery("");

      return;

    }


    // ADMIN

    if (currentPage === "admin") {

      return;

    }


    const parent =
      getParentPage(
        currentPage
      );


    setCurrentPage(parent);

    setSearchQuery("");

  };


  // =========================================
  // BACK BUTTON VISIBILITY
  // =========================================

  const showBackButton =
    currentPage !== "home" &&
    currentPage !== "admin";


  // =========================================
  // SEARCH
  // =========================================

  const handleSearch = (query) => {

    setSearchQuery(query);

  };


  // =========================================
  // SEARCH DATA
  // =========================================

  const searchData = [

    {
      title: "Dart Programming",
      type: "Tutorial",
      description:
        "Learn Dart programming from basics to advanced concepts.",
      icon: "💻",
    },

    {
      title: "HTML",
      type: "Course",
      description:
        "Learn HTML and build the structure of modern websites.",
      icon: "🌐",
    },

    {
      title: "CSS",
      type: "Course",
      description:
        "Learn CSS and create beautiful website designs.",
      icon: "🎨",
    },

    {
      title: "JavaScript",
      type: "Tutorial",
      description:
        "Learn JavaScript and make websites interactive.",
      icon: "⚡",
    },

  ];


  const filteredResults =
    searchData.filter((item) =>
      item.title
        .toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        )
    );


  // =========================================
  // AUTH LOADING
  // =========================================

  if (authLoading) {

    return (

      <div className="app-loading">

        <div>

          <strong>
            EDUVANTA
          </strong>

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
          HEADER
      ===================================== */}

      <Header

        darkMode={darkMode}

        setDarkMode={setDarkMode}

        onSearch={handleSearch}

        onSignIn={() =>
          navigateTo("auth")
        }

        user={user}

        onLogout={handleLogout}

        onProfile={() =>
          navigateTo("profile")
        }

      />


      {/* =====================================
          NAVIGATION
      ===================================== */}

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


      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <main className="main-content">


        {/* BACK BUTTON */}

        {showBackButton && (

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


        {/* ABOUT */}

        {currentPage === "about" ? (

          <About />


        /* CONTACT */

        ) : currentPage === "contact" ? (

          <Contact />


        /* PRIVACY */

        ) : currentPage === "privacy" ? (

          <Privacy />


        /* TERMS */

        ) : currentPage === "terms" ? (

          <Terms />


        /* AUTH */

        ) : currentPage === "auth" ? (

          <Auth
            onLogin={handleLoginSuccess}
          />


        /* PROFILE */

        ) : currentPage === "profile" ? (

          <Profile
            user={user}
            onLogout={handleLogout}
          />


        /* EXPLORE */

        ) : currentPage === "explore" ? (

          <Explore
            setCurrentPage={navigateTo}
          />


        /* COURSES */

        ) : currentPage === "courses" ? (

          <Courses />


        /* COLLEGE SYLLABUS */

        ) : currentPage === "college-syllabus" ? (

          <CollegeSyllabus />


        /* LEARN */

        ) : currentPage === "learn" ? (

          <Learn
            setCurrentPage={navigateTo}
          />


        ) : currentPage === "continue-learning" ? (

          <ContinueLearning />


        ) : currentPage === "my-progress" ? (

          <MyProgress
            setCurrentPage={navigateTo}
          />


        ) : currentPage === "practice-quizzes" ? (

          <PracticeQuizzes />


        /* BUILD */

        ) : currentPage === "build" ? (

          <Build
            setCurrentPage={navigateTo}
          />


        ) : currentPage === "projects" ? (

          <Projects />


        ) : currentPage === "practice-projects" ? (

          <PracticeProjects />


        ) : currentPage === "challenges" ? (

          <Challenges />


        /* GROW */

        ) : currentPage === "grow" ? (

          <Grow
            setCurrentPage={navigateTo}
          />


        ) : currentPage === "roadmaps" ? (

          <Roadmaps />


        ) : currentPage === "resources" ? (

          <Resources />


        /* =====================================
           HOME
        ===================================== */

        ) : (

          <>

            {/* SEARCH RESULTS */}

            {searchQuery && (

              <section className="search-results-section">

                <h2>
                  Search Results for "{searchQuery}"
                </h2>


                {filteredResults.length === 0 ? (

                  <div className="no-results">

                    <div className="no-results-icon">
                      🔍
                    </div>

                    <h3>
                      No results found
                    </h3>

                    <p>
                      We couldn't find anything for
                      "{searchQuery}".
                    </p>

                  </div>

                ) : (

                  <div className="search-results-grid">

                    {filteredResults.map(
                      (item, index) => (

                        <div
                          className="search-card"
                          key={index}
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
                          </p>

                          <button>
                            Start Learning
                          </button>

                        </div>

                      )
                    )}

                  </div>

                )}

              </section>

            )}


            {/* =================================
                HOME HERO
            ================================= */}

            {!searchQuery && (

              <>

                <section className="home-hero">


                  {/* LEFT IMAGE */}

                  <div className="hero-image hero-image-left">

                    <img
                      src="/image/bg1.jpg"
                      alt=""
                    />

                  </div>


                  {/* RIGHT IMAGE */}

                  <div className="hero-image hero-image-right">

                    <img
                      src="/image/bg2.jpg"
                      alt=""
                    />

                  </div>


                  {/* CENTER CONTENT */}

                  <div className="hero-content">

                    <h2>
                      Start Your Learning Journey
                    </h2>

                    <p className="learning-path">
                      Since 2026
                    </p>

                    <p className="hero-description">
                      Learn programming, strengthen your skills,
                      practice with real challenges, build meaningful
                      projects, and grow your knowledge with ILMI.
                    </p>

                    <p className="welcome-tagline">
                      Learn at your own pace. Practice what you learn.
                      Build real skills for your future.
                    </p>

                  </div>

                </section>


                {/* =================================
                    HOME CARDS
                ================================= */}

                <section className="cards">


                  {/* CONTINUE LEARNING */}

                  <div className="card">

                    <div className="card-icon">
                      🎯
                    </div>

                    <h3>
                      Continue Learning
                    </h3>

                    <p>
                      Continue your course from where you
                      left off and keep improving your skills.
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


                  {/* PRACTICE */}

                  <div className="card">

                    <div className="card-icon">
                      📝
                    </div>

                    <h3>
                      Practice
                    </h3>

                    <p>
                      Practice your knowledge with questions,
                      exercises and coding challenges.
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


                  {/* MY PROGRESS */}

                  <div className="card">

                    <div className="card-icon">
                      📊
                    </div>

                    <h3>
                      My Progress
                    </h3>

                    <p>
                      Track your learning progress and see
                      how much you have completed.
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
          © 2026 Ilmi. All rights reserved.
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