import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";

type WinkNLP = ReturnType<typeof winkNLP>;

let nlp: WinkNLP | null = null;
let initializationPromise: Promise<void> | null = null;

export async function init(): Promise<void> {
  if (nlp) {
    return;
  }
  console.log("NLP: WinkNLP: Initializing")

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = Promise.resolve().then(() => {
    nlp = winkNLP(model);
    console.log("NLP: WinkNLP: Ready")

  });

  try {
    await initializationPromise;
  } catch (error) {
    nlp = null;
    throw error;
  } finally {
    initializationPromise = null;
  }
}

export function getNlp(): WinkNLP {
  if (!nlp) {
    throw new Error(
      "winkNLP has not been initialized.",
    );
  }

  return nlp;
}