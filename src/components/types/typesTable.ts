// Define the TypeScript interface for exam data
export interface Examen {
    id: number;
    titulo: string;
    descripcion: string;
    fecha_examen: string | null;
    fecha_creacion: string | null;
    duracion_minutos: number | null;
    puntaje_maximo: number;
    puntaje_obtenido: number;
    calificacion: string;
    total_preguntas: number;
    total_respuestas: number;
    respuestas_correctas: number;
    porcentaje_aciertos: number;
    persona: {
        id: number;
        nombre_completo: string;
        email: string | null;
    } | null;
    estado: {
        id: number;
        nombre: string;
        descripcion: string;
    } | null;
    calificado_por: {
        id: number;
        nombre_completo: string;
    } | null;
    nivel: {
        id: number;
        nombre: string;
        descripcion: string;
    } | null;
    area_estudio: {
        id: number;
        nombre: string;
        descripcion: string;
    } | null;
    temas: Array<{
        id: number;
        nombre: string;
        descripcion: string;
        area: string | null;
    }>;
}

// Props interface for the main table component
export interface ExamenesTableProps {
    examenes: Examen[];
}

// Modal component props
export interface ExamDetailModalProps {
    examen: Examen;
    isOpen: boolean;
    onClose: () => void;
}

// Pagination component props
export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}