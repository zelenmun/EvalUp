from django.db import models
from django.conf import settings
from cities_light.models import Country, Region, City

class BaseModel(models.Model):
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name="%(class)s_created", null=True, blank=True, on_delete=models.SET_NULL)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL,related_name="%(class)s_updated",null=True,blank=True,on_delete=models.SET_NULL)

    class Meta:
        abstract = True

class Gender(models.Model):
    nombre = models.CharField(max_length=20, unique=True, verbose_name=f'Nombre del género')

    def __str__(self):
        return self.nombre

class Persona(BaseModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="persona")
    nombre1 = models.CharField(max_length=100)
    nombre2 = models.CharField(max_length=100)
    apellido1 = models.CharField(max_length=100)
    apellido2 = models.CharField(max_length=100)
    fecha_nacimiento = models.DateField(null=True, blank=True)
    genero = models.ForeignKey(Gender, on_delete=models.SET_NULL, null=True, blank=True)
    telefono = models.CharField(max_length=20, null=True, blank=True)
    correo = models.EmailField(max_length=100, unique=True, null=True, blank=True)
    direccion = models.CharField(max_length=255, null=True, blank=True)
    pais = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True)
    region = models.ForeignKey(Region, on_delete=models.SET_NULL, null=True)
    ciudad = models.ForeignKey(City, on_delete=models.SET_NULL, null=True)
    cedula = models.CharField(max_length=10, null=True, blank=True)

    def __str__(self):
        return f"{self.nombre1} {self.apellido1} {self.apellido2} ({self.user.username})"