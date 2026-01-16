// 集団定義
export type PopGroup = "Asian" | "Japan" | "NEA" | "SEA" | "UBC" | "US";

// 分類器
export type Classifier = "lda" | "logit" | "rf";

// 群数
export type GroupCount = "two" | "more2";

// ステップワイズ法
export type Stepwise = "none" | "forward" | "backward";

// 比較パラメータ入力
export const REFERENCE_SAMPLES = ["png-modern-2026-01"] as const;
export type ReferenceSampleId = (typeof REFERENCE_SAMPLES)[number];

export type ComparisonParameters = {
  referenceSample: ReferenceSampleId;
  numberOfGroups: GroupCount;
  classifier: Classifier;
  stepwise: Stepwise;
  populations: PopGroup[];
};

// メタデータ入力
export type MetadataFieldsProps = {
  caseNumber: string;
  analystName: string;
  elementSampled: string;
};

// 同位体入力
export type IsotopeInputs = {
  collagen: { col13c: number; col15n: number; col34s: number };
  apatite: { a13c: number; a18o: number };
  enamel: { e13c: number; e18o: number };
};

// 同位体入力（フォーム用の文字列）
export type IsotopeInputsForm = {
  collagen: { col13c: string; col15n: string; col34s: string };
  apatite: { a13c: string; a18o: string };
  enamel: { e13c: string; e18o: string };
};

// 分析入力
export type AnalysisInputs = {
  metadata: MetadataFieldsProps;
  comparison: ComparisonParameters;
  isotopeInputs: IsotopeInputs;
};

// 分析入力（フォーム用）
export type AnalysisInputsForm = {
  metadata: MetadataFieldsProps;
  comparison: ComparisonParameters;
  isotopeInputs: IsotopeInputsForm;
};

// 分析結果
export type AnalysisResult = {
    group: PopGroup; // 所属集団
    posterior: number; // 事後確率 (0..1)
    chi2Typicality: number; // カイ二乗適合度 (0..1)
    distance: number; // 距離 (>=0)
};
