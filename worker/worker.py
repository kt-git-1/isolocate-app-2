import os
import time
import json
from datetime import datetime, timezone

import psycopg
from psycopg.rows import dict_row

POLL_INTERVAL_SEC = float(os.getenv("POLL_INTERVAL_SEC", "1.5"))

def now_utc():
    return datetime.now(timezone.utc)

def run_analysis(input_json: dict) -> dict:
    # TODO: isoLocate の分析本体（ここに同位体判定ロジック等）
    # いまはダミー
    return {
        "score": 0.42,
        "predicted": "dummy_prediction",
        "inputEcho": input_json,
        "computedAt": now_utc().isoformat(),
    }

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
SET status = 'running', "updatedAt" = NOW()
FROM picked
WHERE ar.id = picked.id
RETURNING ar.*;
"""

def main():
    database_url = os.environ["DATABASE_URL"]
    print("[worker_py] starting, DATABASE_URL set")

    # autocommit=False でトランザクション管理（with conn: で commit/rollback）
    with psycopg.connect(database_url, row_factory=dict_row) as conn:
        while True:
            job = None

            # 1) ジョブを原子的にピック（トランザクション）
            with conn:
                with conn.cursor() as cur:
                    cur.execute(PICK_SQL)
                    job = cur.fetchone()

            if not job:
                time.sleep(POLL_INTERVAL_SEC)
                continue

            job_id = job["id"]
            print(f"[worker_py] picked job: {job_id}")

            try:
                input_json = job["inputJson"]
                # psycopg が JSON を dict にしてくれる場合もあるが、環境差があるので保険
                if isinstance(input_json, str):
                    input_json = json.loads(input_json)

                result = run_analysis(input_json)

                # 2) 成功で更新
                with conn:
                    with conn.cursor() as cur:
                        cur.execute(
                            """
                            UPDATE "AnalysisRun"
                            SET status='succeeded',
                                "resultJson"=%s,
                                "errorMessage"=NULL,
                                "updatedAt"=NOW()
                            WHERE id=%s
                            """,
                            (json.dumps(result), job_id),
                        )

                print(f"[worker_py] succeeded job: {job_id}")

            except Exception as e:
                # 3) 失敗で更新
                with conn:
                    with conn.cursor() as cur:
                        cur.execute(
                            """
                            UPDATE "AnalysisRun"
                            SET status='failed',
                                "errorMessage"=%s,
                                "updatedAt"=NOW()
                            WHERE id=%s
                            """,
                            (str(e), job_id),
                        )
                print(f"[worker_py] failed job: {job_id}: {e}")

if __name__ == "__main__":
    main()