import { askGroq } from "../../api/groq";

function extractJson(raw) {
  let cleaned = raw.trim();

  const tripleMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (tripleMatch) {
    cleaned = tripleMatch[1].trim();
  }

  const singleMatch = cleaned.match(/`([\s\S]*?)`/);
  if (singleMatch && !tripleMatch) {
    cleaned = singleMatch[1].trim();
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return null;
  }

  let depth = 0;
  let start = -1;
  let end = -1;
  for (let i = firstBrace; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        end = i + 1;
        break;
      }
    }
  }

  if (start === -1 || end === -1) return null;
  return cleaned.slice(start, end);
}

function normalizeTransitions(transitions) {
  if (!Array.isArray(transitions)) return transitions;
  return transitions.map((t) => {
    const normalized = {};
    if (t["from"] !== undefined) normalized.from = t["from"];
    else if (t.From !== undefined) normalized.from = t.From;
    else if (t.FROM !== undefined) normalized.from = t.FROM;

    if (t["input"] !== undefined) normalized.input = t["input"];
    else if (t.Input !== undefined) normalized.input = t.Input;
    else if (t.INPUT !== undefined) normalized.input = t.INPUT;
    else if (t.symbol !== undefined) normalized.input = t.symbol;
    else if (t.Symbol !== undefined) normalized.input = t.Symbol;

    if (t["to"] !== undefined) normalized.to = t["to"];
    else if (t.To !== undefined) normalized.to = t.To;
    else if (t.TO !== undefined) normalized.to = t.TO;

    return normalized;
  });
}

function validateAutomata(obj) {
  const errors = [];

  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    throw new Error("AI response was not a valid JSON object.");
  }

  if (!obj.states) {
    errors.push('Missing "states" field');
  } else if (!Array.isArray(obj.states)) {
    errors.push('"states" must be an array of strings');
  } else if (obj.states.length === 0) {
    errors.push('"states" array cannot be empty');
  }

  if (!obj.start) {
    errors.push('Missing "start" field');
  } else if (typeof obj.start !== "string") {
    errors.push('"start" must be a string');
  } else if (obj.states && !obj.states.includes(obj.start)) {
    errors.push(`Start state "${obj.start}" is not in the states list`);
  }

  if (!obj.transitions) {
    errors.push('Missing "transitions" field');
  } else if (!Array.isArray(obj.transitions)) {
    errors.push('"transitions" must be an array');
  } else {
    obj.transitions = normalizeTransitions(obj.transitions);

    const seenTransitions = new Set();
    for (let i = 0; i < obj.transitions.length; i++) {
      const t = obj.transitions[i];
      if (!t.from) errors.push(`Transition ${i} is missing "from"`);
      if (t.input === undefined || t.input === null || t.input === "")
        errors.push(`Transition ${i} is missing "input"`);
      if (!t.to) errors.push(`Transition ${i} is missing "to"`);
      if (t.from && obj.states && !obj.states.includes(t.from))
        errors.push(`Transition ${i}: state "${t.from}" not in states list`);
      if (t.to && obj.states && !obj.states.includes(t.to))
        errors.push(`Transition ${i}: state "${t.to}" not in states list`);

      if (t.from && t.input !== undefined && t.input !== null) {
        const key = `${t.from}::${t.input}`;
        if (seenTransitions.has(key)) {
          errors.push(`Transition ${i}: duplicate transition from "${t.from}" on "${t.input}" (DFAs must have at most one transition per input per state)`);
        }
        seenTransitions.add(key);
      }
    }
  }

  if (obj.accepting !== undefined) {
    if (!Array.isArray(obj.accepting)) {
      errors.push('"accepting" must be an array of strings');
    } else {
      for (const s of obj.accepting) {
        if (!obj.states.includes(s))
          errors.push(`Accepting state "${s}" is not in the states list`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `AI returned an incomplete automaton:\n- ${errors.join("\n- ")}\n\nPlease try rephrasing your description with clearer state names and transitions.`
    );
  }

  if (!obj.accepting || obj.accepting.length === 0) {
    obj.accepting = [obj.states[obj.states.length - 1]];
  }

  return obj;
}

export async function convertToAutomata(text) {
  let res;
  try {
    res = await askGroq([
      {
        role: "user",
        content: `Convert the following natural language into a deterministic finite automaton (DFA).

RULES:
- Output ONLY valid JSON. NO EXPLANATION. NO MARKDOWN.
- Must include "states" (array of strings), "start" (string), "transitions" (array), optionally "accepting" (array of strings)
- Each transition must have "from", "input", "to"
- If no accepting states are specified, assume the last state in "states" is accepting

TEXT:
${text}

Example output:
{"states":["A","B"],"start":"A","transitions":[{"from":"A","input":"0","to":"B"},{"from":"A","input":"1","to":"A"}],"accepting":["B"]}`,
      },
    ]);
  } catch (err) {
    throw new Error(`API request failed: ${err.message}`);
  }

  const jsonStr = extractJson(res);
  if (!jsonStr) {
    throw new Error(
      "AI response did not contain valid JSON. Try rephrasing your description."
    );
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(
      "AI response was not valid JSON. Try rephrasing your description."
    );
  }

  return validateAutomata(parsed);
}

export async function explainAutomata(originalDescription, automataJson) {
  const automataStr = JSON.stringify(automataJson, null, 2);

  const stateList = automataJson.states.join(", ");
  const startState = automataJson.start;
  const acceptStates = automataJson.accepting?.join(", ") || "none";
  const transitionCount = automataJson.transitions?.length || 0;

  const messages = [
    {
      role: "system",
      content: `You are a warm, supportive automata theory tutor for absolute beginners.

When given a DFA definition, write a Markdown-formatted explanation with these EXACT sections:

## Overview
1-2 simple sentences describing what this DFA does. Use an analogy (like a filter, a gate, a checkpoint). Mention what language/pattern it accepts. Be encouraging!

## State Dictionary
For each state, write a short bullet explaining what that state "remembers" about the input seen so far. Use plain language (e.g., "State A is the waiting room — we start here and haven't seen anything interesting yet.")

## Rules of Transition
For each transition rule, write a plain-English "If...then..." statement. Group them by source state for clarity.

## Practice Walkthrough
Pick a short example string (3-4 characters) and trace it step-by-step through the DFA. Show the current state before reading each symbol, what symbol is read, and which state we move to. End with whether the string is accepted or rejected.

## Quick Tip
One sentence with a helpful memory trick or rule of thumb.

Keep the tone friendly and encouraging. Use **bold** for state names and \`code\` for symbols.`,
    },
    {
      role: "user",
      content: `Here is the DFA to explain:

**Description:** ${originalDescription}

**States:** ${stateList}
**Start State:** ${startState}
**Accepting States:** ${acceptStates}
**Transitions count:** ${transitionCount}

**Full JSON:**
\`\`\`json
${automataStr}
\`\`\`

Please explain this automaton to a beginner student using the requested sections.`,
    },
  ];

  try {
    return await askGroq(messages);
  } catch (err) {
    throw new Error(`Failed to generate explanation: ${err.message}`);
  }
}
