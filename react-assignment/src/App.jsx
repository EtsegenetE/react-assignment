import React, { useReducer, useEffect, useCallback } from "react";
import SelectField from "./components/Select";
import listOfGenreOption from "./store/genre.json";
import listOfMoodOption from "./store/mood.json";

const initialState = {
  genre: "",
  mood: "",
  aiResponses: [],
  loading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_GENRE":
      return { ...state, genre: action.payload, mood: "" };

    case "SET_MOOD":
      return { ...state, mood: action.payload };

    case "SET_LEVEL":
      return { ...state, level: action.payload };

    case "FETCH_START":
      return { ...state, loading: true };

    case "FETCH_SUCCESS":
      return {
        ...state,
        loading: false,
        aiResponses: [...state.aiResponses, action.payload],
      };

    case "FETCH_ERROR":
      return { ...state, loading: false };

    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { genre, mood, level, aiResponses, loading } = state;

  const availableMoodBasedOnGenre = listOfMoodOption[genre];

  const fetchRecommendations = useCallback(async () => {
    if (!genre || !mood || !level) return;

    dispatch({ type: "FETCH_START" });

    try {
       const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Recommend 6 books for a ${level} ${genre} reader feeling ${mood}. Explain why.`,
                  },
                ],
              },
            ],
          }),
        },
      );

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      dispatch({ type: "FETCH_SUCCESS", payload: text });
    } catch (error) {
      console.error(error);
      dispatch({ type: "FETCH_ERROR" });
    }
  }, [genre, mood, level]);

  // useEffect(() => {}, []);

  return (
    <section style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1> AI Book Recommendation</h1>

      <SelectField
        placeholder="Please select a genre"
        id="genre"
        value={genre}
        onSelect={(value) => dispatch({ type: "SET_GENRE", payload: value })}
        options={listOfGenreOption}
      />

 
      <SelectField
        placeholder="Please select a mood"
        id="mood"
        value={mood}
        onSelect={(value) => dispatch({ type: "SET_MOOD", payload: value })}
        options={availableMoodBasedOnGenre || []}
      />

     
      <SelectField
        placeholder="Please select a level"
        id="level"
        value={level}
        onSelect={(value) => dispatch({ type: "SET_LEVEL", payload: value })}
        options={["Beginner", "Intermediate", "Expert"]}
      />

      <button onClick={fetchRecommendations} disabled={loading} style={{ marginTop: "10px" }}>
        {loading ? "Loading..." : "Get Recommendation"}
      </button>

      <br />
      <br />

      {aiResponses.map((recommend, index) => (
        <details key={index}>
          <summary>Recommendation {index + 1}</summary>
          <p>{recommend}</p>
        </details>
      ))}
    </section>
  );
}