import { getNlp } from "./init";

import type {
  SamplerKeyword,
} from "./types";

export function sampleURL(
  text: string,
): SamplerKeyword[] {
  const nlp = getNlp();
  const doc = nlp.readDoc(text);

  // Log an array of all identified entity texts and their types
  // console.log(doc.entities().out(nlp.its.detail));

  return doc
    .entities()
    .out(nlp.its.detail)
    .filter(
      (entity) => entity.type === "URL",
    )
    .map((entity): SamplerKeyword => {
      let domain = entity.value;
      
      try {
        // Enforce protocol prefix so the native URL parser handles domain strings correctly
        const fullUrl = entity.value.startsWith('http') 
          ? entity.value 
          : `https://${entity.value}`;
          
        domain = new URL(fullUrl).hostname;
      } catch (e) {
        // Fallback to original matched value if URL constructor fails
        console.error(e)
      }

      return {
        keyword: domain,
        type: "URL", // Matches the literal type requirement
      };
    });
}
