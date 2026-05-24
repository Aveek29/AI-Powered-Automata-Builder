const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const TIMEOUT_MS = 30000;
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function askGroq(messages) {
  if (!API_KEY) {
    throw new Error(
      "Groq API key is missing. Please set VITE_GROQ_API_KEY in your .env file."
    );
  }

  if (API_KEY.length < 20) {
    throw new Error(
      "Groq API key looks invalid. Please check your VITE_GROQ_API_KEY in .env"
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.5,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error(
        "The request timed out after 30 seconds. Please check your internet connection and try again."
      );
    }
    if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
      throw new Error(
        "Could not reach the Groq API. Please check your internet connection."
      );
    }
    throw new Error(`Network error: ${err.message}`);
  }

  clearTimeout(timeoutId);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const errMsg = data?.error?.message || `HTTP ${res.status}`;

    if (res.status === 401) {
      throw new Error(
        "Invalid API key. Please check your VITE_GROQ_API_KEY in .env"
      );
    }
    if (res.status === 429) {
      throw new Error(
        "Rate limit exceeded. Please wait a moment before sending another request."
      );
    }
    if (res.status === 503) {
      throw new Error(
        "Groq service is temporarily unavailable. Please try again in a moment."
      );
    }

    throw new Error(`API error: ${errMsg}`);
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Received an invalid response from the API.");
  }

  if (!data?.choices?.[0]?.message?.content) {
    throw new Error(
      "The AI returned an empty response. Please try rephrasing your input."
    );
  }

  return data.choices[0].message.content;
}
