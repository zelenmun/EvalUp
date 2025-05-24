# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from core.serializers import UserCreateSerializer
from django.contrib.auth.models import User
from core.models import Persona
from core.funciones import generarUsername, normalizarTexto
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from rest_framework.authtoken.models import Token

@api_view(['POST'])
@permission_classes([AllowAny])
def create_user(request):
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        fname = normalizarTexto(serializer.validated_data['firstName'])
        lname = normalizarTexto(serializer.validated_data['lastName'])
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        try:
            # CREAMOS EL USUARIO EN EL MODELO USER NATIVO EN DJANGO
            user = User.objects.create_user(
                username=generarUsername(fname, lname),
                first_name=fname,
                last_name=lname,
                email=email,
                password=password
            )

            persona = Persona(
                user=user,
                nombre1=fname,
                apellido1=lname,
                correo=email,
            )

            persona.save(request)

            token, created = Token.objects.get_or_create(user=user)
        except Exception as ex:
            return Response({'result': False, 'message': 'Error al crear el usuario'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'result': True, 'message': 'Su cuenta ha sigo creada excitosamente'}, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




