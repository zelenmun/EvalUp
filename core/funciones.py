import unidecode
from django.contrib.auth.models import User

def generarUsername(nombre, apellido):
    """
    Genera un nombre de usuario a partir de su nombre y apellido
    # NOMBRE = OSCAR
    # APELLIDO = MORÁN
    # GENERAMOS UN NOMBRE DE USUARIO CON EL FORMATO: omoranr
    """
    try:
        nombre = nombre.lower()
        apellido = apellido.lower()
        username = f"{nombre[0]}{apellido}{nombre[-1]}"
        return username
    except Exception:
        # Si ocurre un error, devolvemos un nombre de usuario por defecto con un número de registro
        # user_default_1 en caso de ser el primer usuario por default, user_default_2 en caso de ser el segundo, etc.
        cantidad = User.objects.filter(username__startswith='user_default_').count()
        return f'user_default_{cantidad + 1}'

def normalizarTexto(texto):
    """
    Normaliza el texto a mayusculas y elimina espacios en blanco al inicio y al final
    Adicionalmente elimina las tildes
    """
    texto = unidecode.unidecode(texto).strip().upper()

    return texto
