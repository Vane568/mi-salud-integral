MI SALUD INTEGRAL - PRIMERA VERSION

Incluye:
- Registro e inicio/cierre de sesión.
- Perfiles de salud independientes por usuario.
- Registro diario de alimentación, agua, actividad, sueño, ánimo y síntomas.
- Panel con los últimos registros.
- Protección CSRF y contraseñas almacenadas mediante hash.

REQUISITOS
- Python 3.10 o superior.
- XAMPP/MySQL si se desea usar MySQL. La aplicación también puede iniciar con SQLite para una prueba rápida.

INSTALACION EN WINDOWS (VS CODE / TERMINAL)
1. Descomprimí la carpeta mi_salud_integral en una ubicación sencilla, por ejemplo C:\\MiSaludIntegral.
2. Abrí esa carpeta en VS Code.
3. En Terminal > New Terminal ejecutá:
   py -m venv .venv
   .venv\\Scripts\\activate
   py -m pip install -r requirements.txt
4. PRUEBA RÁPIDA SIN CONFIGURAR MYSQL:
   La app usa SQLite por defecto. Ejecutá:
   py app.py
   Abrí http://127.0.0.1:5000
5. PARA USAR MYSQL/XAMPP:
   - Iniciá MySQL desde el panel de XAMPP.
   - En phpMyAdmin creá una base llamada mi_salud_integral con cotejamiento utf8mb4_unicode_ci.
   - Copiá .env.example como .env y revisá DATABASE_URL.
   - La aplicación carga automáticamente las variables del archivo .env.
   - Ejecutá `py app.py`.

IMPORTANTE SOBRE SEGURIDAD
Esta es una base de desarrollo, no está lista para publicarse en Internet ni para guardar datos médicos reales de terceros. Antes de producción se requiere, como mínimo: HTTPS, SECRET_KEY segura, COOKIE_SECURE=1, protección contra intentos repetidos de acceso, política de privacidad y consentimiento, copias de seguridad cifradas, control de acceso probado, gestión segura de secretos, registro de auditoría y revisión legal/técnica de protección de datos sensibles.

La aplicación no diagnostica ni modifica tratamientos. Los registros son orientativos.
