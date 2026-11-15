import os
import sqlite3

paths = ["instance/mi_salud_integral.db", "mi_salud_integral.db"]
for path in paths:
    if not os.path.exists(path):
        continue
    print("DB:", path, "size", os.path.getsize(path))
    conn = sqlite3.connect(path)
    tables = conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    ).fetchall()
    print("tables", tables)
    for (table,) in tables:
        if table.startswith("sqlite_"):
            continue
        cols = conn.execute(f"PRAGMA table_info({table})").fetchall()
        count = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        print(f"  {table}: {count} rows, cols={[c[1] for c in cols]}")
        if count and count <= 20:
            rows = conn.execute(f"SELECT * FROM {table} LIMIT 5").fetchall()
            print("    sample:", rows)
    conn.close()
