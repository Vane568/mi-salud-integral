-- Mi Salud Integral — schema Postgres para Supabase
-- phpMyAdmin / MySQL quedan descartados. Toda la gestión de datos
-- se hace desde el dashboard de Supabase (Table Editor / SQL Editor).
--
-- Cómo aplicar: Dashboard Supabase → SQL Editor → New query → pegar → Run.

BEGIN;

CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(180) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ix_users_email ON users (email);

CREATE TABLE IF NOT EXISTS health_profile (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT NOT NULL UNIQUE
                            REFERENCES users (id) ON DELETE CASCADE,
    birth_date              DATE,
    health_goals            TEXT,
    diagnosed_conditions    TEXT,
    symptoms                TEXT,
    medications             TEXT,
    allergies               TEXT,
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_health_profile_user_id ON health_profile (user_id);

CREATE TABLE IF NOT EXISTS daily_log (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL
                    REFERENCES users (id) ON DELETE CASCADE,
    log_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    -- Campos legacy de texto (compatibilidad con datos migrados)
    meals           TEXT,
    breakfast       TEXT,
    lunch           TEXT,
    snack           TEXT,
    dinner          TEXT,
    snacks          TEXT,
    water_liters    NUMERIC(4, 2),
    activity        TEXT,
    sleep_hours     NUMERIC(4, 2),
    mood            VARCHAR(40),
    symptoms        TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_daily_log_user_id ON daily_log (user_id);
CREATE INDEX IF NOT EXISTS ix_daily_log_user_date ON daily_log (user_id, log_date DESC);

CREATE TABLE IF NOT EXISTS food_item (
    id              BIGSERIAL PRIMARY KEY,
    daily_log_id    BIGINT NOT NULL
                    REFERENCES daily_log (id) ON DELETE CASCADE,
    meal_type       VARCHAR(20) NOT NULL,
    food_name       VARCHAR(150) NOT NULL,
    quantity        NUMERIC(10, 2) NOT NULL,
    unit            VARCHAR(30) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_food_item_daily_log_id ON food_item (daily_log_id);

-- Trigger para mantener updated_at del perfil
CREATE OR REPLACE FUNCTION set_health_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_health_profile_updated_at ON health_profile;
CREATE TRIGGER trg_health_profile_updated_at
    BEFORE UPDATE ON health_profile
    FOR EACH ROW
    EXECUTE FUNCTION set_health_profile_updated_at();

COMMIT;
