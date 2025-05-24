from rest_framework import status

from .models import Persona, Examen, Pregunta, Respuesta
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from .examen import ExamReportService

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_examenes(request):
    """
    Obtiene todos los exámenes disponibles.
    """
    user = request.user  # ← Usuario obtenido del token
    try:
        persona = Persona.objects.get(user=user)
        examenes = Examen.objects.filter(persona=persona, is_active=True)
        cantidad = examenes.count()
        sumacalificacion = 0
        if not examenes.exists():
            cantidad = 0
            return Response({'examenes': examenes, 'cantidad': cantidad, 'promedio': 0}, status=status.HTTP_200_OK)

        # SE OBTIENE EL PROMEDIO DE CALIFICACION DE LOS EXAMENES DEL ESTUDIANTE
        for e in examenes:
            sumacalificacion += e.calificacion

        promedio = sumacalificacion / cantidad

        examenes = ExamReportService.get_exam_complete_data(persona_id=persona.id).filter(is_active=True)
        jsonexamenes = ExamReportService.serialize_exam_data(examenes)

        return Response({'examenes': jsonexamenes, 'cantidad':cantidad, 'promedio': promedio}, status=status.HTTP_200_OK)
    except Exception as ex:
        return Response({'error': str(ex)}, status=status.HTTP_400_BAD_REQUEST)