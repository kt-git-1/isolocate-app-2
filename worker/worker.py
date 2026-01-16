import os
import time

import psycopg
from psycopg.rows import dict_row

from db import mark_failed, pick_next_job, requeue_stale_runs
from runner import process_job

POLL_INTERVAL_SEC = float(os.getenv("POLL_INTERVAL_SEC", "1.5"))
ANALYSIS_DELAY_SEC = float(os.getenv("ANALYSIS_DELAY_SEC", "180"))
STALE_RUNNING_SEC = int(os.getenv("STALE_RUNNING_SEC", "300"))

def main():
    database_url = os.environ["DATABASE_URL"]
    print("[worker_py] starting, DATABASE_URL set")

    while True:
        try:
            # 1) ジョブを原子的にピック（トランザクション）
            with psycopg.connect(database_url, row_factory=dict_row) as conn:
                stale_count = requeue_stale_runs(conn, STALE_RUNNING_SEC)
                if stale_count:
                    print(f"[worker_py] requeued stale runs: {stale_count}")
                job = pick_next_job(conn)

            if not job:
                time.sleep(POLL_INTERVAL_SEC)
                continue

            job_id = job["id"]
            print(f"[worker_py] picked job: {job_id}")

            try:
                process_job(database_url, job, ANALYSIS_DELAY_SEC)
                print(f"[worker_py] succeeded job: {job_id}")

            except Exception as e:
                # 3) 失敗で更新
                with psycopg.connect(database_url, row_factory=dict_row) as conn:
                    mark_failed(conn, job_id, e)
                print(f"[worker_py] failed job: {job_id}: {e}")
        except psycopg.OperationalError as e:
            print(f"[worker_py] connection error, retrying: {e}")
            time.sleep(POLL_INTERVAL_SEC)

if __name__ == "__main__":
    main()