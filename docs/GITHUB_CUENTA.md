# Crear cuenta de GitHub y conectar este proyecto

No se puede crear la cuenta automáticamente: GitHub pide tu email y verificación personal.

## 1. Registrarte en GitHub

1. Abrí https://github.com/signup
2. Ingresá **tu email real** (el que puedas verificar).
3. Creá una **contraseña** segura.
4. Elegí un **nombre de usuario** (por ejemplo algo como `tu-nombre`; será parte de la URL del repo).
5. Completá el captcha / verificación de que no sos un robot.
6. Revisá tu correo y **confirmá el email** con el enlace que manda GitHub.
7. Si te ofrece plan, podés elegir **Free**.

Cuando termines, deberías poder entrar a https://github.com y ver tu perfil.

## 2. Autenticar GitHub CLI en esta PC (después del registro)

En una terminal nueva (PowerShell o Git Bash):

```powershell
gh auth login
```

Elegí:

- GitHub.com
- HTTPS
- Login with a web browser

Seguí el código que muestra la terminal en el navegador.

Comprobá:

```powershell
gh auth status
```

## 3. Retomar el trabajo pendiente del repo

Cuando la cuenta y `gh auth login` estén listos, decime en el chat: **“ya tengo GitHub”**.

Pendiente (no hecho todavía porque falta tu cuenta):

1. `git init` en la carpeta del proyecto
2. Primer commit (código + `.gitignore` + `supabase/schema.sql` + `_inspect_db.py` + canvas)
3. Crear repo público/privado `mi-salud-integral` en GitHub
4. `git push -u origin main`
5. Devolver la URL del repositorio

## Notas

- **phpMyAdmin / MySQL** quedan fuera de este flujo. La base objetivo es **Supabase (Postgres)**.
- El `.gitignore` ya excluye `.venv`, `.env`, `node_modules`, bases `.db` y secretos.
