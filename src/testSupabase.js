import { supabase } from "./lib/supabaseClient";

console.log("🔥 testSupabase.js is running!");


// =====================================================
// TEST 1: YEARS
// =====================================================

const testYears = async () => {

  const { data, error } = await supabase
    .from("years")
    .select("*")
    .order("id");

  console.log("=================================");

  console.log("🔥 YEARS DATA:");

  console.log(data);

  console.log("🔥 YEARS ERROR:");

  console.log(error);

  console.log("=================================");

};


// =====================================================
// TEST 2: SEMESTERS
// =====================================================

const testSemesters = async () => {

  const { data, error } = await supabase
    .from("semesters")
    .select("*")
    .order("display_order");

  console.log("=================================");

  console.log("🔥 ALL SEMESTERS:");

  console.log(data);

  console.log("🔥 SEMESTER ERROR:");

  console.log(error);

  console.log("=================================");

};


// =====================================================
// TEST 3: SUBJECTS
// =====================================================

const testSubjects = async () => {

  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .order("display_order");

  console.log("=================================");

  console.log("🔥 ALL SUBJECTS:");

  console.log(data);

  console.log("🔥 SUBJECT ERROR:");

  console.log(error);

  console.log("=================================");

};


// =====================================================
// TEST 4: UNITS
// =====================================================

const testUnits = async () => {

  const { data, error } = await supabase
    .from("units")
    .select("*")
    .order("display_order");

  console.log("=================================");

  console.log("🔥 ALL UNITS:");

  console.log(data);

  console.log("🔥 UNIT ERROR:");

  console.log(error);

  console.log("=================================");

};


// =====================================================
// TEST 5: TOPICS
// =====================================================

const testTopics = async () => {

  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .order("display_order");

  console.log("=================================");

  console.log("🔥 ALL TOPICS:");

  console.log(data);

  console.log("🔥 TOPIC ERROR:");

  console.log(error);

  console.log("=================================");

};


// =====================================================
// TEST 6: TOPIC CONTENTS
// =====================================================

const testTopicContents = async () => {

  const { data, error } = await supabase
    .from("topic_contents")
    .select("*")
    .order("display_order");

  console.log("=================================");

  console.log("🔥 ALL TOPIC CONTENTS:");

  console.log(data);

  console.log("🔥 TOPIC CONTENT ERROR:");

  console.log(error);

  console.log("=================================");

};


// =====================================================
// RUN ALL TESTS
// =====================================================

const runTests = async () => {

  console.log("");

  console.log("🚀 STARTING SUPABASE DATABASE TEST...");

  console.log("");

  await testYears();

  await testSemesters();

  await testSubjects();

  await testUnits();

  await testTopics();

  await testTopicContents();

  console.log("");

  console.log("✅ SUPABASE DATABASE TEST COMPLETED");

  console.log("");

};

runTests();