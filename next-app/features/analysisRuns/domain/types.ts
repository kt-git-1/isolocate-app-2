import type { AnalysisRunStatus } from "./status";

// 集団定義
export type PopGroup = "Asian" | "Japan" | "NEA" | "SEA" | "UBC" | "US";

// 分類器
export type Classifier = "lda" | "logit" | "rf";

// 群数
export type GroupCount = "two" | "more2";

// ステップワイズ法
export type Stepwise = "none" | "forward" | "backward";

// 同位体入力
export type IsotopeInputs = {
    collagen: { col13c: number; col15n: number; col34s: number };
    apatite: { a13c: number; a18o: number };
    enamel: { e13c: number; e18o: number };
  };

// 分析入力
export type AnalysisInput = {
    caseNumber: string; // ケース番号
    analystName: string; // 分析者名
    elementSampled: string; // 分析対象元素

    referenceSample: "png-modern-v1"; // 参照サンプル
    classifier: Classifier;
    groupCount: GroupCount;
    stepwise: Stepwise;
    popGroup: PopGroup;

    isotopeInputs: IsotopeInputs;
};

// 分析結果
export type AnalysisResult = {
    group: PopGroup; // 所属集団
    posterior: number; // 事後確率 (0..1)
    chi2Typicality: number; // カイ二乗適合度 (0..1)
    distance: number; // 距離 (>=0)
};

// 分析実行エンティティ
export type AnalysisRunEntity = {
    id: string; // 分析実行ID
    status: AnalysisRunStatus; // ステータス
    input: AnalysisInput; // 分析入力
    result?: AnalysisResult; // 分析結果
    errorCode?: string; // エラーコード
    errorMessage?: string; // エラーメッセージ
    workerId?: string; // ワーカーID
    startedAt?: Date; // 開始時刻
    finishedAt?: Date; // 終了時刻
    createdAt: Date; // 作成時刻
    updatedAt: Date; // 更新時刻
};