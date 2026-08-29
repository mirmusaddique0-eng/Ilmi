import { useEffect, useState } from "react";

import "./AdminDashboard.css";
import { supabase } from "../lib/supabaseClient";
import CollegeSyllabus from "./CollegeSyllabus";
import AdminPracticeQuiz from "./AdminPracticeQuiz";
import AdminBuild from "./AdminBuild";

import AdminGrow from "./AdminGrow";


function AdminDashboard({ user, onLogout }) {
  // =========================================================
  // ADMIN SECTION
  // =========================================================

  const [activeSection, setActiveSection] = useState("dashboard");

  // =========================================================
  // COURSES
  // =========================================================

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [savingCourse, setSavingCourse] = useState(false);

  const [courseForm, setCourseForm] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  // =========================================================
  // SECTIONS
  // =========================================================

  const [selectedCourse, setSelectedCourse] = useState(null);

  const [courseSections, setCourseSections] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [sectionsError, setSectionsError] = useState("");
  const [sectionSearch, setSectionSearch] = useState("");

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [savingSection, setSavingSection] = useState(false);

  const [sectionForm, setSectionForm] = useState({
    title: "",
    display_order: 1,
    is_active: true,
  });

  // =========================================================
  // MODULES
  // =========================================================

  const [selectedSection, setSelectedSection] = useState(null);

  const [courseModules, setCourseModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [modulesError, setModulesError] = useState("");
  const [moduleSearch, setModuleSearch] = useState("");

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [savingModule, setSavingModule] = useState(false);

  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    display_order: 1,
    is_active: true,
  });

  // =========================================================
  // TOPICS
  // =========================================================

  const [selectedModule, setSelectedModule] = useState(null);

  const [courseTopics, setCourseTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicsError, setTopicsError] = useState("");
  const [topicSearch, setTopicSearch] = useState("");

  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [savingTopic, setSavingTopic] = useState(false);

  const [topicForm, setTopicForm] = useState({
    title: "",
    display_order: 1,
    is_active: true,
  });

  // =========================================================
  // LESSONS
  // =========================================================

  const [selectedTopic, setSelectedTopic] = useState(null);

  const [courseLessons, setCourseLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsError, setLessonsError] = useState("");
  const [lessonSearch, setLessonSearch] = useState("");

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [savingLesson, setSavingLesson] = useState(false);

  const [lessonForm, setLessonForm] = useState({
    title: "",
    type: "text",
    content: "",
    display_order: 1,
    is_published: true,
  });

  // =========================================================
  // LOAD COURSES
  // =========================================================

  const loadCourses = async () => {
    try {
      setCoursesLoading(true);
      setCoursesError("");

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Courses Load Error:", error);
        setCoursesError(error.message);
        return;
      }

      setCourses(data || []);
    } catch (error) {
      console.error("Courses Error:", error);
      setCoursesError("Unable to load courses.");
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    if (
      activeSection === "dashboard" ||
      activeSection === "courses"
    ) {
      loadCourses();
    }
  }, [activeSection]);

  // =========================================================
  // COURSE HELPERS
  // =========================================================

  const getCourseName = (course) => {
    return (
      course?.name ||
      course?.title ||
      course?.course_name ||
      course?.course_title ||
      "Untitled Course"
    );
  };
  const [studentCount, setStudentCount] = useState(0);
  const [quizAttemptCount, setQuizAttemptCount] = useState(0);

  const getCourseNameField = (course) => {
    if (Object.prototype.hasOwnProperty.call(course, "name")) {
      return "name";
    }

    if (Object.prototype.hasOwnProperty.call(course, "title")) {
      return "title";
    }

    if (
      Object.prototype.hasOwnProperty.call(
        course,
        "course_name"
      )
    ) {
      return "course_name";
    }

    if (
      Object.prototype.hasOwnProperty.call(
        course,
        "course_title"
      )
    ) {
      return "course_title";
    }

    return "name";
  };

  const getCourseDescription = (course) => {
    return course?.description || "No description available.";
  };

  const getCourseStatus = (course) => {
    return course?.is_active === false ? "Inactive" : "Active";
  };

  // =========================================================
  // COURSE SEARCH
  // =========================================================

  const filteredCourses = courses.filter((course) => {
    const searchText = courseSearch.toLowerCase().trim();

    if (!searchText) {
      return true;
    }

    return (
      getCourseName(course)
        .toLowerCase()
        .includes(searchText) ||
      getCourseDescription(course)
        .toLowerCase()
        .includes(searchText) ||
      String(course.id).includes(searchText)
    );
  });

  // =========================================================
  // NAVIGATION
  // =========================================================

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  // =========================================================
  // COURSE MODAL
  // =========================================================

  const openAddCourse = () => {
    setEditingCourse(null);

    setCourseForm({
      name: "",
      description: "",
      is_active: true,
    });

    setShowCourseModal(true);
  };

  const openEditCourse = (course) => {
    setEditingCourse(course);

    setCourseForm({
      name:
        getCourseName(course) === "Untitled Course"
          ? ""
          : getCourseName(course),
      description: course.description || "",
      is_active: course.is_active !== false,
    });

    setShowCourseModal(true);
  };

  const closeCourseModal = () => {
    if (savingCourse) return;

    setShowCourseModal(false);
    setEditingCourse(null);

    setCourseForm({
      name: "",
      description: "",
      is_active: true,
    });
  };

  const handleCourseFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setCourseForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveCourse = async (event) => {
    event.preventDefault();

    const courseName = courseForm.name.trim();
    const courseDescription = courseForm.description.trim();

    if (!courseName) {
      alert("Please enter a course name.");
      return;
    }

    try {
      setSavingCourse(true);

      if (editingCourse) {
        const nameField = getCourseNameField(editingCourse);

        const updateData = {
          [nameField]: courseName,
          description: courseDescription || null,
          is_active: courseForm.is_active,
        };

        const { error } = await supabase
          .from("courses")
          .update(updateData)
          .eq("id", editingCourse.id);

        if (error) {
          alert(`Unable to update course.\n\n${error.message}`);
          return;
        }

        alert("Course updated successfully.");
      } else {
        let nameField = "name";

        if (courses.length > 0) {
          nameField = getCourseNameField(courses[0]);
        }

        const insertData = {
          [nameField]: courseName,
          description: courseDescription || null,
          is_active: courseForm.is_active,
        };

        const { error } = await supabase
          .from("courses")
          .insert([insertData]);

        if (error) {
          alert(`Unable to add course.\n\n${error.message}`);
          return;
        }

        alert("Course added successfully.");
      }

      closeCourseModal();
      await loadCourses();
    } catch (error) {
      console.error("Save Course Error:", error);
      alert("Something went wrong while saving the course.");
    } finally {
      setSavingCourse(false);
    }
  };

  const handleToggleCourse = async (course) => {
    const currentStatus = course.is_active !== false;
    const newStatus = !currentStatus;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus ? "show" : "hide"
      } "${getCourseName(course)}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("courses")
      .update({ is_active: newStatus })
      .eq("id", course.id);

    if (error) {
      alert(`Unable to change course status.\n\n${error.message}`);
      return;
    }

    await loadCourses();
  };

  // =========================================================
  // SECTION MANAGEMENT
  // =========================================================

  const handleManageCourse = (course) => {
    setSelectedCourse(course);
    setCourseSections([]);
    setSectionSearch("");
    setSectionsError("");
    setActiveSection("course-management");
  };

  const loadCourseSections = async (courseId) => {
    if (!courseId) return;

    try {
      setSectionsLoading(true);
      setSectionsError("");

      const { data, error } = await supabase
        .from("course_sections")
        .select("*")
        .eq("course_id", courseId)
        .order("display_order", { ascending: true });

      if (error) {
        setSectionsError(error.message);
        return;
      }

      setCourseSections(data || []);
    } catch (error) {
      console.error(error);
      setSectionsError("Unable to load course sections.");
    } finally {
      setSectionsLoading(false);
    }
  };

  useEffect(() => {
    if (
      activeSection === "course-management" &&
      selectedCourse
    ) {
      loadCourseSections(selectedCourse.id);
    }
  }, [activeSection, selectedCourse]);

  const filteredSections = courseSections.filter((section) => {
    const searchText = sectionSearch.toLowerCase().trim();

    if (!searchText) return true;

    return (
      String(section.title || "")
        .toLowerCase()
        .includes(searchText) ||
      String(section.id).includes(searchText) ||
      String(section.display_order).includes(searchText)
    );
  });

  const openAddSection = () => {
    const nextOrder =
      courseSections.length > 0
        ? Math.max(
            ...courseSections.map(
              (item) => Number(item.display_order) || 0
            )
          ) + 1
        : 1;

    setEditingSection(null);

    setSectionForm({
      title: "",
      display_order: nextOrder,
      is_active: true,
    });

    setShowSectionModal(true);
  };

  const openEditSection = (section) => {
    setEditingSection(section);

    setSectionForm({
      title: section.title || "",
      display_order: section.display_order || 1,
      is_active: section.is_active !== false,
    });

    setShowSectionModal(true);
  };

  const closeSectionModal = () => {
    if (savingSection) return;

    setShowSectionModal(false);
    setEditingSection(null);

    setSectionForm({
      title: "",
      display_order: 1,
      is_active: true,
    });
  };

  const handleSectionFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setSectionForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveSection = async (event) => {
    event.preventDefault();

    if (!selectedCourse) {
      alert("No course selected.");
      return;
    }

    const title = sectionForm.title.trim();
    const displayOrder = Number(sectionForm.display_order);

    if (!title) {
      alert("Please enter a section title.");
      return;
    }

    if (!displayOrder || displayOrder < 1) {
      alert("Display order must be at least 1.");
      return;
    }

    try {
      setSavingSection(true);

      if (editingSection) {
        const { error } = await supabase
          .from("course_sections")
          .update({
            title,
            display_order: displayOrder,
            is_active: sectionForm.is_active,
          })
          .eq("id", editingSection.id);

        if (error) {
          alert(`Unable to update section.\n\n${error.message}`);
          return;
        }

        alert("Section updated successfully.");
      } else {
        const { error } = await supabase
          .from("course_sections")
          .insert([
            {
              course_id: selectedCourse.id,
              title,
              display_order: displayOrder,
              is_active: sectionForm.is_active,
            },
          ]);

        if (error) {
          alert(`Unable to add section.\n\n${error.message}`);
          return;
        }

        alert("Section added successfully.");
      }

      closeSectionModal();
      await loadCourseSections(selectedCourse.id);
    } finally {
      setSavingSection(false);
    }
  };

  const handleToggleSection = async (section) => {
    const newStatus = section.is_active === false;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus ? "show" : "hide"
      } "${section.title}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("course_sections")
      .update({ is_active: newStatus })
      .eq("id", section.id);

    if (error) {
      alert(`Unable to change section status.\n\n${error.message}`);
      return;
    }

    await loadCourseSections(selectedCourse.id);
  };

  // =========================================================
  // MODULE MANAGEMENT
  // =========================================================

  const handleManageModules = (section) => {
    setSelectedSection(section);
    setCourseModules([]);
    setModuleSearch("");
    setModulesError("");
    setActiveSection("module-management");
  };

  const loadSectionModules = async (sectionId) => {
    if (!sectionId) return;

    try {
      setModulesLoading(true);
      setModulesError("");

      const { data, error } = await supabase
        .from("course_modules")
        .select("*")
        .eq("section_id", sectionId)
        .order("display_order", { ascending: true });

      if (error) {
        setModulesError(error.message);
        return;
      }

      setCourseModules(data || []);
    } catch (error) {
      console.error(error);
      setModulesError("Unable to load modules.");
    } finally {
      setModulesLoading(false);
    }
  };

  useEffect(() => {
    if (
      activeSection === "module-management" &&
      selectedSection
    ) {
      loadSectionModules(selectedSection.id);
    }
  }, [activeSection, selectedSection]);

  const filteredModules = courseModules.filter((module) => {
    const searchText = moduleSearch.toLowerCase().trim();

    if (!searchText) return true;

    return (
      String(module.title || "")
        .toLowerCase()
        .includes(searchText) ||
      String(module.description || "")
        .toLowerCase()
        .includes(searchText) ||
      String(module.id).includes(searchText) ||
      String(module.display_order).includes(searchText)
    );
  });

  const openAddModule = () => {
    const nextOrder =
      courseModules.length > 0
        ? Math.max(
            ...courseModules.map(
              (item) => Number(item.display_order) || 0
            )
          ) + 1
        : 1;

    setEditingModule(null);

    setModuleForm({
      title: "",
      description: "",
      display_order: nextOrder,
      is_active: true,
    });

    setShowModuleModal(true);
  };

  const openEditModule = (module) => {
    setEditingModule(module);

    setModuleForm({
      title: module.title || "",
      description: module.description || "",
      display_order: module.display_order || 1,
      is_active: module.is_active !== false,
    });

    setShowModuleModal(true);
  };

  const closeModuleModal = () => {
    if (savingModule) return;

    setShowModuleModal(false);
    setEditingModule(null);

    setModuleForm({
      title: "",
      description: "",
      display_order: 1,
      is_active: true,
    });
  };

  const handleModuleFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setModuleForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveModule = async (event) => {
    event.preventDefault();

    if (!selectedSection) {
      alert("No section selected.");
      return;
    }

    const title = moduleForm.title.trim();
    const description = moduleForm.description.trim();
    const displayOrder = Number(moduleForm.display_order);

    if (!title) {
      alert("Please enter a module title.");
      return;
    }

    if (!displayOrder || displayOrder < 1) {
      alert("Display order must be at least 1.");
      return;
    }

    try {
      setSavingModule(true);

      if (editingModule) {
        const { error } = await supabase
          .from("course_modules")
          .update({
            title,
            description: description || null,
            display_order: displayOrder,
            is_active: moduleForm.is_active,
          })
          .eq("id", editingModule.id);

        if (error) {
          alert(`Unable to update module.\n\n${error.message}`);
          return;
        }

        alert("Module updated successfully.");
      } else {
        const { error } = await supabase
          .from("course_modules")
          .insert([
            {
              section_id: selectedSection.id,
              title,
              description: description || null,
              display_order: displayOrder,
              is_active: moduleForm.is_active,
            },
          ]);

        if (error) {
          alert(`Unable to add module.\n\n${error.message}`);
          return;
        }

        alert("Module added successfully.");
      }

      closeModuleModal();
      await loadSectionModules(selectedSection.id);
    } finally {
      setSavingModule(false);
    }
  };

  const handleToggleModule = async (module) => {
    const newStatus = module.is_active === false;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus ? "show" : "hide"
      } "${module.title}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("course_modules")
      .update({ is_active: newStatus })
      .eq("id", module.id);

    if (error) {
      alert(`Unable to change module status.\n\n${error.message}`);
      return;
    }

    await loadSectionModules(selectedSection.id);
  };

  // =========================================================
  // TOPIC MANAGEMENT
  // =========================================================

  const handleManageTopics = (module) => {
    setSelectedModule(module);
    setCourseTopics([]);
    setTopicSearch("");
    setTopicsError("");
    setActiveSection("topic-management");
  };

  const loadModuleTopics = async (moduleId) => {
    if (!moduleId) return;

    try {
      setTopicsLoading(true);
      setTopicsError("");

      const { data, error } = await supabase
        .from("course_topics")
        .select("*")
        .eq("module_id", moduleId)
        .order("display_order", { ascending: true });

      if (error) {
        setTopicsError(error.message);
        return;
      }

      setCourseTopics(data || []);
    } catch (error) {
      console.error(error);
      setTopicsError("Unable to load topics.");
    } finally {
      setTopicsLoading(false);
    }
  };

  useEffect(() => {
    if (
      activeSection === "topic-management" &&
      selectedModule
    ) {
      loadModuleTopics(selectedModule.id);
    }
  }, [activeSection, selectedModule]);

  useEffect(() => {
  const fetchStudentCount = async () => {
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student");

    if (error) {
      console.error("Student Count Error:", error);
      return;
    }

    setStudentCount(count || 0);
  };

  fetchStudentCount();
}, []);




