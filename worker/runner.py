import json
import time

import psycopg
from psycopg.rows import dict_row

from analysis_logic import build_reference_paths, load_reference_dataset, run_analysis
from db import fetch_reference_dataset, mark_succeeded


def process_job(database_url: str, job: dict, analysis_delay_sec: float):
    job_id = job["id"]

    input_json = job["inputJson"]
    if isinstance(input_json, str):
        input_json = json.loads(input_json)

    reference_dataset_id = job["referenceDatasetId"]
    with psycopg.connect(database_url, row_factory=dict_row) as conn:
        reference_dataset = fetch_reference_dataset(conn, reference_dataset_id)
    if not reference_dataset:
        raise ValueError(f"ReferenceDataset not found: {reference_dataset_id}")

    reference_paths = build_reference_paths(
        reference_dataset.get("storageUri"),
        reference_dataset.get("name"),
        reference_dataset.get("version"),
        input_json.get("comparison", {}).get("referenceSample"),
    )
    dataset_path = next((p for p in reference_paths if p.exists()), None)
    if not dataset_path:
        raise ValueError(
            f"Reference dataset file not found. Tried: {[str(p) for p in reference_paths]}"
        )

    reference_rows = load_reference_dataset(dataset_path)
    result = run_analysis(
        input_json,
        reference_rows,
        job.get("algorithmVersion"),
        job.get("modelVersion"),
    )
    time.sleep(analysis_delay_sec)

    with psycopg.connect(database_url, row_factory=dict_row) as conn:
        mark_succeeded(conn, job_id, result)
