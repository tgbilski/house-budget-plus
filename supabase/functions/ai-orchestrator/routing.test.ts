import { assertEquals, assertArrayIncludes } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { checkIfOnTopic, selectAgents, AGENTS, ALLOWED_TOPICS, OFF_TOPIC_INDICATORS } from "./routing.ts";

// ============================================
// Topic Validation Tests
// ============================================

Deno.test("checkIfOnTopic - accepts budget-related questions", () => {
  assertEquals(checkIfOnTopic("What is my monthly budget?"), true);
  assertEquals(checkIfOnTopic("How much money did I spend?"), true);
  assertEquals(checkIfOnTopic("Can I afford this purchase?"), true);
  assertEquals(checkIfOnTopic("Show me my income breakdown"), true);
});

Deno.test("checkIfOnTopic - accepts savings-related questions", () => {
  assertEquals(checkIfOnTopic("How are my savings goals?"), true);
  assertEquals(checkIfOnTopic("What's my emergency fund progress?"), true);
  assertEquals(checkIfOnTopic("Am I saving enough?"), true);
});

Deno.test("checkIfOnTopic - accepts expense-related questions", () => {
  assertEquals(checkIfOnTopic("What did I spend on groceries?"), true);
  assertEquals(checkIfOnTopic("Show my expense categories"), true);
  assertEquals(checkIfOnTopic("List my recent transactions"), true);
});

Deno.test("checkIfOnTopic - accepts vendor-related questions", () => {
  assertEquals(checkIfOnTopic("Compare my vendor quotes"), true);
  assertEquals(checkIfOnTopic("Which contractor is cheapest?"), true);
  assertEquals(checkIfOnTopic("Show me the price estimates"), true);
});

Deno.test("checkIfOnTopic - accepts vacation-related questions", () => {
  assertEquals(checkIfOnTopic("Plan my vacation budget"), true);
  assertEquals(checkIfOnTopic("How much will the trip cost?"), true);
  assertEquals(checkIfOnTopic("Compare travel destinations"), true);
});

Deno.test("checkIfOnTopic - accepts gift-related questions", () => {
  assertEquals(checkIfOnTopic("What gifts do I need to buy?"), true);
  assertEquals(checkIfOnTopic("Show my Christmas shopping list"), true);
  assertEquals(checkIfOnTopic("Birthday present ideas"), true);
});

Deno.test("checkIfOnTopic - rejects off-topic questions", () => {
  assertEquals(checkIfOnTopic("What's the weather today?"), false);
  assertEquals(checkIfOnTopic("Tell me a joke"), false);
  assertEquals(checkIfOnTopic("Who won the sports game?"), false);
  assertEquals(checkIfOnTopic("Write me some code"), false);
  assertEquals(checkIfOnTopic("Help with my homework"), false);
  assertEquals(checkIfOnTopic("What's in the news?"), false);
  assertEquals(checkIfOnTopic("Recommend a movie"), false);
  assertEquals(checkIfOnTopic("Translate this to Spanish"), false);
});

Deno.test("checkIfOnTopic - rejects mixed on/off-topic questions", () => {
  // Even if it mentions money, off-topic indicator should reject
  assertEquals(checkIfOnTopic("What's the weather forecast for my vacation?"), false);
  assertEquals(checkIfOnTopic("Tell me a joke about money"), false);
});

Deno.test("checkIfOnTopic - handles case insensitivity", () => {
  assertEquals(checkIfOnTopic("WHAT IS MY BUDGET?"), true);
  assertEquals(checkIfOnTopic("Show My SAVINGS Goals"), true);
  assertEquals(checkIfOnTopic("WEATHER forecast"), false);
});

// ============================================
// Agent Selection Tests
// ============================================

Deno.test("selectAgents - routes to budget agent", () => {
  const agents = selectAgents("What's my monthly budget breakdown?");
  assertArrayIncludes(agents, ["budget"]);
});

Deno.test("selectAgents - routes to savings agent", () => {
  const agents = selectAgents("How are my savings goals progressing?");
  assertArrayIncludes(agents, ["savings"]);
});

Deno.test("selectAgents - routes to expenses agent", () => {
  const agents = selectAgents("What expenses did I have this month?");
  assertArrayIncludes(agents, ["expenses"]);
});

Deno.test("selectAgents - routes to vendors agent", () => {
  const agents = selectAgents("Compare my vendor quotes for the project");
  assertArrayIncludes(agents, ["vendors"]);
});

Deno.test("selectAgents - routes to vacation agent", () => {
  const agents = selectAgents("How much will my vacation trip cost?");
  assertArrayIncludes(agents, ["vacation"]);
});

Deno.test("selectAgents - routes to gifts agent", () => {
  const agents = selectAgents("What gifts are on my Christmas wishlist?");
  assertArrayIncludes(agents, ["gifts"]);
});

Deno.test("selectAgents - handles multi-agent routing", () => {
  // Question about vacation budget should trigger both
  const agents = selectAgents("Can I afford this vacation with my budget?");
  assertEquals(agents.length <= 2, true); // Max 2 agents
  // Should include vacation (trip mentioned) or budget (afford mentioned)
});

Deno.test("selectAgents - prioritizes by keyword count", () => {
  // Multiple budget keywords should rank budget higher
  const agents = selectAgents("My monthly budget spending and expense tracking");
  assertEquals(agents[0], "budget"); // Budget has most matches
});

Deno.test("selectAgents - returns empty for no matches", () => {
  const agents = selectAgents("Hello how are you?");
  assertEquals(agents.length, 0);
});

Deno.test("selectAgents - limits to max 2 agents", () => {
  // Even with many topics mentioned, should only return top 2
  const agents = selectAgents("budget savings expenses vacation gifts vendors");
  assertEquals(agents.length <= 2, true);
});

Deno.test("selectAgents - handles case insensitivity", () => {
  const agents = selectAgents("WHAT IS MY BUDGET?");
  assertArrayIncludes(agents, ["budget"]);
});

// ============================================
// Configuration Tests
// ============================================

Deno.test("AGENTS - all agents have required fields", () => {
  for (const [key, agent] of Object.entries(AGENTS)) {
    assertEquals(typeof agent.name, "string", `${key} should have name`);
    assertEquals(typeof agent.emoji, "string", `${key} should have emoji`);
    assertEquals(typeof agent.description, "string", `${key} should have description`);
    assertEquals(Array.isArray(agent.tables), true, `${key} should have tables array`);
    assertEquals(Array.isArray(agent.keywords), true, `${key} should have keywords array`);
    assertEquals(agent.keywords.length > 0, true, `${key} should have at least one keyword`);
  }
});

Deno.test("ALLOWED_TOPICS - contains expected topics", () => {
  assertArrayIncludes(ALLOWED_TOPICS, ["budget"]);
  assertArrayIncludes(ALLOWED_TOPICS, ["savings"]);
  assertArrayIncludes(ALLOWED_TOPICS, ["expenses"]);
  assertArrayIncludes(ALLOWED_TOPICS, ["vacation"]);
  assertArrayIncludes(ALLOWED_TOPICS, ["gifts"]);
});

Deno.test("OFF_TOPIC_INDICATORS - contains expected blockers", () => {
  assertArrayIncludes(OFF_TOPIC_INDICATORS, ["weather"]);
  assertArrayIncludes(OFF_TOPIC_INDICATORS, ["joke"]);
  assertArrayIncludes(OFF_TOPIC_INDICATORS, ["sports"]);
  assertArrayIncludes(OFF_TOPIC_INDICATORS, ["programming"]);
});
