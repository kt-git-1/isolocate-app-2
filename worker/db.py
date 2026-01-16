import json

PICK_SQL = """
WITH picked AS (
  SELECT id
  FROM "AnalysisRun"
  WHERE status = 'queued'
  ORDER BY "createdAt" ASC
  FOR UPDATE SKIP LOCKED
  LIMIT 1
)
UPDATE "AnalysisRun" ar
SET status = 'running', "startedAt" = NOW(), "updatedAt" = NOW()
FROM picked
WHERE ar.id = picked.id
RETURNING ar.*;
"""

REFERENCE_DATASET_SQL = """
SELECT id, name, version, "storageUri"
FROM "ReferenceDataset"
WHERE id = %s
"""

REQUEUE_STALE_SQL = """
UPDATE "AnalysisRun"
SET status='queued',
    "startedAt"=NULL,
    "finishedAt"=NULL,
    "errorMessage"=NULL,
    "updatedAt"=NOW()
WHERE status='running'
  AND COALESCE("startedAt", "updatedAt") < NOW() - (%s * interval '1 second')
"""


def pick_next_job(conn):
    with conn.cursor() as cur:
        cur.execute(PICK_SQL)
        job = cur.fetchone()
    conn.commit()
    return job


def fetch_reference_dataset(conn, reference_dataset_id: str):
    with conn.cursor() as cur:
        cur.execute(REFERENCE_DATASET_SQL, (reference_dataset_id,))
        return cur.fetchone()


def requeue_stale_runs(conn, stale_seconds: int) -> int:
    with conn.cursor() as cur:
        cur.execute(REQUEUE_STALE_SQL, (stale_seconds,))
        count = cur.rowcount
    conn.commit()
    return count


def mark_succeeded(conn, job_id: str, result: dict):
    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE "AnalysisRun"
            SET status='succeeded',
                "resultJson"=%s,
                "errorMessage"=NULL,
                "finishedAt"=NOW(),
                "updatedAt"=NOW()
            WHERE id=%s
            """,
            (json.dumps(result), job_id),
        )
    conn.commit()


def mark_failed(conn, job_id: str, error: Exception):
    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE "AnalysisRun"
            SET status='failed',
                "errorMessage"=%s,
                "finishedAt"=NOW(),
                "updatedAt"=NOW()
            WHERE id=%s
            """,
            (str(error), job_id),
        )
    conn.commit()
