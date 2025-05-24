import { Modal } from "../../ui/modal";
import { ExamDetailModalProps } from '../../types/typesTable.ts';
import 'boxicons/css/boxicons.min.css';
import React from 'react';
import Badge from "../../ui/badge/Badge.tsx";
import 'boxicons/css/boxicons.min.css';
import Button from "../../ui/button/Button";

// Helper function to format date
const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Helper function to format duration
const formatDuration = (minutes: number | null): string => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
};

// Helper function to get status color
const getStatusColor = (estado: string | undefined): "success" | "warning" | "error" => {
    if (!estado) return "error";
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes('completado') || estadoLower.includes('finalizado') || estadoLower.includes('aprobado')) {
        return "success";
    }
    if (estadoLower.includes('pendiente') || estadoLower.includes('en curso') || estadoLower.includes('progreso')) {
        return "warning";
    }
    return "error";
};

// Helper function to get grade color based on numeric value
const getGradeColor = (calificacion: string): "success" | "warning" | "error" | "info" => {
    const grade = parseFloat(calificacion);
    if (isNaN(grade)) return "info";

    if (grade >= 9) return "success";
    if (grade >= 7) return "info";
    if (grade >= 5) return "warning";
    return "error";
};

const ExamDetailModal: React.FC<ExamDetailModalProps> = ({ examen, isOpen, onClose }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            className="max-w-[700px] w-full mx-4 max-h-[95vh] flex flex-col"
            showCloseButton={true}
        >
            {/* Modal Header - Fixed */}
            <div
                className="flex-shrink-0 px-6 pt-6 pb-4 rounded-3xl border-gray-200 dark:border-gray-900 bg-white dark:bg-gray-900">
                <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90 pr-8">
                    Detalles del Examen
                </h4>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Información completa del examen realizado
                </p>
            </div>

            {/* Modal Body - Scrollable */}
             <div className="custom-scrollbar flex-1 overflow-y-auto max-h-[60vh] px-6 py-4">
                 <div className="space-y-6">
                     {/* Basic Info */}
                     <div>
                         <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                             Información General
                         </h5>
                         <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                             <div>
                                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                     Examen
                                 </label>
                                 <p className="text-gray-800 dark:text-white">{examen.titulo}</p>
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                     Estado
                                 </label>
                                 <Badge size="sm" color={getStatusColor(examen.estado?.nombre)}>
                                     {examen.estado?.nombre || 'Sin estado'}
                                 </Badge>
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                     Área de Estudio
                                 </label>
                                 <p className="text-gray-800 dark:text-white">
                                     {examen.area_estudio?.nombre || 'Sin área'}
                                 </p>
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                     Nivel
                                 </label>
                                 <p className="text-gray-800 dark:text-white">
                                     {examen.nivel?.nombre || 'Sin nivel'}
                                 </p>
                             </div>
                         </div>
                     </div>

                     {/* Description */}
                     {examen.descripcion && (
                         <div>
                             <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                 Descripción
                             </h5>
                             <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                 {examen.descripcion}
                             </p>
                         </div>
                     )}

                     {/* Dates and Duration */}
                     <div>
                         <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                             Fechas y Duración
                         </h5>
                         <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3">
                             <div>
                                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                     Fecha de Examen
                                 </label>
                                 <p className="text-gray-800 dark:text-white">
                                     {formatDate(examen.fecha_examen)}
                                 </p>
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                     Fecha de Creación
                                 </label>
                                 <p className="text-gray-800 dark:text-white">
                                     {formatDate(examen.fecha_creacion)}
                                 </p>
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                     Duración
                                 </label>
                                 <p className="text-gray-800 dark:text-white">
                                     {formatDuration(examen.duracion_minutos)}
                                 </p>
                             </div>
                         </div>
                     </div>

                     {/* Results */}
                     <div>
                         <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                             Resultados
                         </h5>
                         <div className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
                             <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                                 <p className="text-2xl font-bold text-gray-800 dark:text-white">
                                     {examen.total_preguntas}
                                 </p>
                                 <p className="text-sm text-gray-600 dark:text-gray-400">
                                     Total Preguntas
                                 </p>
                             </div>
                             <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                                 <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                     {examen.respuestas_correctas}
                                 </p>
                                 <p className="text-sm text-gray-600 dark:text-gray-400">
                                     Correctas
                                 </p>
                             </div>
                             <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                                 <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                     {examen.porcentaje_aciertos.toFixed(1)}%
                                 </p>
                                 <p className="text-sm text-gray-600 dark:text-gray-400">
                                     Porcentaje
                                 </p>
                             </div>
                             <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                                 <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                     {examen.puntaje_obtenido}/{examen.puntaje_maximo}
                                 </p>
                                 <p className="text-sm text-gray-600 dark:text-gray-400">
                                     Puntaje
                                 </p>
                             </div>
                         </div>
                     </div>

                     {/* Calificación */}
                     <div>
                         <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                             Calificación Final
                         </h5>
                         <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
                             <div className="flex items-center justify-center gap-3">
                                 <p className="text-3xl font-bold text-gray-800 dark:text-white">
                                     {examen.calificacion}
                                 </p>
                                 <Badge size="sm" color={getGradeColor(examen.calificacion)}>
                                     {parseFloat(examen.calificacion) >= 7 ? 'Aprobado' : 'Reprobado'}
                                 </Badge>
                             </div>
                             <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                 Calificación obtenida
                             </p>
                         </div>
                     </div>

                     {/* Person Info */}
                     {examen.persona && (
                         <div>
                             <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                 Información del Estudiante
                             </h5>
                             <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                 <div>
                                     <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                         Nombre Completo
                                     </label>
                                     <p className="text-gray-800 dark:text-white">
                                         {examen.persona.nombre_completo}
                                     </p>
                                 </div>
                                 <div>
                                     <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                         Email
                                     </label>
                                     <p className="text-gray-800 dark:text-white">
                                         {examen.persona.email || 'Sin email registrado'}
                                     </p>
                                 </div>
                             </div>
                         </div>
                     )}

                     {/* Graded By */}
                     {examen.calificado_por && (
                         <div>
                             <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                 Calificado Por
                             </h5>
                             <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                 <div className="flex items-center gap-3">
                                     <div
                                         className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                         <i className="bx bx-user text-blue-600 dark:text-blue-400"></i>
                                     </div>
                                     <div>
                                         <p className="font-medium text-gray-800 dark:text-white">
                                             {examen.calificado_por.nombre_completo}
                                         </p>
                                         <p className="text-sm text-gray-600 dark:text-gray-400">
                                             Evaluador
                                         </p>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     )}

                     {/* Topics */}
                     {examen.temas && examen.temas.length > 0 && (
                         <div>
                             <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                 Temas Evaluados
                             </h5>
                             <div className="space-y-3">
                                 {examen.temas.map((tema) => (
                                     <div
                                         key={tema.id}
                                         className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 border-blue-500"
                                     >
                                         <h6 className="font-medium text-gray-800 dark:text-white mb-1">
                                             {tema.nombre}
                                         </h6>
                                         {tema.descripcion && (
                                             <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                 {tema.descripcion}
                                             </p>
                                         )}
                                         {tema.area && (
                                             <Badge size="sm" color="light">
                                                 {tema.area}
                                             </Badge>
                                         )}
                                     </div>
                                 ))}
                             </div>
                         </div>
                     )}
                 </div>
             </div>
             {/* Modal Footer - Fixed */}
            <div className="flex-shrink-0 rounded-3xl dark:border-gray-900 px-6 py-4 bg-white dark:bg-gray-900">
                <div className="flex justify-end gap-3">
                    <Button size="sm" variant="outline" onClick={onClose}>
                        Cerrar
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ExamDetailModal;