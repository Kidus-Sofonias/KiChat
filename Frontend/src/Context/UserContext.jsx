import { createContext } from "react";

// Fix #18: Provide a safe default so components that accidentally consume this
// context outside the provider get an empty user + no-op setter instead of crashing.
export const userProvider = createContext([
  { user_name: "", user_id: "", avatar_seed: "aurora-bot" },
  () => {},
]);
