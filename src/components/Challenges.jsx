import { useEffect, useState } from "react";
import "./FeaturePage.css";
import { supabase } from "../lib/supabaseClient";

function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [phases, setPhases] = useState([]);
  const [contents, setContents] = useState([]);

  const [selectedChallenge, setSelectedChallenge] =
    useState(null);

  const [selectedPhase, setSelectedPhase] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] =
    useState(false);

  // =========================================
  // FETCH CHALLENGES + PHASES
  // =========================================

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // CHALLENGES
      const {
        data: challengeData,
        error: challengeError,
      } = await supabase
        .from("build_challenges")
        .select("*")
        .eq("is_active", true)
        .order("display_order", {
          ascending: true,
        });

      if (challengeError) {
        console.error(
          "Challenges fetch error:",
          challengeError
        );

        setChallenges([]);
        setLoading(false);
        return;
      }

      console.log(
        "Challenges from Supabase:",
        challengeData
      );

      setChallenges(challengeData || []);

      // PHASES
      const {
        data: phaseData,
        error: phaseError,
      } = await supabase
        .from("build_challenge_phases")
        .select("*")
        .eq("is_active", true)
        .order("display_order", {
          ascending: true,
        });

      if (phaseError) {
        console.error(
          "Challenge phases fetch error:",
          phaseError
        );

        setPhases([]);
        setLoading(false);
        return;
      }

      console.log(
        "Challenge Phases from Supabase:",
        phaseData
      );

      setPhases(phaseData || []);

      setLoading(false);
    };

    fetchData();
  }, []);

  // =========================================
  // GET CHALLENGE PHASES
  // =========================================

  const getChallengePhases = (
    challengeId
  ) => {
    return phases.filter(
      (phase) =>
        phase.challenge_id ===
        challengeId
    );
  };

  // =========================================
  // LOAD PHASE CONTENT
  // =========================================

  const loadPhaseContent = async (
    challenge,
    phase
  ) => {
    setSelectedChallenge(challenge);
    setSelectedPhase(phase);

    setContentLoading(true);
    setContents([]);

    const {
      data,
      error,
    } = await supabase
      .from(
        "build_challenge_phase_content"
      )
      .select("*")
      .eq("phase_id", phase.id)
      .eq("is_active", true)
      .order("display_order", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Challenge phase content error:",
        error
      );

      setContents([]);
      setContentLoading(false);
      return;
    }

    console.log(
      "Challenge Phase Content from Supabase:",
      data
    );

    setContents(data || []);
    setContentLoading(false);
  };

  // =========================================
  // WHOLE CHALLENGE CLICK
  // =========================================

  const handleChallengeClick = (
    challenge
  ) => {
    const challengePhases =
      getChallengePhases(
        challenge.id
      );

    if (challengePhases.length === 0) {
      setSelectedChallenge(challenge);
      setSelectedPhase(null);
      setContents([]);
      return;
    }

    const learnPhase =
      challengePhases.find(
        (phase) =>
          phase.phase_name?.toLowerCase() ===
          "learn"
      ) || challengePhases[0];

    loadPhaseContent(
      challenge,
      learnPhase
    );
  };

  // =========================================
  // PHASE CLICK
  // =========================================

  const handlePhaseClick = (
    event,
    challenge,
    phase
  ) => {
    event.stopPropagation();

    loadPhaseContent(
      challenge,
      phase
    );
  };

  // =========================================
  // BACK
  // =========================================

  const handleBack = () => {
    setSelectedChallenge(null);
    setSelectedPhase(null);
    setContents([]);
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="feature-page">

        <div className="feature-header">

          <span>BUILD</span>

          <h1>
            Challenges
          </h1>

          <p>
            Improve your logic and
            problem-solving skills.
          </p>

        </div>

        <div className="feature-content">

          <p>
            Loading challenges...
          </p>

        </div>

      </div>
    );
  }

  // =========================================
  // DETAIL PAGE
  // =========================================

  if (selectedChallenge) {
    return (
      <div className="feature-page">

        <div className="feature-header">

          <span>BUILD</span>

          <h1>
            {selectedChallenge.title}
          </h1>

          <p>
            {selectedChallenge.description}
          </p>

        </div>

        <div className="feature-content">

          <button
            className="practice-primary-btn"
            onClick={handleBack}
          >
            ← Back to Challenges
          </button>

          {/* PHASE BUTTONS */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "25px",
              marginBottom: "25px",
              flexWrap: "wrap",
            }}
          >

            {getChallengePhases(
              selectedChallenge.id
            ).map((phase) => (

              <button
                key={phase.id}
                onClick={() =>
                  loadPhaseContent(
                    selectedChallenge,
                    phase
                  )
                }
                style={{
                  padding:
                    "8px 16px",
                  border:
                    selectedPhase?.id ===
                    phase.id
                      ? "1px solid #2563eb"
                      : "1px solid #ddd",
                  borderRadius:
                    "8px",
                  background:
                    selectedPhase?.id ===
                    phase.id
                      ? "#eff6ff"
                      : "#fff",
                  cursor:
                    "pointer",
                  fontWeight:
                    "600",
                }}
              >

                {selectedPhase?.id ===
                phase.id
                  ? "✓ "
                  : ""}

                {phase.phase_name}

              </button>

            ))}

          </div>

          {/* PHASE DESCRIPTION */}

          {selectedPhase && (

            <div
              style={{
                marginBottom:
                  "25px",
              }}
            >

              <h2>
                {selectedPhase.phase_name}
              </h2>

              <p>
                {selectedPhase.phase_description}
              </p>

            </div>

          )}

          {/* CONTENT */}

          {contentLoading ? (

            <div className="feature-row">

              <div>
                <p>
                  Loading content...
                </p>
              </div>

            </div>

          ) : contents.length ===
            0 ? (

            <div className="feature-row">

              <div>

                <h2>
                  Content Coming Soon
                </h2>

                <p>
                  Content for this phase
                  will be added from
                  the Admin Panel.
                </p>

              </div>

            </div>

          ) : (

            contents.map((content) => (

              <div
                className="feature-row"
                key={content.id}
              >

                <div>

                  <h2>
                    {content.title}
                  </h2>

                  <p>
                    {content.content}
                  </p>

                </div>

              </div>

            ))

          )}

        </div>

      </div>
    );
  }

  // =========================================
  // MAIN LIST
  // =========================================

  return (
    <div className="feature-page">

      <div className="feature-header">

        <span>BUILD</span>

        <h1>
          Challenges
        </h1>

        <p>
          Improve your logic and
          problem-solving skills.
        </p>

      </div>

      <div className="feature-content">

        {challenges.map(
          (challenge) => {

            const challengePhases =
              getChallengePhases(
                challenge.id
              );

            return (

              <div
                className="feature-row"
                key={challenge.id}
                onClick={() =>
                  handleChallengeClick(
                    challenge
                  )
                }
                style={{
                  cursor:
                    "pointer",
                }}
              >

                <div>

                  <h2>
                    {challenge.title}
                  </h2>

                  <p>
                    {challenge.description}
                  </p>

                  <span className="feature-tag">
                    {challenge.technologies}
                  </span>

                  {/* PHASE BUTTONS */}

                  <div
                    style={{
                      display:
                        "flex",
                      gap:
                        "8px",
                      marginTop:
                        "15px",
                      flexWrap:
                        "wrap",
                    }}
                  >

                    {challengePhases.map(
                      (phase) => (

                        <button
                          key={phase.id}
                          onClick={(event) =>
                            handlePhaseClick(
                              event,
                              challenge,
                              phase
                            )
                          }
                          style={{
                            padding:
                              "6px 12px",
                            border:
                              "1px solid #ddd",
                            borderRadius:
                              "7px",
                            background:
                              "#fff",
                            cursor:
                              "pointer",
                            fontWeight:
                              "600",
                          }}
                        >
                          {phase.phase_name}
                        </button>

                      )
                    )}

                  </div>

                </div>

                <span
                  className={`difficulty ${
                    challenge.difficulty ===
                    "Easy"
                      ? "beginner"
                      : challenge.difficulty ===
                        "Medium"
                      ? "intermediate"
                      : "advanced"
                  }`}
                >
                  {challenge.difficulty}
                </span>

              </div>

            );
          }
        )}

      </div>

    </div>
  );
}

export default Challenges;