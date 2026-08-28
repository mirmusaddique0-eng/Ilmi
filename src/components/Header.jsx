import { useState } from "react";
import eduvantaLogo from "../assets/eduvanta-logo.png";

function Header({
  darkMode,
  setDarkMode,
  onSearch,
  onSignIn,
  user,
  onLogout,
  onProfile
}) {
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // =========================================
  // SEARCH
  // =========================================

  const handleSearch = () => {
    const query = searchQuery.trim();

    if (!query) return;

    if (onSearch) {
      onSearch(query);
    }
  };

  // =========================================
  // USER INFORMATION
  // =========================================

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "EDUVANTA User";

  const email = user?.email || "";

  // =========================================
  // GET INITIALS
  // =========================================

  const getInitials = (name) => {
    const words = name
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

  const initials = getInitials(fullName);

  // =========================================
  // LOGOUT
  // =========================================

  const handleLogout = async () => {
    setShowProfile(false);

    if (onLogout) {
      await onLogout();
    }
  };

  return (
    <header className="header">

      {/* =====================================
          LOGO
      ===================================== */}

      <div className="logo-container">

        <img
          src={eduvantaLogo}
          alt="EDUVANTA"
          className="header-logo"
        />

      </div>


      {/* =====================================
          SEARCH BAR
      ===================================== */}

      <div className="header-search">

        <input
          type="text"
          placeholder="What do you want to learn?"
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />

        <button
          className="header-search-btn"
          aria-label="Search"
          onClick={handleSearch}
        >

          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >

            <circle
              cx="11"
              cy="11"
              r="7"
            />

            <line
              x1="16.5"
              y1="16.5"
              x2="21"
              y2="21"
            />

          </svg>

        </button>

      </div>


      {/* =====================================
          RIGHT SIDE
      ===================================== */}

      <div className="header-right">


        {/* ===================================
            DARK MODE
        =================================== */}

        <button
          className="icon-btn"
          onClick={() =>
            setDarkMode(!darkMode)
          }
          aria-label="Toggle dark mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>


        {/* ===================================
            AUTH / PROFILE
        =================================== */}

        {!user ? (

          // -----------------------------------
          // NOT LOGGED IN
          // -----------------------------------

          <button
            className="signin-btn"
            onClick={onSignIn}
          >
            Sign In
          </button>

        ) : (

          // -----------------------------------
          // LOGGED IN
          // -----------------------------------

          <div className="profile-container">


            {/* PROFILE AVATAR */}

            <button
              className="profile-avatar-btn"
              onClick={() =>
                setShowProfile(!showProfile)
              }
              aria-label="Open profile"
            >

              <span className="profile-avatar">
                {initials}
              </span>

            </button>


            {/* =================================
                PROFILE DROPDOWN
            ================================= */}

            {showProfile && (

              <div className="profile-dropdown">


                {/* PROFILE INFORMATION */}

                <div className="profile-info">

                  <div className="profile-avatar-large">
                    {initials}
                  </div>


                  <div className="profile-user-details">

                    <strong>
                      {fullName}
                    </strong>

                    <span>
                      {email}
                    </span>

                  </div>

                </div>


                {/* DIVIDER */}

                <div className="profile-divider"></div>


                {/* PROFILE */}

                <button
                  className="profile-menu-item"
                  onClick={() => {

                    setShowProfile(false);

                    if (onProfile) {
                      onProfile();
                    }

                  }}
                >

                  <span>
                    👤
                  </span>

                  <span>
                    Profile
                  </span>

                </button>


                {/* LOGOUT */}

                <button
                  className="profile-menu-item logout-item"
                  onClick={handleLogout}
                >

                  <span>
                    🚪
                  </span>

                  <span>
                    Logout
                  </span>

                </button>


              </div>

            )}

          </div>

        )}

      </div>

    </header>
  );
}

export default Header;