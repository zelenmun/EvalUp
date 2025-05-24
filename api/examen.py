from django.db.models import (
    Prefetch, Count, Avg, Sum, Max, Min,
    Case, When, Value, IntegerField, Q
)
from django.core.serializers.json import DjangoJSONEncoder
from django.http import JsonResponse
from django.db.models.functions import Coalesce
from decimal import Decimal
import json
from datetime import datetime, timedelta
from .models import (
    Examen, Pregunta, Respuesta, GeneracionIA,
    AreaEstudio, TemaAreaEstudio, NivelExamen,
    EstadoExamen, TipoPregunta, Persona
)


class ExamReportService:
    """Servicio para generar reportes completos de exámenes optimizados para React"""

    @staticmethod
    def get_exam_complete_data(exam_id=None, persona_id=None, filters=None):
        """
        Obtiene datos completos de exámenes con todas las relaciones optimizadas

        Args:
            exam_id: ID específico del examen (opcional)
            persona_id: ID de la persona para filtrar sus exámenes (opcional)
            filters: Diccionario con filtros adicionales (opcional)

        Returns:
            Dict con datos estructurados para React
        """

        # Base queryset con select_related para relaciones one-to-one/foreign-key
        base_query = Examen.objects.select_related(
            'persona',
            'estado',
            'calificado_por',
            'nivel',
            'area_estudio'
        ).prefetch_related(
            # Prefetch optimizado para preguntas con sus respuestas
            Prefetch(
                'preguntas',
                queryset=Pregunta.objects.select_related(
                    'tipo', 'estado'
                ).prefetch_related(
                    Prefetch(
                        'respuestas',
                        queryset=Respuesta.objects.select_related('es_vof')
                    )
                ).order_by('id')
            ),
            # Prefetch para temas del área de estudio
            'tema',
            # Prefetch para generación IA si existe
            Prefetch(
                'generacionia',
                queryset=GeneracionIA.objects.select_related(
                    'area', 'temas', 'nivel'
                )
            )
        ).annotate(
            # Agregaciones útiles para el reporte
            total_preguntas=Count('preguntas', distinct=True),
            total_respuestas=Count('preguntas__respuestas', distinct=True),
            respuestas_correctas=Count(
                'preguntas__respuestas',
                filter=Q(preguntas__respuestas__es_correcta=True),
                distinct=True
            ),
            porcentaje_aciertos=Case(
                When(
                    total_respuestas__gt=0,
                    then=(Count(
                        'preguntas__respuestas',
                        filter=Q(preguntas__respuestas__es_correcta=True),
                        distinct=True
                    ) * 100.0) / Count('preguntas__respuestas', distinct=True)
                ),
                default=Value(0.0),
                output_field=IntegerField()
            ),
            puntaje_total_preguntas=Coalesce(
                Sum('preguntas__puntaje'), Decimal('0.00')
            ),
            puntaje_total_respuestas=Coalesce(
                Sum('preguntas__respuestas__puntaje'), Decimal('0.00')
            )
        )

        # Aplicar filtros específicos
        if exam_id:
            base_query = base_query.filter(id=exam_id)

        if persona_id:
            base_query = base_query.filter(persona_id=persona_id)

        if filters:
            if filters.get('estado'):
                base_query = base_query.filter(estado__nombre=filters['estado'])

            if filters.get('area_estudio'):
                base_query = base_query.filter(area_estudio__nombre=filters['area_estudio'])

            if filters.get('nivel'):
                base_query = base_query.filter(nivel__nombre=filters['nivel'])

            if filters.get('fecha_desde'):
                base_query = base_query.filter(fecha_examen__gte=filters['fecha_desde'])

            if filters.get('fecha_hasta'):
                base_query = base_query.filter(fecha_examen__lte=filters['fecha_hasta'])

            if filters.get('calificacion_minima'):
                base_query = base_query.filter(calificacion__gte=filters['calificacion_minima'])

        return base_query.order_by('-created_at')

    @staticmethod
    def serialize_exam_data(examenes_queryset):
        """
        Serializa los datos del examen en formato JSON optimizado para React

        Args:
            examenes_queryset: QuerySet de exámenes obtenido de get_exam_complete_data

        Returns:
            Dict con estructura JSON para React
        """

        examenes_data = []

        for examen in examenes_queryset:
            # Información básica del examen
            examen_data = {
                'id': examen.id,
                'titulo': examen.titulo,
                'descripcion': examen.descripcion,
                'fecha_examen': examen.fecha_examen.isoformat() if examen.fecha_examen else None,
                'fecha_creacion': examen.fecha_creacion.isoformat() if hasattr(examen, 'fecha_creacion') else None,
                'duracion_minutos': int(examen.duracion.total_seconds() / 60) if examen.duracion else None,
                'puntaje_maximo': float(examen.puntaje_maximo) if examen.puntaje_maximo else 0.0,
                'puntaje_obtenido': float(examen.puntaje_obtenido) if examen.puntaje_obtenido else 0.0,
                'calificacion': examen.calificacion,

                # Métricas calculadas
                'total_preguntas': examen.total_preguntas,
                'total_respuestas': examen.total_respuestas,
                'respuestas_correctas': examen.respuestas_correctas,
                'porcentaje_aciertos': float(examen.porcentaje_aciertos) if examen.porcentaje_aciertos else 0.0,
                'puntaje_total_preguntas': float(examen.puntaje_total_preguntas),
                'puntaje_total_respuestas': float(examen.puntaje_total_respuestas),

                # Información de la persona
                'persona': {
                    'id': examen.persona.id,
                    'nombre_completo': f"{examen.persona.nombres} {examen.persona.apellidos}" if hasattr(examen.persona,
                                                                                                         'nombres') else str(
                        examen.persona),
                    'email': getattr(examen.persona, 'email', None),
                } if examen.persona else None,

                # Estado del examen
                'estado': {
                    'id': examen.estado.id,
                    'nombre': examen.estado.nombre,
                    'descripcion': examen.estado.descripcion
                } if examen.estado else None,

                # Calificado por
                'calificado_por': {
                    'id': examen.calificado_por.id,
                    'nombre_completo': f"{examen.calificado_por.nombres} {examen.calificado_por.apellidos}" if hasattr(
                        examen.calificado_por, 'nombres') else str(examen.calificado_por),
                } if examen.calificado_por else None,

                # Nivel del examen
                'nivel': {
                    'id': examen.nivel.id,
                    'nombre': examen.nivel.nombre,
                    'descripcion': examen.nivel.descripcion
                } if examen.nivel else None,

                # Área de estudio
                'area_estudio': {
                    'id': examen.area_estudio.id,
                    'nombre': examen.area_estudio.nombre,
                    'descripcion': examen.area_estudio.descripcion
                } if examen.area_estudio else None,

                # Temas relacionados
                'temas': [
                    {
                        'id': tema.id,
                        'nombre': tema.nombre,
                        'descripcion': tema.descripcion,
                        'area': tema.area.nombre if tema.area else None
                    }
                    for tema in examen.tema.all()
                ],

                # Información de generación IA (si existe)
                'generacion_ia': None,

                # Preguntas completas con respuestas
                'preguntas': []
            }

            # Agregar información de generación IA si existe
            if hasattr(examen, 'generacionia') and examen.generacionia:
                gen_ia = examen.generacionia
                examen_data['generacion_ia'] = {
                    'id': gen_ia.id,
                    'resultadojson': gen_ia.resultadojson,
                    'area': {
                        'id': gen_ia.area.id,
                        'nombre': gen_ia.area.nombre
                    } if gen_ia.area else None,
                    'tema': {
                        'id': gen_ia.temas.id,
                        'nombre': gen_ia.temas.nombre
                    } if gen_ia.temas else None,
                    'nivel': {
                        'id': gen_ia.nivel.id,
                        'nombre': gen_ia.nivel.nombre
                    } if gen_ia.nivel else None,
                    'fecha_generacion': gen_ia.fecha_creacion.isoformat() if hasattr(gen_ia, 'fecha_creacion') else None
                }

            # Serializar preguntas con respuestas
            for pregunta in examen.preguntas.all():
                pregunta_data = {
                    'id': pregunta.id,
                    'enunciado': pregunta.enunciado,
                    'puntaje': float(pregunta.puntaje) if pregunta.puntaje else 0.0,
                    'tipo': {
                        'id': pregunta.tipo.id,
                        'nombre': pregunta.tipo.nombre,
                        'descripcion': pregunta.tipo.descripcion
                    } if pregunta.tipo else None,
                    'estado': {
                        'id': pregunta.estado.id,
                        'nombre': pregunta.estado.nombre,
                        'descripcion': pregunta.estado.descripcion
                    } if pregunta.estado else None,
                    'respuestas': []
                }

                # Serializar respuestas
                for respuesta in pregunta.respuestas.all():
                    respuesta_data = {
                        'id': respuesta.id,
                        'texto': respuesta.texto,
                        'es_correcta': respuesta.es_correcta,
                        'justificacion': respuesta.justificacion,
                        'puntaje': float(respuesta.puntaje) if respuesta.puntaje else 0.0,
                        'es_vof': {
                            'id': respuesta.es_vof.id,
                            'nombre_completo': f"{respuesta.es_vof.nombres} {respuesta.es_vof.apellidos}" if hasattr(
                                respuesta.es_vof, 'nombres') else str(respuesta.es_vof),
                        } if respuesta.es_vof else None
                    }
                    pregunta_data['respuestas'].append(respuesta_data)

                examen_data['preguntas'].append(pregunta_data)

            examenes_data.append(examen_data)

        return examenes_data

    @staticmethod
    def get_exam_statistics(examenes_queryset):
        """
        Calcula estadísticas generales de los exámenes para dashboards

        Args:
            examenes_queryset: QuerySet de exámenes

        Returns:
            Dict con estadísticas agregadas
        """

        stats = examenes_queryset.aggregate(
            total_examenes=Count('id'),
            promedio_calificacion=Avg('calificacion'),
            calificacion_maxima=Max('calificacion'),
            calificacion_minima=Min('calificacion'),
            promedio_puntaje_obtenido=Avg('puntaje_obtenido'),
            promedio_puntaje_maximo=Avg('puntaje_maximo'),
            total_preguntas_generadas=Sum('preguntas__id', distinct=True),
            total_respuestas=Count('preguntas__respuestas', distinct=True),
            respuestas_correctas_total=Count(
                'preguntas__respuestas',
                filter=Q(preguntas__respuestas__es_correcta=True),
                distinct=True
            )
        )

        # Calcular porcentaje de aciertos general
        if stats['total_respuestas'] and stats['total_respuestas'] > 0:
            stats['porcentaje_aciertos_general'] = (
                                                           stats['respuestas_correctas_total'] / stats[
                                                       'total_respuestas']
                                                   ) * 100
        else:
            stats['porcentaje_aciertos_general'] = 0.0

        # Distribución por estado
        estados_distribucion = examenes_queryset.values(
            'estado__nombre'
        ).annotate(
            cantidad=Count('id')
        ).order_by('-cantidad')

        # Distribución por área de estudio
        areas_distribucion = examenes_queryset.values(
            'area_estudio__nombre'
        ).annotate(
            cantidad=Count('id'),
            promedio_calificacion=Avg('calificacion')
        ).order_by('-cantidad')

        # Distribución por nivel
        niveles_distribucion = examenes_queryset.values(
            'nivel__nombre'
        ).annotate(
            cantidad=Count('id'),
            promedio_calificacion=Avg('calificacion')
        ).order_by('-cantidad')

        stats.update({
            'distribucion_estados': list(estados_distribucion),
            'distribucion_areas': list(areas_distribucion),
            'distribucion_niveles': list(niveles_distribucion)
        })

        return stats

    @classmethod
    def generate_complete_report(cls, exam_id=None, persona_id=None, filters=None):
        """
        Genera un reporte completo listo para ser enviado a React

        Args:
            exam_id: ID específico del examen (opcional)
            persona_id: ID de la persona para filtrar sus exámenes (opcional)
            filters: Diccionario con filtros adicionales (opcional)

        Returns:
            Dict con reporte completo estructurado
        """

        # Obtener datos de exámenes
        examenes_queryset = cls.get_exam_complete_data(exam_id, persona_id, filters)

        # Serializar datos
        examenes_data = cls.serialize_exam_data(examenes_queryset)

        # Calcular estadísticas
        statistics = cls.get_exam_statistics(examenes_queryset)

        # Estructura final del reporte
        report = {
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'total_records': len(examenes_data),
                'filters_applied': filters or {},
                'exam_id_filter': exam_id,
                'persona_id_filter': persona_id
            },
            'examenes': examenes_data,
            'statistics': statistics,
            'summary': {
                'total_examenes': len(examenes_data),
                'examenes_completados': len(
                    [e for e in examenes_data if e.get('estado', {}).get('nombre') == 'EXAMEN COMPLETADO']),
                'examenes_calificados': len(
                    [e for e in examenes_data if e.get('estado', {}).get('nombre') == 'EXAMEN CALIFICADO']),
                'promedio_general_calificacion': statistics.get('promedio_calificacion', 0),
                'areas_mas_frecuentes': statistics.get('distribucion_areas', [])[:5]  # Top 5 áreas
            }
        }

        return report


