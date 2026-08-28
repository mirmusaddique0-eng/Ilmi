import { useEffect, useState } from "react";
import "./AdminBuild.css";
import { supabase } from "../lib/supabaseClient";

function AdminBuild({ adminMode = false, onBack }) {

  // =========================================
  // MAIN TAB
  // =========================================

  const [activeTab, setActiveTab] = useState("projects");

  // =========================================
  // DATA
  // =========================================

  const [projects, setProjects] = useState([]);
  const [practiceProjects, setPracticeProjects] = useState([]);
  const [challenges, setChallenges] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // =========================================
  // SELECTED ITEM
  // =========================================

  const [selectedItem, setSelectedItem] = useState(null);

  // =========================================
  // PHASES
  // =========================================

  const [phases, setPhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);

  // =========================================
  // CONTENT
  // =========================================

  const [contents, setContents] = useState([]);

  // =========================================
  // MODALS
  // =========================================

  const [showItemModal, setShowItemModal] = useState(false);
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [editingPhase, setEditingPhase] = useState(null);
  const [editingContent, setEditingContent] = useState(null);

  // =========================================
  // SEARCH
  // =========================================

  const [searchText, setSearchText] = useState("");

  // =========================================
  // ITEM FORM
  // =========================================

  const emptyItemForm = {
    title: "",
    description: "",
    technologies: "",
    difficulty: "Beginner",
    display_order: 1,
    is_active: true,
  };

  const [itemForm, setItemForm] =
    useState(emptyItemForm);

  // =========================================
  // PHASE FORM
  // =========================================

  const emptyPhaseForm = {
    phase_name: "",
    phase_description: "",
    display_order: 1,
    is_active: true,
  };

  const [phaseForm, setPhaseForm] =
    useState(emptyPhaseForm);

  // =========================================
  // CONTENT FORM
  // =========================================

  const emptyContentForm = {
    title: "",
    content: "",
    display_order: 1,
    is_active: true,
  };

  const [contentForm, setContentForm] =
    useState(emptyContentForm);

  // =========================================
  // TABLE CONFIG
  // =========================================

  const getItemTable = () => {
    if (activeTab === "projects") {
      return "build_projects";
    }

    if (activeTab === "practice") {
      return "build_practice_projects";
    }

    return "build_challenges";
  };

  const getPhaseTable = () => {
    if (activeTab === "projects") {
      return "build_project_phases";
    }

    if (activeTab === "practice") {
      return "build_practice_project_phases";
    }

    return "build_challenge_phases";
  };

  const getContentTable = () => {
    if (activeTab === "projects") {
      return "build_project_phase_content";
    }

    if (activeTab === "practice") {
      return "build_practice_project_phase_content";
    }

    return "build_challenge_phase_content";
  };

  // =========================================
  // LOAD DATA
  // =========================================

  const loadData = async () => {
    setLoading(true);
    setError("");

    const [
      projectResult,
      practiceResult,
      challengeResult,
    ] = await Promise.all([
      supabase
        .from("build_projects")
        .select("*")
        .order("display_order", {
          ascending: true,
        }),

      supabase
        .from("build_practice_projects")
        .select("*")
        .order("display_order", {
          ascending: true,
        }),

      supabase
        .from("build_challenges")
        .select("*")
        .order("display_order", {
          ascending: true,
        }),
    ]);

    if (projectResult.error) {
      console.error(
        "Projects Error:",
        projectResult.error
      );
      setError(projectResult.error.message);
    }

    if (practiceResult.error) {
      console.error(
        "Practice Projects Error:",
        practiceResult.error
      );
      setError(practiceResult.error.message);
    }

    if (challengeResult.error) {
      console.error(
        "Challenges Error:",
        challengeResult.error
      );
      setError(challengeResult.error.message);
    }

    setProjects(projectResult.data || []);
    setPracticeProjects(
      practiceResult.data || []
    );
    setChallenges(
      challengeResult.data || []
    );

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================
  // CURRENT ITEMS
  // =========================================

  const getCurrentItems = () => {
    if (activeTab === "projects") {
      return projects;
    }

    if (activeTab === "practice") {
      return practiceProjects;
    }

    return challenges;
  };

  // =========================================
  // FILTER
  // =========================================

  const filteredItems =
    getCurrentItems().filter((item) => {
      const search =
        searchText.toLowerCase().trim();

      if (!search) return true;

      return (
        item.title
          ?.toLowerCase()
          .includes(search) ||
        item.description
          ?.toLowerCase()
          .includes(search) ||
        item.technologies
          ?.toLowerCase()
          .includes(search)
      );
    });

  // =========================================
  // TAB CHANGE
  // =========================================

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSearchText("");
    setSelectedItem(null);
    setSelectedPhase(null);
    setPhases([]);
    setContents([]);
  };

  // =========================================
  // PAGE TITLE
  // =========================================

  const getPageTitle = () => {
    if (activeTab === "projects") {
      return "Projects";
    }

    if (activeTab === "practice") {
      return "Practice Projects";
    }

    return "Challenges";
  };

  // =========================================
  // ITEM FORM CHANGE
  // =========================================

  const handleItemChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setItemForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================================
  // PHASE FORM CHANGE
  // =========================================

  const handlePhaseChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setPhaseForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================================
  // CONTENT FORM CHANGE
  // =========================================

  const handleContentChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setContentForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================================
  // OPEN ADD ITEM
  // =========================================

  const openAddItem = () => {
    setEditingItem(null);

    const items = getCurrentItems();

    setItemForm({
      ...emptyItemForm,
      display_order:
        items.length + 1,
      difficulty:
        activeTab === "challenges"
          ? "Easy"
          : "Beginner",
    });

    setShowItemModal(true);
  };

  // =========================================
  // OPEN EDIT ITEM
  // =========================================

  const openEditItem = (item) => {
    setEditingItem(item);

    setItemForm({
      title: item.title || "",
      description: item.description || "",
      technologies: item.technologies || "",
      difficulty:
        item.difficulty ||
        (activeTab === "challenges"
          ? "Easy"
          : "Beginner"),
      display_order:
        item.display_order || 1,
      is_active:
        item.is_active !== false,
    });

    setShowItemModal(true);
  };

  // =========================================
  // SAVE ITEM
  // =========================================

  const saveItem = async (e) => {
    e.preventDefault();

    if (!itemForm.title.trim()) {
      alert("Enter title.");
      return;
    }

    if (!itemForm.description.trim()) {
      alert("Enter description.");
      return;
    }

    if (!itemForm.technologies.trim()) {
      alert("Enter technologies.");
      return;
    }

    setSaving(true);

    const payload = {
      title: itemForm.title.trim(),
      description:
        itemForm.description.trim(),
      technologies:
        itemForm.technologies.trim(),
      difficulty:
        itemForm.difficulty,
      display_order:
        Number(itemForm.display_order) || 1,
      is_active:
        itemForm.is_active,
      updated_at:
        new Date().toISOString(),
    };

    let result;

    if (editingItem) {
      result = await supabase
        .from(getItemTable())
        .update(payload)
        .eq("id", editingItem.id);
    } else {
      result = await supabase
        .from(getItemTable())
        .insert([
          {
            ...payload,
            created_at:
              new Date().toISOString(),
          },
        ]);
    }

    if (result.error) {
      console.error(
        "Save Item Error:",
        result.error
      );

      alert(result.error.message);
      setSaving(false);
      return;
    }

    alert(
      editingItem
        ? "Updated successfully."
        : "Added successfully."
    );

    setShowItemModal(false);
    setEditingItem(null);
    setItemForm(emptyItemForm);

    await loadData();

    setSaving(false);
  };

  // =========================================
  // DELETE ITEM
  // =========================================

  const deleteItem = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this item?"
      );

    if (!confirmed) return;

    const { error } =
      await supabase
        .from(getItemTable())
        .delete()
        .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    if (selectedItem?.id === id) {
      setSelectedItem(null);
      setSelectedPhase(null);
      setPhases([]);
      setContents([]);
    }

    await loadData();
  };

  // =========================================
  // TOGGLE ITEM STATUS
  // =========================================

  const toggleItemStatus = async (item) => {
    const { error } =
      await supabase
        .from(getItemTable())
        .update({
          is_active: !item.is_active,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", item.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadData();
  };

  // =========================================
  // OPEN ITEM
  // =========================================

  const openItem = async (item) => {
    setSelectedItem(item);
    setSelectedPhase(null);
    setContents([]);

    const { data, error } =
      await supabase
        .from(getPhaseTable())
        .select("*")
        .eq(
          activeTab === "projects"
            ? "project_id"
            : activeTab === "practice"
            ? "practice_project_id"
            : "challenge_id",
          item.id
        )
        .order("display_order", {
          ascending: true,
        });

    if (error) {
      console.error(
        "Phase Load Error:",
        error
      );

      setPhases([]);
      return;
    }

    setPhases(data || []);
  };

  // =========================================
  // OPEN ADD PHASE
  // =========================================

  const openAddPhase = () => {
    setEditingPhase(null);

    setPhaseForm({
      ...emptyPhaseForm,
      display_order:
        phases.length + 1,
    });

    setShowPhaseModal(true);
  };

  // =========================================
  // OPEN EDIT PHASE
  // =========================================

  const openEditPhase = (phase) => {
    setEditingPhase(phase);

    setPhaseForm({
      phase_name:
        phase.phase_name || "",
      phase_description:
        phase.phase_description || "",
      display_order:
        phase.display_order || 1,
      is_active:
        phase.is_active !== false,
    });

    setShowPhaseModal(true);
  };

  // =========================================
  // SAVE PHASE
  // =========================================

  const savePhase = async (e) => {
    e.preventDefault();

    if (!phaseForm.phase_name.trim()) {
      alert("Enter phase name.");
      return;
    }

    setSaving(true);

    const payload = {
      phase_name:
        phaseForm.phase_name.trim(),
      phase_description:
        phaseForm.phase_description.trim(),
      display_order:
        Number(
          phaseForm.display_order
        ) || 1,
      is_active:
        phaseForm.is_active,
      updated_at:
        new Date().toISOString(),
    };

    let result;

    if (editingPhase) {
      result = await supabase
        .from(getPhaseTable())
        .update(payload)
        .eq("id", editingPhase.id);
    } else {

      const foreignKey =
        activeTab === "projects"
          ? {
              project_id:
                selectedItem.id,
            }
          : activeTab === "practice"
          ? {
              practice_project_id:
                selectedItem.id,
            }
          : {
              challenge_id:
                selectedItem.id,
            };

      result = await supabase
        .from(getPhaseTable())
        .insert([
          {
            ...foreignKey,
            ...payload,
            created_at:
              new Date().toISOString(),
          },
        ]);
    }

    if (result.error) {
      console.error(
        "Save Phase Error:",
        result.error
      );

      alert(result.error.message);
      setSaving(false);
      return;
    }

    alert(
      editingPhase
        ? "Phase updated."
        : "Phase added."
    );

    setShowPhaseModal(false);
    setEditingPhase(null);

    setPhaseForm(
      emptyPhaseForm
    );

    await openItem(selectedItem);

    setSaving(false);
  };

  // =========================================
  // DELETE PHASE
  // =========================================

  const deletePhase = async (phase) => {
    const confirmed =
      window.confirm(
        "Delete this phase?"
      );

    if (!confirmed) return;

    const { error } =
      await supabase
        .from(getPhaseTable())
        .delete()
        .eq("id", phase.id);

    if (error) {
      alert(error.message);
      return;
    }

    if (
      selectedPhase?.id === phase.id
    ) {
      setSelectedPhase(null);
      setContents([]);
    }

    await openItem(selectedItem);
  };

  // =========================================
  // SELECT PHASE
  // =========================================

  const openPhase = async (phase) => {
    setSelectedPhase(phase);
    setContents([]);

    const { data, error } =
      await supabase
        .from(getContentTable())
        .select("*")
        .eq("phase_id", phase.id)
        .order("display_order", {
          ascending: true,
        });

    if (error) {
      console.error(
        "Content Load Error:",
        error
      );

      setContents([]);
      return;
    }

    setContents(data || []);
  };

  // =========================================
  // OPEN ADD CONTENT
  // =========================================

  const openAddContent = () => {
    setEditingContent(null);

    setContentForm({
      ...emptyContentForm,
      display_order:
        contents.length + 1,
    });

    setShowContentModal(true);
  };

  // =========================================
  // OPEN EDIT CONTENT
  // =========================================

  const openEditContent = (
    content
  ) => {
    setEditingContent(content);

    setContentForm({
      title:
        content.title || "",
      content:
        content.content || "",
      display_order:
        content.display_order || 1,
      is_active:
        content.is_active !== false,
    });

    setShowContentModal(true);
  };

  // =========================================
  // SAVE CONTENT
  // =========================================

  const saveContent = async (e) => {
    e.preventDefault();

    if (!contentForm.title.trim()) {
      alert("Enter content title.");
      return;
    }

    if (!contentForm.content.trim()) {
      alert("Enter content.");
      return;
    }

    setSaving(true);

    const payload = {
      title:
        contentForm.title.trim(),
      content:
        contentForm.content.trim(),
      display_order:
        Number(
          contentForm.display_order
        ) || 1,
      is_active:
        contentForm.is_active,
      updated_at:
        new Date().toISOString(),
    };

    let result;

    if (editingContent) {
      result = await supabase
        .from(getContentTable())
        .update(payload)
        .eq("id", editingContent.id);
    } else {
      result = await supabase
        .from(getContentTable())
        .insert([
          {
            ...payload,
            phase_id:
              selectedPhase.id,
            created_at:
              new Date().toISOString(),
          },
        ]);
    }

    if (result.error) {
      console.error(
        "Save Content Error:",
        result.error
      );

      alert(result.error.message);
      setSaving(false);
      return;
    }

    alert(
      editingContent
        ? "Content updated."
        : "Content added."
    );

    setShowContentModal(false);
    setEditingContent(null);
    setContentForm(
      emptyContentForm
    );

    await openPhase(
      selectedPhase
    );

    setSaving(false);
  };

  // =========================================
  // DELETE CONTENT
  // =========================================

  const deleteContent = async (
    content
  ) => {
    const confirmed =
      window.confirm(
        "Delete this content?"
      );

    if (!confirmed) return;

    const { error } =
      await supabase
        .from(getContentTable())
        .delete()
        .eq("id", content.id);

    if (error) {
      alert(error.message);
      return;
    }

    await openPhase(
      selectedPhase
    );
  };

  // =========================================
  // CLOSE ITEM DETAIL
  // =========================================

  const closeDetail = () => {
    setSelectedItem(null);
    setSelectedPhase(null);
    setPhases([]);
    setContents([]);
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="admin-build">

        <div className="admin-build-header">
          <div>
            <span className="admin-build-label">
              BUILD
            </span>

            <h1>
              Build Management
            </h1>

            <p>
              Manage projects, practice
              projects and challenges.
            </p>
          </div>
        </div>

        <div className="admin-build-loading">
          Loading Build data...
        </div>

      </div>
    );
  }

  // =========================================
  // DETAIL PAGE
  // =========================================

  if (selectedItem) {
    return (
      <div className="admin-build">

        <div className="admin-build-header">

          <div>

            <span className="admin-build-label">
              BUILD
            </span>

            <h1>
              {selectedItem.title}
            </h1>

            <p>
              {selectedItem.description}
            </p>

          </div>

          <button
            className="admin-build-back"
            onClick={closeDetail}
          >
            ← Back
          </button>

        </div>

        {/* ITEM INFO */}

        <div className="admin-build-detail-card">

          <div>
            <strong>
              Technologies
            </strong>

            <span>
              {selectedItem.technologies}
            </span>
          </div>

          <div>
            <strong>
              Difficulty
            </strong>

            <span>
              {selectedItem.difficulty}
            </span>
          </div>

          <div>
            <strong>
              Status
            </strong>

            <span>
              {selectedItem.is_active
                ? "Active"
                : "Inactive"}
            </span>
          </div>

        </div>

        {/* PHASE SECTION */}

        <div className="admin-build-detail-section">

          <div className="admin-build-section-header">

            <div>
              <h2>
                Phases
              </h2>

              <p>
                Manage Learn, Build and
                Complete phases.
              </p>
            </div>

            <button
              className="admin-build-add-btn"
              onClick={openAddPhase}
            >
              + Add Phase
            </button>

          </div>

          {phases.length === 0 ? (

            <div className="admin-build-empty">
              <h3>
                No phases found
              </h3>

              <p>
                Add the first phase for
                this item.
              </p>
            </div>

          ) : (

            <div className="admin-build-phase-list">

              {phases.map((phase) => (

                <div
                  className={
                    selectedPhase?.id ===
                    phase.id
                      ? "admin-build-phase selected"
                      : "admin-build-phase"
                  }
                  key={phase.id}
                  onClick={() =>
                    openPhase(phase)
                  }
                >

                  <div className="admin-build-phase-main">

                    <span className="admin-build-order">
                      #{phase.display_order}
                    </span>

                    <div>

                      <h3>
                        {phase.phase_name}
                      </h3>

                      <p>
                        {phase.phase_description}
                      </p>

                      <span
                        className={
                          phase.is_active
                            ? "admin-build-status active"
                            : "admin-build-status inactive"
                        }
                      >
                        {phase.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </div>

                  </div>

                  <div className="admin-build-actions">

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditPhase(
                          phase
                        );
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePhase(
                          phase
                        );
                      }}
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* CONTENT */}

        {selectedPhase && (

          <div className="admin-build-detail-section">

            <div className="admin-build-section-header">

              <div>
                <h2>
                  {selectedPhase.phase_name}
                  {" "}Content
                </h2>

                <p>
                  Manage content for this
                  phase.
                </p>
              </div>

              <button
                className="admin-build-add-btn"
                onClick={
                  openAddContent
                }
              >
                + Add Content
              </button>

            </div>

            {contents.length === 0 ? (

              <div className="admin-build-empty">

                <h3>
                  No content found
                </h3>

                <p>
                  Add content for this
                  phase.
                </p>

              </div>

            ) : (

              <div className="admin-build-content-list">

                {contents.map(
                  (content) => (

                    <div
                      className="admin-build-content-item"
                      key={content.id}
                    >

                      <div>

                        <div className="admin-build-item-top">

                          <span>
                            #{content.display_order}
                          </span>

                          <span
                            className={
                              content.is_active
                                ? "admin-build-status active"
                                : "admin-build-status inactive"
                            }
                          >
                            {content.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </div>

                        <h3>
                          {content.title}
                        </h3>

                        <p>
                          {content.content}
                        </p>

                      </div>

                      <div className="admin-build-actions">

                        <button
                          onClick={() =>
                            openEditContent(
                              content
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            deleteContent(
                              content
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        )}

        {/* PHASE MODAL */}

        {showPhaseModal && (

          <div className="admin-build-modal-overlay">

            <div className="admin-build-modal">

              <div className="admin-build-modal-header">

                <div>
                  <h2>
                    {editingPhase
                      ? "Edit Phase"
                      : "Add Phase"}
                  </h2>

                  <p>
                    Add phase details.
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowPhaseModal(
                      false
                    )
                  }
                >
                  ×
                </button>

              </div>

              <form
                onSubmit={savePhase}
              >

                <div className="admin-build-form-group">

                  <label>
                    Phase Name
                  </label>

                  <input
                    name="phase_name"
                    value={
                      phaseForm.phase_name
                    }
                    onChange={
                      handlePhaseChange
                    }
                    placeholder="Learn"
                    required
                  />

                </div>

                <div className="admin-build-form-group">

                  <label>
                    Phase Description
                  </label>

                  <textarea
                    name="phase_description"
                    value={
                      phaseForm.phase_description
                    }
                    onChange={
                      handlePhaseChange
                    }
                    rows="4"
                    placeholder="Enter phase description..."
                  />

                </div>

                <div className="admin-build-form-group">

                  <label>
                    Display Order
                  </label>

                  <input
                    type="number"
                    name="display_order"
                    value={
                      phaseForm.display_order
                    }
                    onChange={
                      handlePhaseChange
                    }
                    min="1"
                  />

                </div>

                <label className="admin-build-checkbox">

                  <input
                    type="checkbox"
                    name="is_active"
                    checked={
                      phaseForm.is_active
                    }
                    onChange={
                      handlePhaseChange
                    }
                  />

                  Active

                </label>

                <div className="admin-build-modal-actions">

                  <button
                    type="button"
                    onClick={() =>
                      setShowPhaseModal(
                        false
                      )
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingPhase
                      ? "Update"
                      : "Add"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

        {/* CONTENT MODAL */}

        {showContentModal && (

          <div className="admin-build-modal-overlay">

            <div className="admin-build-modal">

              <div className="admin-build-modal-header">

                <div>

                  <h2>
                    {editingContent
                      ? "Edit Content"
                      : "Add Content"}
                  </h2>

                  <p>
                    Add content for{" "}
                    {selectedPhase?.phase_name}.
                  </p>

                </div>

                <button
                  onClick={() =>
                    setShowContentModal(
                      false
                    )
                  }
                >
                  ×
                </button>

              </div>

              <form
                onSubmit={saveContent}
              >

                <div className="admin-build-form-group">

                  <label>
                    Content Title
                  </label>

                  <input
                    name="title"
                    value={
                      contentForm.title
                    }
                    onChange={
                      handleContentChange
                    }
                    placeholder="Introduction"
                    required
                  />

                </div>

                <div className="admin-build-form-group">

                  <label>
                    Content
                  </label>

                  <textarea
                    name="content"
                    value={
                      contentForm.content
                    }
                    onChange={
                      handleContentChange
                    }
                    rows="8"
                    placeholder="Write the content..."
                    required
                  />

                </div>

                <div className="admin-build-form-group">

                  <label>
                    Display Order
                  </label>

                  <input
                    type="number"
                    name="display_order"
                    value={
                      contentForm.display_order
                    }
                    onChange={
                      handleContentChange
                    }
                    min="1"
                  />

                </div>

                <label className="admin-build-checkbox">

                  <input
                    type="checkbox"
                    name="is_active"
                    checked={
                      contentForm.is_active
                    }
                    onChange={
                      handleContentChange
                    }
                  />

                  Active

                </label>

                <div className="admin-build-modal-actions">

                  <button
                    type="button"
                    onClick={() =>
                      setShowContentModal(
                        false
                      )
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingContent
                      ? "Update"
                      : "Add"}
                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      </div>
    );
  }

  // =========================================
  // MAIN PAGE
  // =========================================

  return (
    <div className="admin-build">

      {/* HEADER */}

      <div className="admin-build-header">

        <div>

          <span className="admin-build-label">
            BUILD
          </span>

          <h1>
            Build Management
          </h1>

          <p>
            Manage projects, practice
            projects and coding challenges.
          </p>

        </div>

        {onBack && (
          <button
            className="admin-build-back"
            onClick={onBack}
          >
            ← Dashboard
          </button>
        )}

      </div>

      {/* STATS */}

      <div className="admin-build-stats">

        <div className="admin-build-stat">
          <span>
            Projects
          </span>

          <strong>
            {projects.length}
          </strong>
        </div>

        <div className="admin-build-stat">
          <span>
            Practice Projects
          </span>

          <strong>
            {practiceProjects.length}
          </strong>
        </div>

        <div className="admin-build-stat">
          <span>
            Challenges
          </span>

          <strong>
            {challenges.length}
          </strong>
        </div>

      </div>

      {/* TABS */}

      <div className="admin-build-tabs">

        <button
          className={
            activeTab === "projects"
              ? "active"
              : ""
          }
          onClick={() =>
            changeTab("projects")
          }
        >
          🛠️ Projects
        </button>

        <button
          className={
            activeTab === "practice"
              ? "active"
              : ""
          }
          onClick={() =>
            changeTab("practice")
          }
        >
          💻 Practice Projects
        </button>

        <button
          className={
            activeTab === "challenges"
              ? "active"
              : ""
          }
          onClick={() =>
            changeTab("challenges")
          }
        >
          🧩 Challenges
        </button>

      </div>

      {/* CONTENT */}

      <div className="admin-build-content">

        <div className="admin-build-toolbar">

          <div>

            <h2>
              {getPageTitle()}
            </h2>

            <p>
              Click an item to manage its
              phases and content.
            </p>

          </div>

          <div className="admin-build-toolbar-actions">

            <input
              type="text"
              placeholder="Search..."
              value={searchText}
              onChange={(e) =>
                setSearchText(
                  e.target.value
                )
              }
            />

            <button
              className="admin-build-add-btn"
              onClick={openAddItem}
            >
              + Add{" "}
              {activeTab === "projects"
                ? "Project"
                : activeTab === "practice"
                ? "Practice Project"
                : "Challenge"}
            </button>

          </div>

        </div>

        {error && (
          <div className="admin-build-error">
            {error}
          </div>
        )}

        {/* LIST */}

        {filteredItems.length === 0 ? (

          <div className="admin-build-empty">

            <h3>
              No {getPageTitle().toLowerCase()}
              found.
            </h3>

            <p>
              Add your first item.
            </p>

          </div>

        ) : (

          <div className="admin-build-list">

            {filteredItems.map(
              (item) => (

                <div
                  className="admin-build-item"
                  key={item.id}
                  onClick={() =>
                    openItem(item)
                  }
                >

                  <div className="admin-build-item-main">

                    <div className="admin-build-item-top">

                      <span className="admin-build-id">
                        #{item.id}
                      </span>

                      <span
                        className={`admin-build-difficulty ${
                          item.difficulty ===
                            "Beginner" ||
                          item.difficulty ===
                            "Easy"
                            ? "beginner"
                            : item.difficulty ===
                                "Intermediate" ||
                              item.difficulty ===
                                "Medium"
                            ? "intermediate"
                            : "advanced"
                        }`}
                      >
                        {item.difficulty}
                      </span>

                      <span
                        className={
                          item.is_active
                            ? "admin-build-status active"
                            : "admin-build-status inactive"
                        }
                      >
                        {item.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </div>

                    <h3>
                      {item.title}
                    </h3>

                    <p>
                      {item.description}
                    </p>

                    <div className="admin-build-technologies">

                      <span>
                        {item.technologies}
                      </span>

                      <span>
                        Order:{" "}
                        {item.display_order}
                      </span>

                    </div>

                  </div>

                  <div className="admin-build-actions">

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleItemStatus(
                          item
                        );
                      }}
                    >
                      {item.is_active
                        ? "Disable"
                        : "Enable"}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditItem(
                          item
                        );
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(
                          item.id
                        );
                      }}
                    >
                      Delete
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

      {/* =====================================
          ITEM MODAL
      ===================================== */}

      {showItemModal && (

        <div className="admin-build-modal-overlay">

          <div className="admin-build-modal">

            <div className="admin-build-modal-header">

              <div>

                <h2>
                  {editingItem
                    ? "Edit Item"
                    : "Add Item"}
                </h2>

                <p>
                  Enter the details below.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowItemModal(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={saveItem}
            >

              <div className="admin-build-form-group">

                <label>
                  Title
                </label>

                <input
                  name="title"
                  value={
                    itemForm.title
                  }
                  onChange={
                    handleItemChange
                  }
                  placeholder="Enter title..."
                  required
                />

              </div>

              <div className="admin-build-form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    itemForm.description
                  }
                  onChange={
                    handleItemChange
                  }
                  rows="4"
                  placeholder="Enter description..."
                  required
                />

              </div>

              <div className="admin-build-form-group">

                <label>
                  Technologies
                </label>

                <input
                  name="technologies"
                  value={
                    itemForm.technologies
                  }
                  onChange={
                    handleItemChange
                  }
                  placeholder="HTML • CSS • JavaScript"
                  required
                />

              </div>

              <div className="admin-build-form-grid">

                <div className="admin-build-form-group">

                  <label>
                    Difficulty
                  </label>

                  <select
                    name="difficulty"
                    value={
                      itemForm.difficulty
                    }
                    onChange={
                      handleItemChange
                    }
                  >

                    {activeTab ===
                    "challenges" ? (
                      <>
                        <option value="Easy">
                          Easy
                        </option>

                        <option value="Medium">
                          Medium
                        </option>

                        <option value="Hard">
                          Hard
                        </option>
                      </>
                    ) : (
                      <>
                        <option value="Beginner">
                          Beginner
                        </option>

                        <option value="Intermediate">
                          Intermediate
                        </option>

                        <option value="Advanced">
                          Advanced
                        </option>
                      </>
                    )}

                  </select>

                </div>

                <div className="admin-build-form-group">

                  <label>
                    Display Order
                  </label>

                  <input
                    type="number"
                    name="display_order"
                    value={
                      itemForm.display_order
                    }
                    onChange={
                      handleItemChange
                    }
                    min="1"
                  />

                </div>

              </div>

              <label className="admin-build-checkbox">

                <input
                  type="checkbox"
                  name="is_active"
                  checked={
                    itemForm.is_active
                  }
                  onChange={
                    handleItemChange
                  }
                />

                Active

              </label>

              <div className="admin-build-modal-actions">

                <button
                  type="button"
                  onClick={() =>
                    setShowItemModal(
                      false
                    )
                  }
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
                    : editingItem
                    ? "Update"
                    : "Add"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminBuild;