import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  useHostTheme,
} from "cursor/canvas";

const Analysis = () => {
  const theme = useHostTheme();

  return (
    <Stack gap={24} style={{ padding: 24, maxWidth: 960 }}>
      <Stack gap={8}>
        <H1>Mi Salud Integral — Análisis del proyecto</H1>
        <Text tone="secondary">
          App web Flask de autocuidado personal (MVP / primera versión). Datos
          sensibles de salud; pensada para uso local o desarrollo, no producción.
        </Text>
        <Row gap={8} style={{ flexWrap: "wrap" }}>
          <Pill tone="success">Flask 3</Pill>
          <Pill>SQLAlchemy</Pill>
          <Pill>Flask-Login</Pill>
          <Pill>CSRF (Flask-WTF)</Pill>
          <Pill tone="warning">SQLite / MySQL</Pill>
        </Row>
      </Stack>

      <Grid columns={4} gap={12}>
        <Stat value="~400" label="Líneas en app.py" />
        <Stat value="4" label="Modelos de datos" />
        <Stat value="6" label="Rutas HTTP" />
        <Stat value="6" label="Plantillas HTML" />
      </Grid>

      <Callout tone="info" title="Qué es">
        Registro e inicio de sesión, perfil de salud por usuario, y diario de
        alimentación (alimentos estructurados), agua, actividad, sueño, ánimo y
        síntomas. El panel muestra los últimos 7 registros. Evolución gráfica y
        asistente inteligente están marcados como “próximamente”.
      </Callout>

      <Stack gap={12}>
        <H2>Arquitectura actual</H2>
        <Text tone="secondary">
          Monolito en un solo archivo: modelos, rutas y arranque juntos. UI con
          Jinja2 + CSS estático. Persistencia SQLite por defecto (instance/) o
          MySQL vía DATABASE_URL.
        </Text>
        <Table
          headers={["Capa", "Implementación", "Estado"]}
          rows={[
            [
              "Presentación",
              "templates/ + static/style.css",
              "Funcional, UI simple",
            ],
            [
              "Aplicación",
              "app.py (rutas + validación)",
              "Todo concentrado",
            ],
            [
              "Dominio / datos",
              "User, HealthProfile, DailyLog, FoodItem",
              "Esquema en transición",
            ],
            [
              "Seguridad",
              "Hash de contraseña, CSRF, cookies HttpOnly",
              "Base OK; falta hardening",
            ],
            [
              "Ops / scripts",
              "crear_tabla_*, migrar_*, restablecer_password",
              "Ad-hoc, sin migraciones formales",
            ],
          ]}
        />
      </Stack>

      <Stack gap={12}>
        <H2>Modelo de datos</H2>
        <Grid columns={2} gap={12}>
          <Card>
            <CardHeader>
              <H3>User</H3>
            </CardHeader>
            <CardBody>
              <Text>
                name, email (único), password_hash, created_at. Relación 1:1 con
                HealthProfile y 1:N con DailyLog.
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <H3>HealthProfile</H3>
            </CardHeader>
            <CardBody>
              <Text>
                birth_date, objetivos, patologías, síntomas, medicamentos,
                alergias. Datos clínicos sensibles en texto libre.
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <H3>DailyLog</H3>
            </CardHeader>
            <CardBody>
              <Text>
                Fecha, agua, actividad, sueño, ánimo, síntomas. Aún conserva
                campos de texto legacy (breakfast, lunch, snack, dinner, snacks,
                meals) además del nuevo FoodItem.
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <H3>FoodItem</H3>
            </CardHeader>
            <CardBody>
              <Text>
                Por comida: meal_type, food_name, quantity, unit. Agregado
                reciente; el dashboard prioriza FoodItem y cae al texto viejo si
                no hay ítems.
              </Text>
            </CardBody>
          </Card>
        </Grid>
      </Stack>

      <Stack gap={12}>
        <H2>Mapa de rutas</H2>
        <Table
          headers={["Ruta", "Auth", "Función"]}
          rows={[
            ["/", "—", "Redirige a dashboard o login"],
            ["/registro", "Pública", "Alta de usuario + perfil vacío"],
            ["/ingresar", "Pública", "Login"],
            ["/salir", "POST + login", "Logout"],
            ["/inicio", "Login", "Dashboard (últimos 7 días)"],
            ["/mi-perfil", "Login", "CRUD perfil de salud"],
            ["/registro-diario", "Login", "Alta de diario + alimentos"],
          ]}
        />
      </Stack>

      <Stack gap={12}>
        <H2>Fortalezas</H2>
        <Stack gap={8}>
          <Text>
            Alcance claro de MVP: auth + perfil + registro diario usable.
          </Text>
          <Text>
            Buenas prácticas básicas: CSRF, hash de contraseñas, cookies
            HttpOnly/SameSite, validación de rangos (agua/sueño/unidades).
          </Text>
          <Text>
            README honesto: advierte que no está lista para internet ni datos
            médicos reales de terceros.
          </Text>
          <Text>
            UX en español, tono de autocuidado; disclaimer de no diagnóstico.
          </Text>
        </Stack>
      </Stack>

      <Stack gap={12}>
        <H2>Riesgos y deuda técnica</H2>
        <Table
          headers={["Prioridad", "Hallazgo", "Impacto"]}
          rows={[
            [
              "Alta",
              "SECRET_KEY por defecto si no hay .env",
              "Sesiones falsificables en despliegue real",
            ],
            [
              "Alta",
              "Datos de salud sin cifrado ni auditoría",
              "Riesgo de privacidad / cumplimiento",
            ],
            [
              "Media",
              "print de depuración en dashboard + N consultas FoodItem",
              "Ruido en logs y peor rendimiento",
            ],
            [
              "Media",
              "Esquema dual (texto + FoodItem) sin migración limpia",
              "Confusión y datos duplicados",
            ],
            [
              "Media",
              "Sin edición/borrado ni unicidad user+fecha",
              "Registros duplicados del mismo día",
            ],
            [
              "Baja",
              "Scripts crear_tabla ≈ migrar_alimentacion",
              "Mantenimiento confuso",
            ],
            [
              "Baja",
              "Sin relationship DailyLog→FoodItem",
              "Consultas manuales, menos idiomático",
            ],
          ]}
        />
      </Stack>

      <Divider />

      <Stack gap={12}>
        <H2>Madurez del producto</H2>
        <Grid columns={3} gap={12}>
          <Card>
            <CardHeader trailing={<Pill tone="success">Listo</Pill>}>
              <H3>Núcleo MVP</H3>
            </CardHeader>
            <CardBody>
              <Text>Auth, perfil, registro diario, listado reciente.</Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader trailing={<Pill tone="warning">Parcial</Pill>}>
              <H3>Alimentación</H3>
            </CardHeader>
            <CardBody>
              <Text>
                FoodItem funciona; campos legacy y scripts de tabla aún
                presentes.
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader trailing={<Pill>Pendiente</Pill>}>
              <H3>Roadmap UI</H3>
            </CardHeader>
            <CardBody>
              <Text>Evolución / gráficos y asistente inteligente.</Text>
            </CardBody>
          </Card>
        </Grid>
      </Stack>

      <Stack gap={12}>
        <H2>Próximos pasos sugeridos</H2>
        <Stack gap={6}>
          <Text>
            1. Separar modelos / rutas / formularios; quitar prints de debug.
          </Text>
          <Text>
            2. Relación ORM DailyLog↔FoodItem; migrar y retirar campos de texto
            de comidas.
          </Text>
          <Text>
            3. Unicidad (user_id, log_date) + editar/eliminar registros.
          </Text>
          <Text>
            4. Eager load de alimentos en el dashboard (evitar N+1).
          </Text>
          <Text>
            5. Antes de exponer en red: SECRET_KEY fuerte, HTTPS,
            COOKIE_SECURE, rate limit de login, backups.
          </Text>
          <Text>
            6. Producto: gráficos semanales (agua/sueño/ánimo) antes del
            asistente IA.
          </Text>
        </Stack>
      </Stack>

      <Text
        tone="tertiary"
        style={{ fontSize: 12, color: theme.text.tertiary }}
      >
        Fuente: código local del workspace · app.py, templates/, README.txt,
        requirements.txt
      </Text>
    </Stack>
  );
};

export default Analysis;
