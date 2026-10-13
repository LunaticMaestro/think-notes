export {
    initializeNerSampler,
}
from "./init"

export {
    nerObj
}
from "./init"


export {
    MyNERSampler
} from "./ner"

import {
    MyNERSampler
} from "./ner"

export const locationSampler = new MyNERSampler(
  "LOC",
  "location",
  0.1,
);

export const personSampler = new MyNERSampler(
  "PER",
  "person",
  0.1,
);