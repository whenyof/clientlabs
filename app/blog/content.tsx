import type React from "react"
import { ARTICLES_1_5 } from "./content-2"
import { ARTICLES_6_10 } from "./content-6-10"
import { ARTICLES_11_15 } from "./content-11-15"
import { ARTICLES_16_20 } from "./content-16-20"

export const ARTICLE_CONTENT: Record<string, React.ReactNode> = {
  ...ARTICLES_1_5,
  ...ARTICLES_6_10,
  ...ARTICLES_11_15,
  ...ARTICLES_16_20,
}
