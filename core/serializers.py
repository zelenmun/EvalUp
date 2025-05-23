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
    firstName = serializers.CharField(max_length=100)
    lastName = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    terms = serializers.BooleanField(write_only=True)

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
        if Persona.objects.filter(email=value).exists():
            raise serializers.ValidationError("El correo electrónico ya está en uso")
        return value

class UserPersonaSerializer(UserCreateSerializer):

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        first_name  = validated_data['firstName']
        last_name  = validated_data['lastName']

        user = User.objects.create_user(username=email, email=email, password=password)
        persona = Persona.objects.create(user=user, first_name=first_name, last_name=last_name )
        return persona