# Vista de ejemplo para usar el servicio
class ExamReportAPIView:
    """Vista de API para obtener reportes de exámenes"""

    def get_exam_report(self, request, exam_id=None):
        """
        Endpoint para obtener reporte completo de exámenes

        Query parameters:
        - persona_id: ID de la persona
        - estado: Estado del examen
        - area_estudio: Área de estudio
        - nivel: Nivel del examen
        - fecha_desde: Fecha desde (YYYY-MM-DD)
        - fecha_hasta: Fecha hasta (YYYY-MM-DD)
        - calificacion_minima: Calificación mínima
        """

        # Obtener parámetros de filtro
        filters = {}
        persona_id = request.GET.get('persona_id')

        if request.GET.get('estado'):
            filters['estado'] = request.GET.get('estado')

        if request.GET.get('area_estudio'):
            filters['area_estudio'] = request.GET.get('area_estudio')

        if request.GET.get('nivel'):
            filters['nivel'] = request.GET.get('nivel')

        if request.GET.get('fecha_desde'):
            try:
                filters['fecha_desde'] = datetime.strptime(
                    request.GET.get('fecha_desde'), '%Y-%m-%d'
                ).date()
            except ValueError:
                pass

        if request.GET.get('fecha_hasta'):
            try:
                filters['fecha_hasta'] = datetime.strptime(
                    request.GET.get('fecha_hasta'), '%Y-%m-%d'
                ).date()
            except ValueError:
                pass

        if request.GET.get('calificacion_minima'):
            try:
                filters['calificacion_minima'] = int(request.GET.get('calificacion_minima'))
            except ValueError:
                pass

        try:
            # Generar reporte completo
            report = ExamReportService.generate_complete_report(
                exam_id=exam_id,
                persona_id=persona_id,
                filters=filters if filters else None
            )

            return JsonResponse(
                report,
                encoder=DjangoJSONEncoder,
                json_dumps_params={'ensure_ascii': False, 'indent': 2}
            )

        except Exception as e:
            return JsonResponse({
                'error': True,
                'message': f'Error al generar el reporte: {str(e)}',
                'details': str(e)
            }, status=500)


# Ejemplo de uso en views.py
"""
from django.http import JsonResponse
from .services import ExamReportService

def exam_report_view(request, exam_id=None):
    service = ExamReportAPIView()
    return service.get_exam_report(request, exam_id)

# En urls.py
urlpatterns = [
    path('api/examenes/reporte/', exam_report_view, name='exam_report_all'),
    path('api/examenes/reporte/<int:exam_id>/', exam_report_view, name='exam_report_single'),
]
"""
