import { MyNER} from "./ner"


export let nerObj: MyNER = new MyNER()


export async function initializeNerSampler(): Promise<void> {
  if (nerObj.pipelineReady && nerObj.nerPipeline) {
    return;
  }

  await nerObj.initializeNerSampler();
}