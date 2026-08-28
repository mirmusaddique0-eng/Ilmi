import { useEffect, useState } from "react";
import "./AdminGrow.css";
import { supabase } from "../lib/supabaseClient";

function AdminGrow({ onBack }) {
  const [activeTab, setActiveTab] = useState("roadmaps");

  const [roadmaps, setRoadmaps] = useState([]);
  const [resources, setResources] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const emptyForm = {
    title: "",
    description: "",
    slug: "",
    icon: "",
    image_url: "",
    imageFile: null,
    category: "",
    technology: "",
    url: "",
    display_order: 1,
    is_active: true,
  };

  const [formData, setFormData] = useState(emptyForm);

  // =========================================
  // LOAD DATA
  // =========================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [roadmapsResult, resourcesResult] =
        await Promise.all([
          supabase
            .from("roadmaps")
            .select("*")
            .order("display_order", { ascending: true }),

          supabase
            .from("resources")
            .select("*")
            .order("display_order", { ascending: true }),
        ]);

      if (roadmapsResult.error) {
        throw roadmapsResult.error;
      }

      if (resourcesResult.error) {
        throw resourcesResult.error;
      }

      setRoadmaps(roadmapsResult.data || []);
      setResources(resourcesResult.data || []);

    } catch (err) {
      console.error("Grow Load Error:", err);

      setError(
        err.message || "Unable to load Grow data."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================
  // CURRENT DATA
  // =========================================

  const getCurrentData = () => {
    if (activeTab === "roadmaps") {
      return roadmaps;
    }

    return resources;
  };

  // =========================================
  // TITLE
  // =========================================

  const getTitle = () => {
    if (activeTab === "roadmaps") {
      return "Roadmaps";
    }

    return "Resources";
  };

  // =========================================
  // FORM
  // =========================================

  const openAddForm = () => {
    setEditingItem(null);

    setFormData({
      ...emptyForm,
      display_order: getCurrentData().length + 1,
    });

    setShowForm(true);
    setError("");
  };

  const openEditForm = (item) => {
    setEditingItem(item);

    setFormData({
      title: item.title || "",
      description: item.description || "",
      slug: item.slug || "",
      icon: item.icon || "",
      image_url: item.image_url || "",
      imageFile: null,
      category: item.category || "",
      technology: item.technology || "",
      url: item.url || "",
      display_order: item.display_order ?? 1,
      is_active: item.is_active ?? true,
    });

    setShowForm(true);
    setError("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData(emptyForm);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // =========================================
  // IMAGE SELECT
  // =========================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setError("");

    setFormData((prev) => ({
      ...prev,
      imageFile: file,
    }));
  };

  // =========================================
  // UPLOAD ROADMAP IMAGE
  // =========================================

  const uploadRoadmapImage = async (file) => {
    if (!file) {
      return null;
    }

    const fileExtension =
      file.name.split(".").pop()?.toLowerCase() || "png";

    const fileName =
      `roadmap-${Date.now()}.${fileExtension}`;

    const filePath =
      `roadmaps/${fileName}`;

    const { error: uploadError } =
      await supabase.storage
        .from("roadmap-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

    if (uploadError) {
      throw uploadError;
    }

    const { data } =
      supabase.storage
        .from("roadmap-images")
        .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error(
        "Unable to get image public URL."
      );
    }

    return data.publicUrl;
  };

  // =========================================
  // SAVE
  // =========================================

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (!formData.title.trim()) {
        setError("Title is required.");
        return;
      }

      const table = activeTab;

      let data = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        icon: formData.icon.trim(),
        display_order: Number(
          formData.display_order
        ),
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      };

      // =====================================
      // ROADMAP
      // =====================================

      if (activeTab === "roadmaps") {
        data.slug = formData.slug.trim();

        data.image_url =
          formData.image_url.trim();

        if (formData.imageFile) {
          data.image_url =
            await uploadRoadmapImage(
              formData.imageFile
            );
        }
      }

      // =====================================
      // RESOURCE
      // =====================================

      if (activeTab === "resources") {
        data.category =
          formData.category.trim();

        data.technology =
          formData.technology.trim();

        data.url =
          formData.url.trim();
      }

      let result;

      // =====================================
      // UPDATE
      // =====================================

      if (editingItem) {
        result = await supabase
          .from(table)
          .update(data)
          .eq("id", editingItem.id);
      }

      // =====================================
      // INSERT
      // =====================================

      else {
        result = await supabase
          .from(table)
          .insert(data);
      }

      if (result.error) {
        throw result.error;
      }

      closeForm();

      await loadData();

    } catch (err) {
      console.error(
        "Grow Save Error:",
        err
      );

      setError(
        err.message ||
        "Unable to save data."
      );
    }
  };

  // =========================================
  // DELETE
  // =========================================

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete "${item.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const { error } =
        await supabase
          .from(activeTab)
          .delete()
          .eq("id", item.id);

      if (error) {
        throw error;
      }

      await loadData();

    } catch (err) {
      console.error(
        "Grow Delete Error:",
        err
      );

      setError(
        err.message ||
        "Unable to delete item."
      );
    }
  };

  // =========================================
  // ACTIVE / INACTIVE
  // =========================================

  const toggleActive = async (item) => {
    try {
      setError("");

      const { error } =
        await supabase
          .from(activeTab)
          .update({
            is_active: !item.is_active,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", item.id);

      if (error) {
        throw error;
      }

      await loadData();

    } catch (err) {
      console.error(
        "Grow Status Error:",
        err
      );

      setError(
        err.message ||
        "Unable to update status."
      );
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="admin-grow">

        <div className="admin-grow-header">

          {onBack && (
            <button
              className="admin-grow-back"
              onClick={onBack}
            >
              ← Dashboard
            </button>
          )}

          <div>
            <span className="admin-grow-label">
              GROW
            </span>

            <h1>Grow Management</h1>

            <p>
              Manage roadmaps and resources.
            </p>
          </div>

        </div>

        <div className="admin-grow-loading">
          Loading Grow data...
        </div>

      </div>
    );
  }

  return (
    <div className="admin-grow">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="admin-grow-header">

        {onBack && (
          <button
            className="admin-grow-back"
            onClick={onBack}
          >
            ← Dashboard
          </button>
        )}

        <div>
          <span className="admin-grow-label">
            GROW
          </span>

          <h1>Grow Management</h1>

          <p>
            Manage roadmaps and resources.
          </p>
        </div>

      </div>

      {/* =====================================
          STATS
      ===================================== */}

      <div className="admin-grow-stats">

        <div className="admin-grow-stat">
          <span>Roadmaps</span>
          <strong>
            {roadmaps.length}
          </strong>
        </div>

        <div className="admin-grow-stat">
          <span>Resources</span>
          <strong>
            {resources.length}
          </strong>
        </div>

      </div>

      {/* =====================================
          TABS
      ===================================== */}

      <div className="admin-grow-tabs">

        <button
          className={
            activeTab === "roadmaps"
              ? "active"
              : ""
          }
          onClick={() => {
            setActiveTab("roadmaps");
            closeForm();
          }}
        >
          🗺️ Roadmaps
        </button>

        <button
          className={
            activeTab === "resources"
              ? "active"
              : ""
          }
          onClick={() => {
            setActiveTab("resources");
            closeForm();
          }}
        >
          📚 Resources
        </button>

      </div>

      {/* =====================================
          CONTENT
      ===================================== */}

      <div className="admin-grow-content">

        <div className="admin-grow-toolbar">

          <div>
            <h2>{getTitle()}</h2>

            <p>
              Manage your{" "}
              {getTitle().toLowerCase()}.
            </p>
          </div>

          <button
            className="admin-grow-add-btn"
            onClick={openAddForm}
          >
            + Add{" "}
            {getTitle().slice(0, -1)}
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="admin-grow-error">
            {error}
          </div>
        )}

        {/* =====================================
            FORM
        ===================================== */}

        {showForm && (
          <form
            className="admin-grow-form"
            onSubmit={handleSave}
          >

            <div className="admin-grow-form-header">

              <h3>
                {editingItem
                  ? `Edit ${getTitle().slice(0, -1)}`
                  : `Add ${getTitle().slice(0, -1)}`
                }
              </h3>

              <button
                type="button"
                className="admin-grow-close"
                onClick={closeForm}
              >
                ✕
              </button>

            </div>

            {/* TITLE */}

            <div className="admin-grow-form-group">

              <label>Title *</label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter title"
                required
              />

            </div>

            {/* DESCRIPTION */}

            <div className="admin-grow-form-group">

              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
                rows="3"
              />

            </div>

            {/* ICON */}

            <div className="admin-grow-form-group">

              <label>Emoji / Icon</label>

              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                placeholder="Example: 🌐 📱 🚀"
              />

            </div>

            {/* =================================
                ROADMAP FIELDS
            ================================= */}

            {activeTab === "roadmaps" && (
              <>
                <div className="admin-grow-form-group">

                  <label>Slug</label>

                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="web-development"
                  />

                </div>

                <div className="admin-grow-form-group">

                  <label>
                    Roadmap Image
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                  <small
                    style={{
                      display: "block",
                      marginTop: "6px",
                      color: "#64748b",
                    }}
                  >
                    Maximum size: 5MB
                  </small>

                </div>

                {formData.imageFile && (
                  <div className="admin-grow-image-preview">

                    <img
                      src={URL.createObjectURL(
                        formData.imageFile
                      )}
                      alt="New roadmap preview"
                    />

                    <p>
                      New image selected
                    </p>

                  </div>
                )}

                {!formData.imageFile &&
                  formData.image_url && (
                    <div className="admin-grow-image-preview">

                      <img
                        src={formData.image_url}
                        alt="Current roadmap"
                      />

                      <p>
                        Current roadmap image
                      </p>

                    </div>
                  )}

              </>
            )}

            {/* =================================
                RESOURCE FIELDS
            ================================= */}

            {activeTab === "resources" && (
              <>

                <div className="admin-grow-form-group">

                  <label>Category</label>

                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Development Tools"
                  />

                </div>

                <div className="admin-grow-form-group">

                  <label>Technology</label>

                  <input
                    type="text"
                    name="technology"
                    value={formData.technology}
                    onChange={handleChange}
                    placeholder="React / Git / VS Code"
                  />

                </div>

                <div className="admin-grow-form-group">

                  <label>
                    Resource URL
                  </label>

                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />

                </div>

              </>
            )}

            {/* ORDER */}

            <div className="admin-grow-form-group">

              <label>Display Order</label>

              <input
                type="number"
                name="display_order"
                value={formData.display_order}
                onChange={handleChange}
                min="1"
              />

            </div>

            {/* ACTIVE */}

            <div className="admin-grow-checkbox">

              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />

              <label htmlFor="is_active">
                Active
              </label>

            </div>

            {/* FORM ACTIONS */}

            <div className="admin-grow-form-actions">

              <button
                type="button"
                className="admin-grow-cancel"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-grow-save"
              >
                {editingItem
                  ? "Update"
                  : "Save"}
              </button>

            </div>

          </form>
        )}

        {/* =====================================
            LIST
        ===================================== */}

        <div className="admin-grow-list">

          {getCurrentData().length === 0 ? (

            <div className="admin-grow-empty">
              No{" "}
              {getTitle().toLowerCase()} found.
            </div>

          ) : (

            getCurrentData().map((item) => (

              <div
                className="admin-grow-item"
                key={item.id}
              >

                {/* ICON */}

                <div className="admin-grow-item-icon">
                  {item.icon || "📌"}
                </div>

                {/* ROADMAP IMAGE */}

                {activeTab === "roadmaps" &&
                  item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="admin-grow-roadmap-image"
                    />
                  )}

                {/* MAIN */}

                <div className="admin-grow-item-main">

                  <h3>{item.title}</h3>

                  <p>
                    {item.description ||
                      "No description"}
                  </p>

                  {/* RESOURCE LINK */}

                  {activeTab === "resources" &&
                    item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-grow-link"
                      >
                        🔗 Open Resource
                      </a>
                    )}

                  {/* ROADMAP IMAGE STATUS */}

                  {activeTab === "roadmaps" &&
                    item.image_url && (
                      <span className="admin-grow-image-text">
                        🖼️ Image added
                      </span>
                    )}

                  <span>
                    Order:{" "}
                    {item.display_order}
                  </span>

                </div>

                {/* STATUS */}

                <div
                  className={
                    item.is_active
                      ? "admin-grow-status active"
                      : "admin-grow-status inactive"
                  }
                >
                  {item.is_active
                    ? "Active"
                    : "Inactive"}
                </div>

                {/* ACTIONS */}

                <div className="admin-grow-item-actions">

                  <button
                    className="admin-grow-edit-btn"
                    onClick={() =>
                      openEditForm(item)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="admin-grow-toggle-btn"
                    onClick={() =>
                      toggleActive(item)
                    }
                  >
                    {item.is_active
                      ? "Disable"
                      : "Enable"}
                  </button>

                  <button
                    className="admin-grow-delete-btn"
                    onClick={() =>
                      handleDelete(item)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))

          )}

        </div>

      </div>

    </div>
  );
}

export default AdminGrow;