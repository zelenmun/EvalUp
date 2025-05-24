import {useState, useMemo} from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge.tsx";
import ExamDetailModal from './modals/ExamDetailModals.tsx';
import Pagination from './pagination/Pagination.tsx';
import {Examen} from '../types/typesTable.ts';
import 'boxicons/css/boxicons.min.css';

// Props interface for the component
interface ExamenesTableProps {
    examenes: Examen[];
}

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

// Helper function to get grade color based on percentage
const getGradeColor = (porcentaje: number): "success" | "warning" | "error" => {
    if (porcentaje >= 70) return "success";
    if (porcentaje >= 50) return "warning";
    return "error";
};

export default function ExamenesTable({examenes}: ExamenesTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedExam, setSelectedExam] = useState<Examen | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const itemsPerPage = 5;

    // Calculate pagination
    const totalPages = Math.ceil(examenes.length / itemsPerPage);
    const paginatedExamenes = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return examenes.slice(startIndex, endIndex);
    }, [examenes, currentPage, itemsPerPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleViewDetails = (examen: Examen) => {
        setSelectedExam(examen);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedExam(null);
    };

    return (
        <>
            <div
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Exámenes Realizados
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {examenes.length} examen{examenes.length !== 1 ? 'es' : ''} encontrado{examenes.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                            <svg
                                className="stroke-current fill-white dark:fill-gray-800"
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M2.29004 5.90393H17.7067"
                                    stroke=""
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M17.7075 14.0961H2.29085"
                                    stroke=""
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                                    fill=""
                                    stroke=""
                                    strokeWidth="1.5"
                                />
                                <path
                                    d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                                    fill=""
                                    stroke=""
                                    strokeWidth="1.5"
                                />
                            </svg>
                            Filtrar
                        </button>
                        <button
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                            Ver todos
                        </button>
                    </div>
                </div>

                <div className="max-w-full overflow-x-auto">
                    <Table>
                        {/* Table Header */}
                        <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Título
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Área/Nivel
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Fecha
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Duración
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Calificación
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Estado
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Detalles
                                </TableCell>
                            </TableRow>
                        </TableHeader>

                        {/* Table Body */}
                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {paginatedExamenes.length === 0 ? (
                                <TableRow>
                                    <TableCell className="py-8 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div
                                                className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor"
                                                     viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                                </svg>
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400">No hay exámenes
                                                disponibles</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedExamenes.map((examen) => (
                                    <TableRow key={examen.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400"
                                                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round"
                                                              strokeWidth={2}
                                                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                        {examen.titulo}
                                                    </p>
                                                    <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                                                        {examen.total_preguntas} pregunta{examen.total_preguntas !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3">
                                            <div className="flex flex-col gap-1">
                                                <span
                                                    className="text-gray-800 text-theme-sm font-medium dark:text-white/90">
                                                    {examen.area_estudio?.nombre || 'Sin área'}
                                                </span>
                                                <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                                                    {examen.nivel?.nombre || 'Sin nivel'}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                            {formatDate(examen.fecha_examen)}
                                        </TableCell>

                                        <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                            {formatDuration(examen.duracion_minutos)}
                                        </TableCell>

                                        <TableCell className="py-3">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        size="sm"
                                                        color={getGradeColor(examen.porcentaje_aciertos)}
                                                    >
                                                        {examen.porcentaje_aciertos.toFixed(1)}%
                                                    </Badge>
                                                </div>
                                                <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                                                    {examen.puntaje_obtenido}/{examen.puntaje_maximo} pts
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-3">
                                            <Badge
                                                size="sm"
                                                color={getStatusColor(examen.estado?.nombre)}
                                            >
                                                {examen.estado?.nombre || 'Sin estado'}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(examen)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors dark:text-blue-400 dark:bg-blue-900/30 dark:border-blue-800 dark:hover:bg-blue-900/50"
                                                >
                                                    <i className="bx bx-show text-sm"></i>
                                                </button>
                                                {/*<button*/}
                                                {/*    className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 hover:text-red-700 transition-colors dark:text-red-400 dark:bg-red-900/30 dark:border-red-800 dark:hover:bg-red-900/50"*/}
                                                {/*>*/}
                                                {/*    <i className="bx bx-trash text-sm"></i>*/}
                                                {/*</button>*/}
                                                {/*<button*/}
                                                {/*    className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 hover:text-green-700 transition-colors dark:text-green-400 dark:bg-green-900/30 dark:border-green-800 dark:hover:bg-green-900/50"*/}
                                                {/*>*/}
                                                {/*    <i className="bx bx-edit text-sm"></i>*/}
                                                {/*</button>*/}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* Modal */}
            {selectedExam && (
                <ExamDetailModal
                    examen={selectedExam}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
}