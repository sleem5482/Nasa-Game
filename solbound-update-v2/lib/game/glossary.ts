import nasaData from "@/data/nasa_archived_data.json";

export const GLOSSARY: Record<string, string> = Object.fromEntries(
  nasaData.glossarySeed.map((item) => [item.term.toLowerCase(), item.definition]),
);

export function getGlossaryDefinition(term: string): string | undefined {
  return GLOSSARY[term.toLowerCase()];
}
