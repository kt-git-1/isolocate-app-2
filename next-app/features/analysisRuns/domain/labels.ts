import type { PopGroup, Classifier, Stepwise, GroupCount } from "./types";

export const POP_LABELS: Record<PopGroup, string> = {
  Asian: "アジア",
  Japan: "日本",
  NEA: "北米",
  SEA: "東南アジア",
  UBC: "北米",
  US: "米国",
};

export const CLASSIFIER_LABELS: Record<Classifier, string> = {
  lda: "線形判別分析",
  logit: "ロジスティック回帰",
  rf: "ランダムフォレスト",
};

export const STEPWISE_LABELS: Record<Stepwise, string> = {
  none: "なし",
  forward: "前進選択",
  backward: "後退選択",
};

export const GROUP_COUNT_LABELS: Record<GroupCount, string> = {
  two: "2グループ",
  more2: "3グループ以上",
};