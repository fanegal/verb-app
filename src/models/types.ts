export type Verb = {
  id: number;
  spanish: string;
  english: string;
}

export interface Sentence {
  id: number;
  spanish: string;
  english: string;
}

export type Score = {
  player: string;
  score: number;
  date: string;
}

export type Challenge = {
  id: number;
  sentence: string;    // Ejemplo: "Yesterday I ___ to the park."
  options: string[];   // ["go", "went", "going"]
  correct: string;     // "went"
  spanish: string;     // "Ayer fui al parque."
}