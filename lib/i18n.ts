import en from "@/locales/en.json";
import uk from "@/locales/uk.json";
import cs from "@/locales/cs.json";
import type { Language } from "@/types/app";

const dictionaries = { en, uk, cs } as const;

export function translate(language: Language, key: string): string {
  const dictionary = dictionaries[language] as Record<string, string>;
  return dictionary[key] ?? (dictionaries.en as Record<string, string>)[key] ?? key;
}
