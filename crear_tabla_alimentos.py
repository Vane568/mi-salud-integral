
import sqlite3

conexion = sqlite3.connect("instance/mi_salud_integral.db")

try:
    cursor = conexion.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS food_item (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            daily_log_id INTEGER NOT NULL,
            meal_type VARCHAR(20) NOT NULL,
            food_name VARCHAR(150) NOT NULL,
            quantity NUMERIC(10, 2) NOT NULL,
            unit VARCHAR(30) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
            FOREIGN KEY (daily_log_id)
                REFERENCES daily_log(id)
        )
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS ix_food_item_daily_log_id
        ON food_item (daily_log_id)
    """)

    conexion.commit()
    print("Tabla food_item creada correctamente.")

except Exception as error:
    conexion.rollback()
    print("Error:", error)

finally:
    conexion.close()
