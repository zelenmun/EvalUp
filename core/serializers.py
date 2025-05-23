# serializers.py
from rest_framework import serializers
from core.models import Persona
from django.contrib.auth.models import User
import re

class EmailValidator:
    def __call__(self, value):
        if not re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', value):
            raise serializers.ValidationError("El correo electrónico no es válido")
        return value

class PasswordValidator:
    def __call__(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener mínimo 8 caracteres")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Debe contener al menos una letra mayúscula")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Debe contener al menos una letra minúscula")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Debe contener al menos un número")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("Debe contener al menos un caracter especial")
        return value

class UserCreateSerializer(serializers.Serializer):
    firstName = serializers.CharField(max_length=100,error_messages={'blank': 'Debe ingresar un nombre'})
    lastName = serializers.CharField(max_length=100, error_messages={'blank': 'Debe ingresar un apellido'})
    email = serializers.EmailField(error_messages={'blank': 'Debe ingresar un correo electrónico'})
    password = serializers.CharField(write_only=True, error_messages={'blank': 'Debe ingresar una contraseña'})
    terms = serializers.BooleanField()

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener mínimo 8 caracteres")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Debe contener al menos una letra mayúscula")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Debe contener al menos una letra minúscula")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Debe contener al menos un número")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("Debe contener al menos un caracter especial")
        return value

    def validate_terms(self, value):
        if not value:
            raise serializers.ValidationError("Debes aceptar los términos y condiciones")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("El correo electrónico ya está en uso")
        return value

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        style={'input_type': 'password'},
        trim_whitespace=False
    )