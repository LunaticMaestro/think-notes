import { MyNER} from "./ner"


export let nerObj: MyNER = new MyNER()


export async function initializeNerSampler(): Promise<void> {
  if (MyNER.pipelineReady && MyNER.nerPipeline) {
    return;
  }

  await nerObj.initializeNerSampler();
}