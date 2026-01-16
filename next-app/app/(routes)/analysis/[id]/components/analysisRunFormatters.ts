import {
  CLASSIFIER_LABELS,
  GROUP_COUNT_LABELS,
  POP_LABELS,
  STEPWISE_LABELS,
} from "@/features/analysisRuns/domain/labels";

export function prettyJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("ja-JP");
}

export function formatValue(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

export function toPopLabel(value: string | undefined) {
  if (!value) return "—";
  return POP_LABELS[value as keyof typeof POP_LABELS] ?? value;
}

export function toClassifierLabel(value: string | undefined) {
  if (!value) return "—";
  return CLASSIFIER_LABELS[value as keyof typeof CLASSIFIER_LABELS] ?? value;
}

export function toStepwiseLabel(value: string | undefined) {
  if (!value) return "—";
  return STEPWISE_LABELS[value as keyof typeof STEPWISE_LABELS] ?? value;
}

export function toGroupCountLabel(value: string | undefined) {
  if (!value) return "—";
  return GROUP_COUNT_LABELS[value as keyof typeof GROUP_COUNT_LABELS] ?? value;
}
