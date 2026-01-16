import csv
import math
import random
import re
from pathlib import Path

FEATURES = [
    ("col13c", "d13C"),
    ("col15n", "d15N"),
    ("col34s", "d34S"),
]

DATASET_CACHE = {}


def build_reference_paths(
    storage_uri: str | None,
    name: str | None,
    version: str | None,
    reference_sample: str | None,
) -> list[Path]:
    candidates: list[Path] = []
    if storage_uri:
        candidates.append(Path(storage_uri))
        if storage_uri.startswith("/reference_datasets/"):
            candidates.append(Path("/data/reference") / storage_uri.removeprefix("/reference_datasets/"))
        if storage_uri.startswith("/reference-datasets/"):
            candidates.append(Path("/data/reference") / storage_uri.removeprefix("/reference-datasets/"))

    if name and version:
        candidates.append(Path("/data/reference") / name / version / "dataset.csv")

    if reference_sample:
        match = re.match(r"^(.*)-(\d{4}-\d{2})$", reference_sample)
        if match:
            sample_name, sample_version = match.group(1), match.group(2)
            candidates.append(Path("/data/reference") / sample_name / sample_version / "dataset.csv")

    return candidates


def load_reference_dataset(path: Path) -> list[dict]:
    cache_key = str(path)
    if cache_key in DATASET_CACHE:
        return DATASET_CACHE[cache_key]

    rows: list[dict] = []
    with path.open("r", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)

    DATASET_CACHE[cache_key] = rows
    return rows


def compute_group_stats(rows: list[dict]) -> dict:
    grouped: dict[str, dict[str, list[float]]] = {}
    for row in rows:
        group_value = str(row.get("GRP", "")).strip()
        if not group_value:
            continue
        grouped.setdefault(group_value, {name: [] for _, name in FEATURES})
        for _, feature_name in FEATURES:
            value = row.get(feature_name)
            if value is None or str(value).strip() == "":
                continue
            grouped[group_value][feature_name].append(float(value))

    stats: dict[str, dict[str, dict[str, float]]] = {}
    for group_value, features in grouped.items():
        stats[group_value] = {}
        for feature_name, values in features.items():
            if not values:
                continue
            mean = sum(values) / len(values)
            variance = sum((v - mean) ** 2 for v in values) / len(values)
            std = math.sqrt(variance) or 1e-6
            stats[group_value][feature_name] = {
                "mean": mean,
                "std": std,
            }

    return stats


def map_group_labels(group_values: list[str], populations: list[str] | None) -> dict[str, str]:
    if populations:
        labels = populations
    else:
        labels = []

    mapping: dict[str, str] = {}
    for idx, group_value in enumerate(group_values):
        if idx < len(labels):
            mapping[group_value] = labels[idx]
        else:
            mapping[group_value] = f"Group-{group_value}"
    return mapping


# ダミーロジック
# TODO: ここを実装する
def run_analysis(
    input_json: dict,
    reference_rows: list[dict],
    algorithm_version: str | None,
    model_version: str | None,
) -> dict:
    missing_fields: list[str] = []

    isotope_inputs = input_json.get("isotopeInputs", {})
    collagen = isotope_inputs.get("collagen", {})

    feature_values: dict[str, float] = {}
    for input_key, dataset_key in FEATURES:
        value = collagen.get(input_key)
        if value is None:
            missing_fields.append(f"isotopeInputs.collagen.{input_key}")
            continue
        feature_values[dataset_key] = float(value)

    stats = compute_group_stats(reference_rows)
    group_values = sorted(stats.keys(), key=lambda v: float(v) if v.replace(".", "", 1).isdigit() else v)
    if not group_values:
        raise ValueError("Reference dataset has no group labels")

    populations = input_json.get("comparison", {}).get("populations")
    label_map = map_group_labels(group_values, populations)

    scores = [random.random() for _ in group_values]
    total = sum(scores) or 1.0
    probabilities = [score / total for score in scores]
    best_idx = max(range(len(probabilities)), key=lambda i: probabilities[i])

    predicted_group_value = group_values[best_idx]
    predicted_group = label_map[predicted_group_value]

    qc = {"isValidForRun": len(missing_fields) == 0}
    if missing_fields:
        qc["missingFields"] = missing_fields

    return {
        "summary": {
            "predictedGroup": predicted_group,
            "predictedLabel": predicted_group_value,
            "probability": probabilities[best_idx],
            "decision": "uncertain",
        },
        "scores": [
            {
                "group": label_map[group_value],
                "label": group_value,
                "score": probability,
            }
            for group_value, probability in zip(group_values, probabilities)
        ],
        "model": {
            "classificationMethod": "dummy",
            "stepwise": input_json.get("comparison", {}).get("stepwise"),
            "compareGroupCount": input_json.get("comparison", {}).get("numberOfGroups"),
            "algorithmVersion": algorithm_version,
            "modelVersion": model_version,
        },
        "featuresUsed": list(feature_values.keys()),
        "qc": qc,
    }
