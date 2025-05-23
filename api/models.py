from django.db import models
from core.models import Persona, BaseModel

# ESTUDIANTE SELECCIONA UN ÁREA DE ESTUDIO, UN TEMA Y UN NIVEL PARA GENERAR SU EXAMEN
# DICHOS DATOS SE GUARDAN EN LA TABLA GENERACION_IA
# Y SE USAN COMO PROPMPT PARA LA GENERACIÓN DEL EXAMEN

class GeneracionIA(BaseModel):
    persona = models.ForeignKey(Persona, on_delete=models.SET_NULL, null=True, related_name='generaciones_ia')
    area = models.ForeignKey('AreaEstudio', on_delete=models.SET_NULL, null=True)
    temas = models.ForeignKey('TemaAreaEstudio', blank=True, null=True, on_delete=models.SET_NULL)
    nivel = models.ForeignKey('NivelExamen', on_delete=models.SET_NULL, null=True)
    resultadojson = models.JSONField(blank=True, null=True)
    examen = models.OneToOneField('Examen', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Generación IA de {self.persona} - {self.area}"

class PlantillaIA(BaseModel):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    prompt = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

class Examen(BaseModel):
    persona = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name='examenes')
    titulo = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)
    fecha_examen = models.DateTimeField(blank=True, null=True)
    duracion = models.DurationField(blank=True, null=True)
    puntaje_maximo = models.DecimalField(max_digits=5, decimal_places=2, default=0, blank=True, null=True)
    puntaje_obtenido = models.DecimalField(max_digits=5, decimal_places=2, default=0, blank=True, null=True)
    estado = models.ForeignKey('EstadoExamen', on_delete=models.SET_NULL, null=True, blank=True)
    calificado_por = models.ForeignKey(Persona, on_delete=models.SET_NULL, null=True, blank=True, related_name='examenes_calificados')
    calificacion = models.IntegerField(blank=True, null=True)
    nivel = models.ForeignKey('NivelExamen', on_delete=models.SET_NULL, null=True, blank=True)
    area_estudio = models.ForeignKey('AreaEstudio', on_delete=models.SET_NULL, null=True)
    tema = models.ManyToManyField('TemaAreaEstudio', blank=True)

    def __str__(self):
        return f"Examen de {self.persona}"



class Pregunta(BaseModel):
    examen = models.ForeignKey('Examen', on_delete=models.CASCADE, related_name='preguntas')
    enunciado = models.TextField(null=True, blank=True)
    tipo = models.ForeignKey('TipoPregunta', on_delete=models.SET_NULL, null=True, blank=True)
    puntaje = models.DecimalField(max_digits=5, decimal_places=2, default=0, blank=True, null=True)
    estado = models.ForeignKey('EstadoPregunta', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.enunciado or "Pregunta sin enunciado"

class Respuesta(BaseModel):
    pregunta = models.ForeignKey('Pregunta', on_delete=models.CASCADE, related_name='respuestas')
    texto = models.CharField(max_length=255, null=True, blank=True)
    es_correcta = models.BooleanField(default=False)
    justificacion = models.TextField(null=True, blank=True)
    es_vof = models.ForeignKey(Persona, on_delete=models.SET_NULL, null=True, blank=True)
    puntaje = models.DecimalField(max_digits=5, decimal_places=2, default=0, blank=True, null=True)

    def __str__(self):
        return self.texto or f"Respuesta a: {self.pregunta} ({self.puntaje or '0'}/{self.pregunta.puntaje})"



# ESTADO_EXAMEN = (
#     (0, 'PENDIENTE'),
#     (1, 'EN PROCESO'),
#     (2, 'FINALIZADO'),
#     (3, 'CANCELADO'),
#     (4, 'REVISADO'),
#     (5, 'NO PRESENTADO'),
# )

class EstadoExamen(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

# TIPO_PREGUNTA = (
#     (0, 'OPCIÓN ÚNICA'),
#     (1, 'OPCION_MULTIPLE'),
#     (2, 'VERDADERO_FALSO'),
#     (3, 'JUSTIFICACION'),
# )

class TipoPregunta(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

# VERDADERO_FALSO = (
#     (0, ''),
#     (1, 'VERDADERO'),
#     (2, 'FALSO'),
# )

class VerdaderoFalso(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

# ESTADO_PREGUNTA = (
#     (0, 'SIN RESPONDER'),
#     (1, 'RESPONDIDA'),
#     (2, 'NO RESPONDIDA'),
# )

class EstadoPregunta(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

# NIVEL_EXAMEN = (
#     (0, 'BÁSICO'),
#     (1, 'INTERMEDIO'),
#     (2, 'AVANZADO'),
# )

class NivelExamen(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

class AreaEstudio(BaseModel):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)


    def __str__(self):
        return self.nombre

class TemaAreaEstudio(BaseModel):
    area = models.ForeignKey('AreaEstudio', on_delete=models.CASCADE, related_name='temas')
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.nombre} ({self.area.nombre})"

class HistorialExamen(BaseModel):
    examen = models.ForeignKey('Examen', on_delete=models.CASCADE, related_name='historial')
    estado = models.ForeignKey('EstadoPregunta', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Historial de {self.examen}"