useEffect(() => {
  const fetchQuizAttemptCount = async () => {
    const { count, error } = await supabase
      .from("quiz_attempts")
      .select("*", {
        count: "exact",
        head: true,
      });

    if (error) {
      console.error("Quiz Attempt Count Error:", error);
      return;
    }

    setQuizAttemptCount(count || 0);
  };

  fetchQuizAttemptCount();
}, []);

  const filteredTopics = courseTopics.filter((topic) => {
    const searchText = topicSearch.toLowerCase().trim();

    if (!searchText) return true;

    return (
      String(topic.title || "")
        .toLowerCase()
        .includes(searchText) ||
      String(topic.id).includes(searchText) ||
      String(topic.display_order).includes(searchText)
    );
  });

  const openAddTopic = () => {
    const nextOrder =
      courseTopics.length > 0
        ? Math.max(
            ...courseTopics.map(
              (item) => Number(item.display_order) || 0
            )
          ) + 1
        : 1;

    setEditingTopic(null);

    setTopicForm({
      title: "",
      display_order: nextOrder,
      is_active: true,
    });

    setShowTopicModal(true);
  };

  const openEditTopic = (topic) => {
    setEditingTopic(topic);

    setTopicForm({
      title: topic.title || "",
      display_order: topic.display_order || 1,
      is_active: topic.is_active !== false,
    });

    setShowTopicModal(true);
  };

  const closeTopicModal = () => {
    if (savingTopic) return;

    setShowTopicModal(false);
    setEditingTopic(null);

    setTopicForm({
      title: "",
      display_order: 1,
      is_active: true,
    });
  };

  const handleTopicFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setTopicForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveTopic = async (event) => {
    event.preventDefault();

    if (!selectedModule) {
      alert("No module selected.");
      return;
    }

    const title = topicForm.title.trim();
    const displayOrder = Number(topicForm.display_order);

    if (!title) {
      alert("Please enter a topic title.");
      return;
    }

    if (!displayOrder || displayOrder < 1) {
      alert("Display order must be at least 1.");
      return;
    }

    try {
      setSavingTopic(true);

      if (editingTopic) {
        const { error } = await supabase
          .from("course_topics")
          .update({
            title,
            display_order: displayOrder,
            is_active: topicForm.is_active,
          })
          .eq("id", editingTopic.id);

        if (error) {
          alert(`Unable to update topic.\n\n${error.message}`);
          return;
        }

        alert("Topic updated successfully.");
      } else {
        const { error } = await supabase
          .from("course_topics")
          .insert([
            {
              module_id: selectedModule.id,
              title,
              display_order: displayOrder,
              is_active: topicForm.is_active,
            },
          ]);

        if (error) {
          alert(`Unable to add topic.\n\n${error.message}`);
          return;
        }

        alert("Topic added successfully.");
      }

      closeTopicModal();
      await loadModuleTopics(selectedModule.id);
    } finally {
      setSavingTopic(false);
    }
  };

  const handleToggleTopic = async (topic) => {
    const newStatus = topic.is_active === false;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus ? "show" : "hide"
      } "${topic.title}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("course_topics")
      .update({ is_active: newStatus })
      .eq("id", topic.id);

    if (error) {
      alert(`Unable to change topic status.\n\n${error.message}`);
      return;
    }

    await loadModuleTopics(selectedModule.id);
  };

  // =========================================================
  // LESSON MANAGEMENT
  // =========================================================

  const handleManageLessons = (topic) => {
    setSelectedTopic(topic);
    setCourseLessons([]);
    setLessonSearch("");
    setLessonsError("");
    setActiveSection("lesson-management");
  };

  const loadTopicLessons = async (topicId) => {
    if (!topicId) return;

    try {
      setLessonsLoading(true);
      setLessonsError("");

      const { data, error } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("topic_id", topicId)
        .order("display_order", { ascending: true });

      if (error) {
        setLessonsError(error.message);
        return;
      }

      setCourseLessons(data || []);
    } catch (error) {
      console.error(error);
      setLessonsError("Unable to load lessons.");
    } finally {
      setLessonsLoading(false);
    }
  };

  useEffect(() => {
    if (
      activeSection === "lesson-management" &&
      selectedTopic
    ) {
      loadTopicLessons(selectedTopic.id);
    }
  }, [activeSection, selectedTopic]);

  const filteredLessons = courseLessons.filter((lesson) => {
    const searchText = lessonSearch.toLowerCase().trim();

    if (!searchText) return true;

    return (
      String(lesson.title || "")
        .toLowerCase()
        .includes(searchText) ||
      String(lesson.type || "")
        .toLowerCase()
        .includes(searchText) ||
      String(lesson.id).includes(searchText) ||
      String(lesson.display_order).includes(searchText)
    );
  });

  const openAddLesson = () => {
    const nextOrder =
      courseLessons.length > 0
        ? Math.max(
            ...courseLessons.map(
              (item) => Number(item.display_order) || 0
            )
          ) + 1
        : 1;

    setEditingLesson(null);

    setLessonForm({
      title: "",
      type: "text",
      content: "",
      display_order: nextOrder,
      is_published: true,
    });

    setShowLessonModal(true);
  };

  const openEditLesson = (lesson) => {
    setEditingLesson(lesson);

    setLessonForm({
      title: lesson.title || "",
      type: lesson.type || "text",
      content: lesson.content || "",
      display_order: lesson.display_order || 1,
      is_published: lesson.is_published !== false,
    });

    setShowLessonModal(true);
  };

  const closeLessonModal = () => {
    if (savingLesson) return;

    setShowLessonModal(false);
    setEditingLesson(null);

    setLessonForm({
      title: "",
      type: "text",
      content: "",
      display_order: 1,
      is_published: true,
    });
  };

  const handleLessonFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setLessonForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveLesson = async (event) => {
    event.preventDefault();

    if (!selectedTopic) {
      alert("No topic selected.");
      return;
    }

    const title = lessonForm.title.trim();
    const type = lessonForm.type.trim() || "text";
    const content = lessonForm.content.trim();
    const displayOrder = Number(lessonForm.display_order);

    if (!title) {
      alert("Please enter a lesson title.");
      return;
    }

    if (!displayOrder || displayOrder < 1) {
      alert("Display order must be at least 1.");
      return;
    }

    try {
      setSavingLesson(true);

      const lessonData = {
        title,
        type,
        content: content || null,
        display_order: displayOrder,
        is_published: lessonForm.is_published,
      };

      if (editingLesson) {
        const { error } = await supabase
          .from("course_lessons")
          .update(lessonData)
          .eq("id", editingLesson.id);

        if (error) {
          alert(`Unable to update lesson.\n\n${error.message}`);
          return;
        }

        alert("Lesson updated successfully.");
      } else {
        const { error } = await supabase
          .from("course_lessons")
          .insert([
            {
              topic_id: selectedTopic.id,
              ...lessonData,
            },
          ]);

        if (error) {
          alert(`Unable to add lesson.\n\n${error.message}`);
          return;
        }

        alert("Lesson added successfully.");
      }

      closeLessonModal();
      await loadTopicLessons(selectedTopic.id);
    } finally {
      setSavingLesson(false);
    }
  };

  const handleToggleLesson = async (lesson) => {
    const newStatus = lesson.is_published === false;

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus ? "publish" : "unpublish"
      } "${lesson.title}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("course_lessons")
      .update({ is_published: newStatus })
      .eq("id", lesson.id);

    if (error) {
      alert(`Unable to change lesson status.\n\n${error.message}`);
      return;
    }

    await loadTopicLessons(selectedTopic.id);
  };

  // =========================================================
  // DASHBOARD
  // =========================================================

  const renderDashboard = () => {
    return (
      <>
        <div className="admin-welcome">
          <h2>Welcome back, Admin 👋</h2>

          <p>
            Manage EDUVANTA content, students and
            learning resources from one place.
          </p>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-icon">📚</div>
            <div>
              <span>Courses</span>
              <strong>{courses.length}</strong>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-icon">📖</div>
            <div>
              <span>Lessons</span>
              <strong>56</strong>
            </div>
          </div>

          <div className="admin-stat-card">
  <div className="admin-stat-icon">👥</div>
  <div>
    <span>Students</span>
    <strong>{studentCount}</strong>
  </div>
</div>
         <div className="admin-stat-card">
  <div className="admin-stat-icon">📝</div>
  <div>
    <span>Quiz Attempts</span>
    <strong>{quizAttemptCount}</strong>
  </div>
</div>
        </div>

        <section className="admin-section">
          <div className="admin-section-header">
            <div>
              <h2>Content Management</h2>
              <p>
                Manage different sections of EDUVANTA.
              </p>
            </div>
          </div>

          <div className="admin-management-grid">
            <div className="admin-management-card">
              <div className="management-icon">📚</div>
              <h3>Courses</h3>
              <p>
                Add, edit and manage complete course
                content.
              </p>
              <button
                onClick={() =>
                  handleSectionChange("courses")
                }
              >
                Manage Courses →
              </button>
            </div>

            <div className="admin-management-card">
              <div className="management-icon">🎓</div>
              <h3>College Syllabus</h3>
              <p>
                Manage years, semesters, subjects,
                units and topics.
              </p>
              <button
                onClick={() =>
                  handleSectionChange("syllabus")
                }
              >
                Manage Syllabus →
              </button>
            </div>

            <div className="admin-management-card">
              <div className="management-icon">📝</div>
              <h3>Practice & Quizzes</h3>
              <p>
                Manage questions, quizzes and practice
                content.
              </p>
              <button
                onClick={() =>
                  handleSectionChange("practice")
                }
              >
                Manage Practice →
              </button>
            </div>

            <div className="admin-management-card">
              <div className="management-icon">🛠️</div>
              <h3>Build</h3>
              <p>
                Manage projects, practice projects and
                coding challenges.
              </p>
              <button
                onClick={() =>
                  handleSectionChange("build")
                }
              >
                Manage Build →
              </button>
            </div>

            <div className="admin-management-card">
              <div className="management-icon">🌱</div>
              <h3>Grow</h3>
              <p>
                Manage roadmaps and resources
              </p>
              <button
                onClick={() =>
                  handleSectionChange("grow")
                }
              >
                Manage Grow →
              </button>
            </div>

            <div className="admin-management-card">
              <div className="management-icon">👥</div>
              <h3>Students</h3>
              <p>
                View registered students and their
                learning activity.
              </p>
              <button
                onClick={() =>
                  handleSectionChange("students")
                }
              >
                View Students →
              </button>
            </div>
          </div>
        </section>
      </>
    );
  };

  // =========================================================
  // COURSES PAGE
  // =========================================================

  const renderCourses = () => {
    return (
      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2>Courses Management</h2>
            <p>
              Manage complete EDUVANTA course
              structure.
            </p>
          </div>

          <button
            className="admin-back-btn"
            onClick={() =>
              handleSectionChange("dashboard")
            }
          >
            ← Dashboard
          </button>
        </div>

        <div className="admin-course-toolbar">
          <div className="admin-course-search">
            <span>🔎</span>

            <input
              type="text"
              placeholder="Search courses..."
              value={courseSearch}
              onChange={(event) =>
                setCourseSearch(event.target.value)
              }
            />
          </div>

          <button
            className="admin-add-course-btn"
            onClick={openAddCourse}
          >
            + Add Course
          </button>
        </div>

        <div className="admin-course-summary">
          <span>
            Total Courses:
            <strong>{courses.length}</strong>
          </span>

          <span>
            Active:
            <strong>
              {
                courses.filter(
                  (course) =>
                    course.is_active !== false
                ).length
              }
            </strong>
          </span>

          <span>
            Hidden:
            <strong>
              {
                courses.filter(
                  (course) =>
                    course.is_active === false
                ).length
              }
            </strong>
          </span>
        </div>

        {coursesLoading && (
          <div className="admin-empty-state">
            <div>⏳</div>
            <h3>Loading courses...</h3>
            <p>Fetching courses from Supabase.</p>
          </div>
        )}

        {!coursesLoading && coursesError && (
          <div className="admin-error-state">
            <h3>Unable to load courses</h3>
            <p>{coursesError}</p>
            <button onClick={loadCourses}>
              Try Again
            </button>
          </div>
        )}

        {!coursesLoading &&
          !coursesError &&
          filteredCourses.length > 0 && (
            <div className="admin-course-list">
              {filteredCourses.map((course) => (
                <div
                  className={
                    course.is_active === false
                      ? "admin-course-card course-hidden"
                      : "admin-course-card"
                  }
                  key={course.id}
                >
                  <div className="admin-course-card-top">
                    <div className="admin-course-icon">
                      📚
                    </div>

                    <span
                      className={
                        getCourseStatus(course) ===
                        "Active"
                          ? "course-status active"
                          : "course-status inactive"
                      }
                    >
                      {getCourseStatus(course)}
                    </span>
                  </div>

                  <h3>{getCourseName(course)}</h3>

                  <p>
                    {getCourseDescription(course)}
                  </p>

                  <div className="admin-course-meta">
                    <span>
                      Course ID: {course.id}
                    </span>
                  </div>

                  <div className="admin-course-actions">
                    <button
                      className="admin-course-manage-btn"
                      onClick={() =>
                        handleManageCourse(course)
                      }
                    >
                      Manage Course →
                    </button>

                    <button
                      className="admin-course-edit-btn"
                      onClick={() =>
                        openEditCourse(course)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className={
                        course.is_active === false
                          ? "admin-course-show-btn"
                          : "admin-course-hide-btn"
                      }
                      onClick={() =>
                        handleToggleCourse(course)
                      }
                    >
                      {course.is_active === false
                        ? "Show"
                        : "Hide"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        {!coursesLoading &&
          !coursesError &&
          courses.length === 0 && (
            <div className="admin-empty-state">
              <div>📚</div>
              <h3>No courses found</h3>
              <p>
                There are currently no courses in
                Supabase.
              </p>
            </div>
          )}
      </section>
    );
  };

  // =========================================================
  // SECTIONS PAGE
  // =========================================================

  const renderCourseSections = () => {
    if (!selectedCourse) {
      return (
        <div className="admin-error-state">
          <h3>No course selected</h3>
          <button
            onClick={() =>
              handleSectionChange("courses")
            }
          >
            ← Courses
          </button>
        </div>
      );
    }

    return (
      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2>
              📚 {getCourseName(selectedCourse)}
            </h2>
            <p>
              Manage sections of this course.
            </p>
          </div>

          <button
            className="admin-back-btn"
            onClick={() => {
              setSelectedCourse(null);
              handleSectionChange("courses");
            }}
          >
            ← Courses
          </button>
        </div>

        <div className="admin-course-summary">
          <span>
            Sections:
            <strong>{courseSections.length}</strong>
          </span>

          <span>
            Active:
            <strong>
              {
                courseSections.filter(
                  (item) =>
                    item.is_active !== false
                ).length
              }
            </strong>
          </span>
        </div>

        <div className="admin-course-toolbar">
          <div className="admin-course-search">
            <span>🔎</span>
            <input
              type="text"
              placeholder="Search sections..."
              value={sectionSearch}
              onChange={(event) =>
                setSectionSearch(event.target.value)
              }
            />
          </div>

          <button
            className="admin-add-course-btn"
            onClick={openAddSection}
          >
            + Add Section
          </button>
        </div>

        {sectionsLoading && (
          <div className="admin-empty-state">
            <div>⏳</div>
            <h3>Loading sections...</h3>
          </div>
        )}

        {!sectionsLoading && sectionsError && (
          <div className="admin-error-state">
            <h3>Unable to load sections</h3>
            <p>{sectionsError}</p>
          </div>
        )}

        {!sectionsLoading &&
          !sectionsError &&
          filteredSections.length > 0 && (
            <div className="admin-course-list">
              {filteredSections.map((section) => (
                <div
                  className={
                    section.is_active === false
                      ? "admin-course-card course-hidden"
                      : "admin-course-card"
                  }
                  key={section.id}
                >
                  <div className="admin-course-card-top">
                    <div className="admin-course-icon">
                      📂
                    </div>

                    <span
                      className={
                        section.is_active !== false
                          ? "course-status active"
                          : "course-status inactive"
                      }
                    >
                      {section.is_active !== false
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <h3>{section.title}</h3>

                  <p>
                    Section {section.display_order}
                  </p>

                  <div className="admin-course-meta">
                    <span>
                      Section ID: {section.id}
                    </span>
                  </div>

                  <div className="admin-course-actions">
                    <button
                      className="admin-course-manage-btn"
                      onClick={() =>
                        handleManageModules(section)
                      }
                    >
                      Manage Modules →
                    </button>

                    <button
                      className="admin-course-edit-btn"
                      onClick={() =>
                        openEditSection(section)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className={
                        section.is_active === false
                          ? "admin-course-show-btn"
                          : "admin-course-hide-btn"
                      }
                      onClick={() =>
                        handleToggleSection(section)
                      }
                    >
                      {section.is_active === false
                        ? "Show"
                        : "Hide"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </section>
    );
  };

  // =========================================================
  // MODULE PAGE
  // =========================================================

  const renderCourseModules = () => {
    if (!selectedSection) {
      return (
        <div className="admin-error-state">
          <h3>No section selected</h3>
          <button
            onClick={() =>
              handleSectionChange(
                "course-management"
              )
            }
          >
            ← Sections
          </button>
        </div>
      );
    }

    return (
      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2>📂 {selectedSection.title}</h2>
            <p>Manage modules of this section.</p>
          </div>

          <button
            className="admin-back-btn"
            onClick={() => {
              setSelectedSection(null);
              handleSectionChange(
                "course-management"
              );
            }}
          >
            ← Sections
          </button>
        </div>

        <div className="admin-course-summary">
          <span>
            Modules:
            <strong>{courseModules.length}</strong>
          </span>

          <span>
            Active:
            <strong>
              {
                courseModules.filter(
                  (item) =>
                    item.is_active !== false
                ).length
              }
            </strong>
          </span>
        </div>

        <div className="admin-course-toolbar">
          <div className="admin-course-search">
            <span>🔎</span>
            <input
              type="text"
              placeholder="Search modules..."
              value={moduleSearch}
              onChange={(event) =>
                setModuleSearch(event.target.value)
              }
            />
          </div>

          <button
            className="admin-add-course-btn"
            onClick={openAddModule}
          >
            + Add Module
          </button>
        </div>

        {modulesLoading && (
          <div className="admin-empty-state">
            <div>⏳</div>
            <h3>Loading modules...</h3>
          </div>
        )}

        {!modulesLoading && modulesError && (
          <div className="admin-error-state">
            <h3>Unable to load modules</h3>
            <p>{modulesError}</p>
          </div>
        )}

        {!modulesLoading &&
          !modulesError &&
          filteredModules.length > 0 && (
            <div className="admin-course-list">
              {filteredModules.map((module) => (
                <div
                  className={
                    module.is_active === false
                      ? "admin-course-card course-hidden"
                      : "admin-course-card"
                  }
                  key={module.id}
                >
                  <div className="admin-course-card-top">
                    <div className="admin-course-icon">
                      📦
                    </div>

                    <span
                      className={
                        module.is_active !== false
                          ? "course-status active"
                          : "course-status inactive"
                      }
                    >
                      {module.is_active !== false
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <h3>{module.title}</h3>

                  <p>
                    {module.description ||
                      "No description available."}
                  </p>

                  <div className="admin-course-meta">
                    <span>
                      Module ID: {module.id}
                    </span>

                    <span>
                      Order: {module.display_order}
                    </span>
                  </div>

                  <div className="admin-course-actions">
                    <button
                      className="admin-course-manage-btn"
                      onClick={() =>
                        handleManageTopics(module)
                      }
                    >
                      Manage Topics →
                    </button>

                    <button
                      className="admin-course-edit-btn"
                      onClick={() =>
                        openEditModule(module)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className={
                        module.is_active === false
                          ? "admin-course-show-btn"
                          : "admin-course-hide-btn"
                      }
                      onClick={() =>
                        handleToggleModule(module)
                      }
                    >
                      {module.is_active === false
                        ? "Show"
                        : "Hide"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </section>
    );
  };

  // =========================================================
  // TOPIC PAGE
  // =========================================================

  const renderCourseTopics = () => {
    if (!selectedModule) {
      return (
        <div className="admin-error-state">
          <h3>No module selected</h3>
          <button
            onClick={() =>
              handleSectionChange(
                "module-management"
              )
            }
          >
            ← Modules
          </button>
        </div>
      );
    }

    return (
      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2>📦 {selectedModule.title}</h2>
            <p>Manage topics of this module.</p>
          </div>

          <button
            className="admin-back-btn"
            onClick={() => {
              setSelectedModule(null);
              handleSectionChange(
                "module-management"
              );
            }}
          >
            ← Modules
          </button>
        </div>

        <div className="admin-course-summary">
          <span>
            Topics:
            <strong>{courseTopics.length}</strong>
          </span>

          <span>
            Active:
            <strong>
              {
                courseTopics.filter(
                  (item) =>
                    item.is_active !== false
                ).length
              }
            </strong>
          </span>
        </div>

        <div className="admin-course-toolbar">
          <div className="admin-course-search">
            <span>🔎</span>

            <input
              type="text"
              placeholder="Search topics..."
              value={topicSearch}
              onChange={(event) =>
                setTopicSearch(event.target.value)
              }
            />
          </div>

          <button
            className="admin-add-course-btn"
            onClick={openAddTopic}
          >
            + Add Topic
          </button>
        </div>

        {topicsLoading && (
          <div className="admin-empty-state">
            <div>⏳</div>
            <h3>Loading topics...</h3>
          </div>
        )}

        {!topicsLoading && topicsError && (
          <div className="admin-error-state">
            <h3>Unable to load topics</h3>
            <p>{topicsError}</p>
          </div>
        )}

        {!topicsLoading &&
          !topicsError &&
          filteredTopics.length > 0 && (
            <div className="admin-course-list">
              {filteredTopics.map((topic) => (
                <div
                  className={
                    topic.is_active === false
                      ? "admin-course-card course-hidden"
                      : "admin-course-card"
                  }
                  key={topic.id}
                >
                  <div className="admin-course-card-top">
                    <div className="admin-course-icon">
                      📑
                    </div>

                    <span
                      className={
                        topic.is_active !== false
                          ? "course-status active"
                          : "course-status inactive"
                      }
                    >
                      {topic.is_active !== false
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <h3>{topic.title}</h3>

                  <p>
                    Topic {topic.display_order}
                  </p>

                  <div className="admin-course-meta">
                    <span>
                      Topic ID: {topic.id}
                    </span>

                    <span>
                      Order: {topic.display_order}
                    </span>
                  </div>

                  <div className="admin-course-actions">
                    <button
                      className="admin-course-manage-btn"
                      onClick={() =>
                        handleManageLessons(topic)
                      }
                    >
                      Manage Lessons →
                    </button>

                    <button
                      className="admin-course-edit-btn"
                      onClick={() =>
                        openEditTopic(topic)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className={
                        topic.is_active === false
                          ? "admin-course-show-btn"
                          : "admin-course-hide-btn"
                      }
                      onClick={() =>
                        handleToggleTopic(topic)
                      }
                    >
                      {topic.is_active === false
                        ? "Show"
                        : "Hide"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </section>
    );
  };

  // =========================================================
  // LESSON PAGE
  // =========================================================

  const renderCourseLessons = () => {
    if (!selectedTopic) {
      return (
        <div className="admin-error-state">
          <h3>No topic selected</h3>

          <button
            onClick={() =>
              handleSectionChange(
                "topic-management"
              )
            }
          >
            ← Topics
          </button>
        </div>
      );
    }

    return (
      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2>📑 {selectedTopic.title}</h2>

            <p>
              Manage lessons and lesson content.
            </p>
          </div>

          <button
            className="admin-back-btn"
            onClick={() => {
              setSelectedTopic(null);

              handleSectionChange(
                "topic-management"
              );
            }}
          >
            ← Topics
          </button>
        </div>

        <div className="admin-course-summary">
          <span>
            Lessons:
            <strong>{courseLessons.length}</strong>
          </span>

          <span>
            Published:
            <strong>
              {
                courseLessons.filter(
                  (lesson) =>
                    lesson.is_published !== false
                ).length
              }
            </strong>
          </span>

          <span>
            Draft:
            <strong>
              {
                courseLessons.filter(
                  (lesson) =>
                    lesson.is_published === false
                ).length
              }
            </strong>
          </span>
        </div>

        <div className="admin-course-toolbar">
          <div className="admin-course-search">
            <span>🔎</span>

            <input
              type="text"
              placeholder="Search lessons..."
              value={lessonSearch}
              onChange={(event) =>
                setLessonSearch(event.target.value)
              }
            />
          </div>

          <button
            className="admin-add-course-btn"
            onClick={openAddLesson}
          >
            + Add Lesson
          </button>
        </div>

        {lessonsLoading && (
          <div className="admin-empty-state">
            <div>⏳</div>
            <h3>Loading lessons...</h3>

            <p>
              Fetching lessons from Supabase.
            </p>
          </div>
        )}

        {!lessonsLoading && lessonsError && (
          <div className="admin-error-state">
            <h3>Unable to load lessons</h3>

            <p>{lessonsError}</p>

            <button
              onClick={() =>
                loadTopicLessons(selectedTopic.id)
              }
            >
              Try Again
            </button>
          </div>
        )}

        {!lessonsLoading &&
          !lessonsError &&
          filteredLessons.length > 0 && (
            <div className="admin-course-list">
              {filteredLessons.map((lesson) => (
                <div
                  className={
                    lesson.is_published === false
                      ? "admin-course-card course-hidden"
                      : "admin-course-card"
                  }
                  key={lesson.id}
                >
                  <div className="admin-course-card-top">
                    <div className="admin-course-icon">
                      📖
                    </div>

                    <span
                      className={
                        lesson.is_published !== false
                          ? "course-status active"
                          : "course-status inactive"
                      }
                    >
                      {lesson.is_published !== false
                        ? "Published"
                        : "Draft"}
                    </span>
                  </div>

                  <h3>{lesson.title}</h3>

                  <p>
                    Type: {lesson.type || "text"}
                  </p>

                  <div className="admin-course-meta">
                    <span>
                      Lesson ID: {lesson.id}
                    </span>

                    <span>
                      Order: {lesson.display_order}
                    </span>
                  </div>

                  <div className="admin-course-actions">
                    <button
                      className="admin-course-edit-btn"
                      onClick={() =>
                        openEditLesson(lesson)
                      }
                    >
                      Edit Lesson
                    </button>

                    <button
                      className={
                        lesson.is_published === false
                          ? "admin-course-show-btn"
                          : "admin-course-hide-btn"
                      }
                      onClick={() =>
                        handleToggleLesson(lesson)
                      }
                    >
                      {lesson.is_published === false
                        ? "Publish"
                        : "Unpublish"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        {!lessonsLoading &&
          !lessonsError &&
          courseLessons.length === 0 && (
            <div className="admin-empty-state">
              <div>📖</div>

              <h3>No lessons found</h3>

              <p>
                Add the first lesson to this topic.
              </p>
            </div>
          )}
      </section>
    );
  };

  // =========================================================
  // COURSE MODAL
  // =========================================================

  const renderCourseModal = () => {
    if (!showCourseModal) return null;

    const isEditing = Boolean(editingCourse);

    return (
      <div
        className="admin-modal-overlay"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            closeCourseModal();
          }
        }}
      >
        <div className="admin-course-modal">
          <div className="admin-modal-header">
            <div>
              <h2>
                {isEditing
                  ? "Edit Course"
                  : "Add Course"}
              </h2>

              <p>
                {isEditing
                  ? "Update course information."
                  : "Create a new EDUVANTA course."}
              </p>
            </div>

            <button
              className="admin-modal-close"
              onClick={closeCourseModal}
              disabled={savingCourse}
            >
              ×
            </button>
          </div>

          <form
            className="admin-course-form"
            onSubmit={handleSaveCourse}
          >
            <div className="admin-form-group">
              <label>Course Name</label>

              <input
                type="text"
                name="name"
                placeholder="e.g. Web Development"
                value={courseForm.name}
                onChange={handleCourseFormChange}
                disabled={savingCourse}
              />
            </div>

            <div className="admin-form-group">
              <label>Description</label>

              <textarea
                name="description"
                rows="4"
                placeholder="Enter course description..."
                value={courseForm.description}
                onChange={handleCourseFormChange}
                disabled={savingCourse}
              />
            </div>

            <label className="admin-active-toggle">
              <input
                type="checkbox"
                name="is_active"
                checked={courseForm.is_active}
                onChange={handleCourseFormChange}
                disabled={savingCourse}
              />

              <span>Course is active</span>
            </label>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-modal-cancel"
                onClick={closeCourseModal}
                disabled={savingCourse}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-modal-save"
                disabled={savingCourse}
              >
                {savingCourse
                  ? "Saving..."
                  : isEditing
                  ? "Update Course"
                  : "Add Course"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // =========================================================
  // SECTION MODAL
  // =========================================================

  const renderSectionModal = () => {
    if (!showSectionModal) return null;

    const isEditing = Boolean(editingSection);

    return (
      <div
        className="admin-modal-overlay"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            closeSectionModal();
          }
        }}
      >
        <div className="admin-course-modal">
          <div className="admin-modal-header">
            <div>
              <h2>
                {isEditing
                  ? "Edit Section"
                  : "Add Section"}
              </h2>

              <p>
                Manage course section.
              </p>
            </div>

            <button
              className="admin-modal-close"
              onClick={closeSectionModal}
              disabled={savingSection}
            >
              ×
            </button>
          </div>

          <form
            className="admin-course-form"
            onSubmit={handleSaveSection}
          >
            <div className="admin-form-group">
              <label>Section Title</label>

              <input
                type="text"
                name="title"
                placeholder="e.g. Frontend"
                value={sectionForm.title}
                onChange={handleSectionFormChange}
                disabled={savingSection}
              />
            </div>

            <div className="admin-form-group">
              <label>Display Order</label>

              <input
                type="number"
                name="display_order"
                min="1"
                value={sectionForm.display_order}
                onChange={handleSectionFormChange}
                disabled={savingSection}
              />
            </div>

            <label className="admin-active-toggle">
              <input
                type="checkbox"
                name="is_active"
                checked={sectionForm.is_active}
                onChange={handleSectionFormChange}
                disabled={savingSection}
              />

              <span>Section is active</span>
            </label>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-modal-cancel"
                onClick={closeSectionModal}
                disabled={savingSection}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-modal-save"
                disabled={savingSection}
              >
                {savingSection
                  ? "Saving..."
                  : isEditing
                  ? "Update Section"
                  : "Add Section"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // =========================================================
  // MODULE MODAL
  // =========================================================

  const renderModuleModal = () => {
    if (!showModuleModal) return null;

    const isEditing = Boolean(editingModule);

    return (
      <div
        className="admin-modal-overlay"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            closeModuleModal();
          }
        }}
      >
        <div className="admin-course-modal">
          <div className="admin-modal-header">
            <div>
              <h2>
                {isEditing
                  ? "Edit Module"
                  : "Add Module"}
              </h2>

              <p>
                Manage section module.
              </p>
            </div>

            <button
              className="admin-modal-close"
              onClick={closeModuleModal}
              disabled={savingModule}
            >
              ×
            </button>
          </div>

          <form
            className="admin-course-form"
            onSubmit={handleSaveModule}
          >
            <div className="admin-form-group">
              <label>Module Title</label>

              <input
                type="text"
                name="title"
                placeholder="e.g. HTML"
                value={moduleForm.title}
                onChange={handleModuleFormChange}
                disabled={savingModule}
              />
            </div>

            <div className="admin-form-group">
              <label>Description</label>

              <textarea
                name="description"
                rows="4"
                placeholder="Enter module description..."
                value={moduleForm.description}
                onChange={handleModuleFormChange}
                disabled={savingModule}
              />
            </div>

            <div className="admin-form-group">
              <label>Display Order</label>

              <input
                type="number"
                name="display_order"
                min="1"
                value={moduleForm.display_order}
                onChange={handleModuleFormChange}
                disabled={savingModule}
              />
            </div>

            <label className="admin-active-toggle">
              <input
                type="checkbox"
                name="is_active"
                checked={moduleForm.is_active}
                onChange={handleModuleFormChange}
                disabled={savingModule}
              />

              <span>Module is active</span>
            </label>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-modal-cancel"
                onClick={closeModuleModal}
                disabled={savingModule}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-modal-save"
                disabled={savingModule}
              >
                {savingModule
                  ? "Saving..."
                  : isEditing
                  ? "Update Module"
                  : "Add Module"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // =========================================================
  // TOPIC MODAL
  // =========================================================

  const renderTopicModal = () => {
    if (!showTopicModal) return null;

    const isEditing = Boolean(editingTopic);

    return (
      <div
        className="admin-modal-overlay"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            closeTopicModal();
          }
        }}
      >
        <div className="admin-course-modal">
          <div className="admin-modal-header">
            <div>
              <h2>
                {isEditing
                  ? "Edit Topic"
                  : "Add Topic"}
              </h2>

              <p>
                Manage module topic.
              </p>
            </div>

            <button
              className="admin-modal-close"
              onClick={closeTopicModal}
              disabled={savingTopic}
            >
              ×
            </button>
          </div>

          <form
            className="admin-course-form"
            onSubmit={handleSaveTopic}
          >
            <div className="admin-form-group">
              <label>Topic Title</label>

              <input
                type="text"
                name="title"
                placeholder="e.g. HTML Basics"
                value={topicForm.title}
                onChange={handleTopicFormChange}
                disabled={savingTopic}
              />
            </div>

            <div className="admin-form-group">
              <label>Display Order</label>

              <input
                type="number"
                name="display_order"
                min="1"
                value={topicForm.display_order}
                onChange={handleTopicFormChange}
                disabled={savingTopic}
              />
            </div>

            <label className="admin-active-toggle">
              <input
                type="checkbox"
                name="is_active"
                checked={topicForm.is_active}
                onChange={handleTopicFormChange}
                disabled={savingTopic}
              />

              <span>Topic is active</span>
            </label>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-modal-cancel"
                onClick={closeTopicModal}
                disabled={savingTopic}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-modal-save"
                disabled={savingTopic}
              >
                {savingTopic
                  ? "Saving..."
                  : isEditing
                  ? "Update Topic"
                  : "Add Topic"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // =========================================================
  // LESSON MODAL
  // =========================================================

  const renderLessonModal = () => {
    if (!showLessonModal) return null;

    const isEditing = Boolean(editingLesson);

    return (
      <div
        className="admin-modal-overlay"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            closeLessonModal();
          }
        }}
      >
        <div
          className="admin-course-modal"
          style={{ maxWidth: "760px" }}
        >
          <div className="admin-modal-header">
            <div>
              <h2>
                {isEditing
                  ? "Edit Lesson"
                  : "Add Lesson"}
              </h2>

              <p>
                Add lesson title, type and content.
              </p>
            </div>

            <button
              className="admin-modal-close"
              onClick={closeLessonModal}
              disabled={savingLesson}
            >
              ×
            </button>
          </div>

          <form
            className="admin-course-form"
            onSubmit={handleSaveLesson}
          >
            <div className="admin-form-group">
              <label>Lesson Title</label>

              <input
                type="text"
                name="title"
                placeholder="e.g. Introduction to HTML"
                value={lessonForm.title}
                onChange={handleLessonFormChange}
                disabled={savingLesson}
              />
            </div>

            <div className="admin-form-group">
              <label>Lesson Type</label>

              <select
                name="type"
                value={lessonForm.type}
                onChange={handleLessonFormChange}
                disabled={savingLesson}
              >
                <option value="text">Text</option>
                <option value="video">Video</option>
                <option value="code">Code</option>
                <option value="example">Example</option>
                <option value="note">Note</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label>Lesson Content</label>

              <textarea
                name="content"
                rows="10"
                placeholder="Write lesson content here..."
                value={lessonForm.content}
                onChange={handleLessonFormChange}
                disabled={savingLesson}
              />
            </div>

            <div className="admin-form-group">
              <label>Display Order</label>

              <input
                type="number"
                name="display_order"
                min="1"
                value={lessonForm.display_order}
                onChange={handleLessonFormChange}
                disabled={savingLesson}
              />
            </div>

            <label className="admin-active-toggle">
              <input
                type="checkbox"
                name="is_published"
                checked={lessonForm.is_published}
                onChange={handleLessonFormChange}
                disabled={savingLesson}
              />

              <span>Lesson is published</span>
            </label>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-modal-cancel"
                onClick={closeLessonModal}
                disabled={savingLesson}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-modal-save"
                disabled={savingLesson}
              >
                {savingLesson
                  ? "Saving..."
                  : isEditing
                  ? "Update Lesson"
                  : "Add Lesson"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // =========================================================
  // PLACEHOLDER
  // =========================================================

  const renderPlaceholder = (
    title,
    icon,
    description
  ) => {
    return (
      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2>
              {icon} {title}
            </h2>

            <p>{description}</p>
          </div>

          <button
            className="admin-back-btn"
            onClick={() =>
              handleSectionChange("dashboard")
            }
          >
            ← Dashboard
          </button>
        </div>

        <div className="admin-empty-state">
          <div>🚧</div>

          <h3>{title} Management</h3>

          <p>
            This section will be connected to
            Supabase next.
          </p>
        </div>
      </section>
    );
  };

  // =========================================================
  // CONTENT
  // =========================================================

  const renderContent = () => {
    switch (activeSection) {
      case "courses":
        return renderCourses();

      case "course-management":
        return renderCourseSections();

      case "module-management":
        return renderCourseModules();

      case "topic-management":
        return renderCourseTopics();

      case "lesson-management":
        return renderCourseLessons();

case "syllabus":
  return (
    <CollegeSyllabus
      adminMode={true}
       onBack={() => setActiveSection("dashboard")}
    />
  );

      case "practice":
        return (
          <AdminPracticeQuiz
          adminMode={true}
          onBack={()=> setActiveSection("dashboard")}
        
          />
        );

      case "build":
  return (
    <AdminBuild
      adminMode={true}
      onBack={() => setActiveSection("dashboard")}
    />
  );

     case "grow":
  return (
    <AdminGrow
      adminMode={true}
      onBack={() => setActiveSection("dashboard")}
    />
  );

      case "students":
        return renderPlaceholder(
          "Students",
          "👥",
          "View registered students and their learning activity."
        );

      default:
        return renderDashboard();
    }
  };

  // =========================================================
  // PAGE TITLE
  // =========================================================

  const getPageTitle = () => {
    switch (activeSection) {
      case "courses":
        return "Courses";

      case "course-management":
        return "Course Sections";

      case "module-management":
        return "Course Modules";

      case "topic-management":
        return "Course Topics";

      case "lesson-management":
        return "Course Lessons";

      case "syllabus":
        return "College Syllabus";

      case "practice":
        return "Practice & Quizzes";

      case "build":
        return "Build";

      case "grow":
        return "Grow";

      case "students":
        return "Students";

      default:
        return "Dashboard";
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="admin-dashboard">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="admin-sidebar">
        <div className="admin-logo">
          EDUVANTA
          <span>ADMIN PANEL</span>
        </div>

        <nav className="admin-nav">
          <button
            className={
              activeSection === "dashboard"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() =>
              handleSectionChange("dashboard")
            }
          >
            📊
            <span>Dashboard</span>
          </button>

          <button
            className={
              activeSection === "courses" ||
              activeSection === "course-management" ||
              activeSection === "module-management" ||
              activeSection === "topic-management" ||
              activeSection === "lesson-management"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() =>
              handleSectionChange("courses")
            }
          >
            📚
            <span>Courses</span>
          </button>

          <button
            className={
              activeSection === "syllabus"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() =>
              handleSectionChange("syllabus")
            }
          >
            🎓
            <span>College Syllabus</span>
          </button>

          <button
            className={
              activeSection === "practice"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() =>
              handleSectionChange("practice")
            }
          >
            📝
            <span>Practice & Quizzes</span>
          </button>

          <button
            className={
              activeSection === "build"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() =>
              handleSectionChange("build")
            }
          >
            🛠️
            <span>Build</span>
          </button>

          <button
            className={
              activeSection === "grow"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() =>
              handleSectionChange("grow")
            }
          >
            🌱
            <span>Grow</span>
          </button>

          <button
            className={
              activeSection === "students"
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
            onClick={() =>
              handleSectionChange("students")
            }
          >
            👥
            <span>Students</span>
          </button>
        </nav>

        <div className="admin-sidebar-bottom">
          <button className="admin-nav-item">
            ⚙️
            <span>Settings</span>
          </button>

          <button
            className="admin-logout"
            onClick={onLogout}
          >
            🚪
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="admin-main">

        <header className="admin-topbar">
          <div>
            <h1>{getPageTitle()}</h1>

            <p>
              Welcome back to EDUVANTA Admin Panel.
            </p>
          </div>

          <div className="admin-user">
            <div className="admin-avatar">
              A
            </div>

            <div>
              <strong>
                {user?.user_metadata?.full_name ||
                  "EDUVANTA Admin"}
              </strong>

              <span>Administrator</span>
            </div>
          </div>
        </header>

        <section className="admin-content">
          {renderContent()}
        </section>
      </main>

      {/* =====================================================
          MODALS
      ===================================================== */}

      {renderCourseModal()}
      {renderSectionModal()}
      {renderModuleModal()}
      {renderTopicModal()}
      {renderLessonModal()}
    </div>
  );
}

export default AdminDashboard;