# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from core.models import Persona
from core.serializers import UserLoginSerializer


@api_view(['POST'])
def login_user(request):
    serializer = UserLoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email']
    password = serializer.validated_data['password']

    try:
        # Buscamos al usuario por email (no por username)
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'result': False, 'message': 'Email no registrado'}, status=status.HTTP_401_UNAUTHORIZED)

    # Autenticamos con el username de Django (no con el email directamente)
    auth_user = authenticate(username=user.username, password=password)

    if not auth_user:
        return Response({'result': False, 'message': 'Contraseña incorrecta'}, status=status.HTTP_401_UNAUTHORIZED)

    if not auth_user.is_active:
        return Response({'result': False, 'message': 'Usted no tiene ninguna cuenta'}, status=status.HTTP_403_FORBIDDEN)

    # Obtenemos o creamos el token
    token, created = Token.objects.get_or_create(user=auth_user)

    try:
        persona = Persona.objects.get(user=auth_user)
        user_data = {
            'id': auth_user.id,
            'username': auth_user.username,
            'email': auth_user.email,
            'firstName': auth_user.first_name,
            'lastName': auth_user.last_name,
            'isStaff': auth_user.is_staff,
            # Agrega más campos de Persona si los necesitas
            'personaId': persona.id if persona else None
        }
    except Persona.DoesNotExist:
        user_data = {
            'id': auth_user.id,
            'username': auth_user.username,
            'email': auth_user.email,
            'firstName': auth_user.first_name,
            'lastName': auth_user.last_name,
            'isStaff': auth_user.is_staff,
            'personaId': None
        }

    return Response({'result': True, 'message': 'Inicio de sesión exitoso', 'token': token.key, 'user': user_data}, status=status.HTTP_200_OK)
