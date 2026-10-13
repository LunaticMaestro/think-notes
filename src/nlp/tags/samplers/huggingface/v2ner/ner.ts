import {
  pipeline,
  type TokenClassificationPipeline,
} from "@huggingface/transformers";

import type {
    KeywordType
} from "@/types/nlp"

const MODEL = "Xenova/bert-base-NER";

export class MyNER {
  static instance: MyNER | null = null;
  static pipelineReady: boolean = false;
  static nerPipeline: TokenClassificationPipeline | null = null;
static pipelineState: string = "idle";

  isReady(): boolean {
    // TODO: Implement
    return MyNER.pipelineReady;
  }

  async initializeNerSampler(): Promise<void> {
    // Avoid initializing the pipeline more than once.
    if (MyNER.nerPipeline || MyNER.pipelineState === "initializing") {
      return;
    }

    MyNER.pipelineState = "initializing";
    console.log(`v2NER: STARTED`);

    MyNER.pipelineReady = false;

    MyNER.nerPipeline = null;

    pipeline("token-classification", MODEL, {
      progress_callback: (info) => {
        MyNER.pipelineState = info.status;

        if (info.status === "ready") {
          console.log(`v2NER: ${info.status}`);

          MyNER.pipelineReady = true;
        }
      },
    })
      .then((nerPipeline) => {
        MyNER.nerPipeline = nerPipeline;
        MyNER.pipelineReady = true;
        MyNER.pipelineState = "ready";
      })
      .catch((error: unknown) => {
        MyNER.pipelineReady = false;
        MyNER.pipelineState = "error";
        MyNER.nerPipeline = null;

        console.error("Failed to initialize NER pipeline:", error);
      });
  }

  getNerPipeline(): TokenClassificationPipeline | null {
    // TODO: Implement
    return MyNER.nerPipeline
  }
}

export class MyNERSampler extends MyNER {
  nerTag: string;
  type: KeywordType;
  threshold: number;

  constructor(
    nerTag: string,
    type: KeywordType = "generic",
    threshold: number = 0,
  ) {
    super();

    this.nerTag = nerTag;
    this.type = type;
    this.threshold = threshold;
  }

  async predict(text: string): Promise<NerPrediction[]> {

    const ner = this.getNerPipeline();

    if (!ner) {
      throw new Error("NER pipeline is not ready");
    }

    const rawResult = await ner(text);

    const entities = rawResult
      .filter(isNerEntity)
      .filter(
        (entity) =>
          entity.score >= this.threshold &&
          getTag(entity.entity) === this.nerTag,
      )
      .sort((a, b) => a.index - b.index);

    const results: NerPrediction[] = [];
    let current: NerEntity[] = [];

    for (const entity of entities) {
      const isContinuation = entity.word.startsWith("##");
      const previous = current[current.length - 1];

      const isSameSpan =
        previous !== undefined &&
        entity.index === previous.index + 1 &&
        isContinuation;

      if (!isSameSpan) {
        if (current.length > 0) {
          const keyword = reconstructWord(current);

          if (keyword) {
            results.push({
              keyword,
              type: this.type,
            });
          }
        }

        current = [entity];
        continue;
      }

      current.push(entity);
    }

    if (current.length > 0) {
      const keyword = reconstructWord(current);

      if (keyword) {
        results.push({
          keyword,
          type: this.type,
        });
      }
    }

    return results;
  }
}

type NerEntity = {
  entity: string;
  score: number;
  index: number;
  word: string;
};

type NerPrediction = {
  keyword: string;
  type: KeywordType;
};

function isNerEntity(value: unknown): value is NerEntity {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const entity = value as Record<string, unknown>;

  return (
    typeof entity.entity === "string" &&
    typeof entity.score === "number" &&
    typeof entity.index === "number" &&
    typeof entity.word === "string"
  );
}

function getTag(entity: string): string | null {
  const separator = entity.indexOf("-");

  if (separator === -1) {
    return null;
  }

  return entity.slice(separator + 1);
}

function reconstructWord(tokens: NerEntity[]): string {
  return tokens
    .map((token) =>
      token.word.startsWith("##") ? token.word.slice(2) : token.word,
    )
    .join("");
}
