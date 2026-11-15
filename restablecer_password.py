
from app import app, db, User
from getpass import getpass

with app.app_context():
    usuarios = User.query.count()

    if usuarios != 1:
        print("No se realizaron cambios.")
        print("Cantidad de usuarios:", usuarios)
    else:
        usuario = User.query.first()

        print("Restablecimiento de contraseña")
        print("La contraseña no aparecerá mientras escribís.")

        nueva = getpass("Nueva contraseña: ")
        confirmar = getpass("Repetir nueva contraseña: ")

        if len(nueva) < 10:
            print("La contraseña debe tener al menos 10 caracteres.")
        elif nueva != confirmar:
            print("Las contraseñas no coinciden.")
        else:
            usuario.set_password(nueva)
            db.session.commit()
            print("Contraseña actualizada correctamente.")
