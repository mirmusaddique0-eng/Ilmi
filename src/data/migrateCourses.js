import { supabase } from "../lib/supabaseClient";
import coursesData from "./coursesData";
import courseContentData from "./courseContentData";

export async function migrateCourses() {
  console.log("🚀 Course migration started...");

  // =========================================
  // COURSE LOOP
  // =========================================

  for (const course of coursesData) {
    console.log(`📚 Adding course: ${course.title}`);

    // -----------------------------------------
    // INSERT COURSE
    // -----------------------------------------

    const { data: courseRow, error: courseError } = await supabase
      .from("courses")
      .insert({
        title: course.title,
        category: course.category,
        icon: course.icon,
        description: course.description,
        display_order: course.id,
        is_active: true,
      })
      .select()
      .single();

    if (courseError) {
      console.error("❌ Course error:", courseError);
      return;
    }

    const courseId = courseRow.id;

    console.log(
      `✅ Course created: ${course.title} | ID: ${courseId}`
    );

    // =========================================
    // CONTENT DATA
    // =========================================

    const contentCourse = courseContentData[course.title];

    if (!contentCourse) {
      console.warn(
        `⚠️ No content found for ${course.title}`
      );
      continue;
    }

    // =========================================
    // SECTION LOOP
    // =========================================

    for (
      let sectionIndex = 0;
      sectionIndex < contentCourse.sections.length;
      sectionIndex++
    ) {
      const section = contentCourse.sections[sectionIndex];

      const { data: sectionRow, error: sectionError } =
        await supabase
          .from("course_sections")
          .insert({
            course_id: courseId,
            title: section.title,
            display_order: sectionIndex + 1,
            is_active: true,
          })
          .select()
          .single();

      if (sectionError) {
        console.error(
          `❌ Section error: ${section.title}`,
          sectionError
        );
        return;
      }

      const sectionId = sectionRow.id;

      console.log(
        `  📂 Section: ${section.title}`
      );

      // =========================================
      // MODULE LOOP
      // =========================================

      for (
        let moduleIndex = 0;
        moduleIndex < section.modules.length;
        moduleIndex++
      ) {
        const module = section.modules[moduleIndex];

        const { data: moduleRow, error: moduleError } =
          await supabase
            .from("course_modules")
            .insert({
              section_id: sectionId,
              title: module.title,
              description: module.description || "",
              display_order: moduleIndex + 1,
              is_active: true,
            })
            .select()
            .single();

        if (moduleError) {
          console.error(
            `❌ Module error: ${module.title}`,
            moduleError
          );
          return;
        }

        const moduleId = moduleRow.id;

        console.log(
          `    📘 Module: ${module.title}`
        );

        // =========================================
        // TOPIC LOOP
        // =========================================

        for (
          let topicIndex = 0;
          topicIndex < module.topics.length;
          topicIndex++
        ) {
          const topic = module.topics[topicIndex];

          const { data: topicRow, error: topicError } =
            await supabase
              .from("course_topics")
              .insert({
                module_id: moduleId,
                title: topic.title,
                display_order: topicIndex + 1,
                is_active: true,
              })
              .select()
              .single();

          if (topicError) {
            console.error(
              `❌ Topic error: ${topic.title}`,
              topicError
            );
            return;
          }

          const topicId = topicRow.id;

          console.log(
            `      📖 Topic: ${topic.title}`
          );

          // =========================================
          // LESSON LOOP
          // =========================================

          for (
            let lessonIndex = 0;
            lessonIndex < topic.lessons.length;
            lessonIndex++
          ) {
            const lesson = topic.lessons[lessonIndex];

            const { error: lessonError } =
              await supabase
                .from("course_lessons")
                .insert({
                  topic_id: topicId,
                  title: lesson.title,
                  type: lesson.type || "text",
                  content: lesson.content || "",
                  display_order: lessonIndex + 1,
                  is_published: true,
                });

            if (lessonError) {
              console.error(
                `❌ Lesson error: ${lesson.title}`,
                lessonError
              );
              return;
            }

            console.log(
              `        📝 Lesson: ${lesson.title}`
            );
          }
        }
      }
    }
  }

  console.log("🎉 COURSE MIGRATION COMPLETED SUCCESSFULLY!");
}