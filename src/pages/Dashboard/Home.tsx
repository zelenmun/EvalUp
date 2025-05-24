import PageMeta from "../../components/common/PageMeta";
import UnorderedList from "../../components/lists/unordered-list";
import ExamenesTable from "../../components/tables/ExamenesTable.tsx"; // ✅ Corregido
import {useAuth} from "../../components/auth/AuthContext.tsx";
import {useEffect, useState} from "react";
import {toast} from "react-hot-toast";
import CardsHome from "../../components/ecommerce/EcommerceMetrics";
// import { ApiResponse } from "../../types/exam.types"; // ✅ Si usas archivo separado

// ✅ Interface para un examen individual
interface Examen {
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

// ✅ Interface para la respuesta de la API
interface ApiResponse {
    cantidad: number;
    examenes: Examen[];  // Ahora correctamente tipado
    promedio: number;
}

export default function Home() {
    const {user, token} = useAuth();
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(false); // ✅ Estado de carga opcional

    const cantidad = data?.cantidad ?? 0;
    const examenes = Array.isArray(data?.examenes) ? data.examenes : [];
    const promedio = data?.promedio ?? 0;

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !token) return; // ✅ Guard clause

            setLoading(true);
            try {
                const response = await fetch('http://localhost:8000/api/mainview/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`
                    }
                });

                if (!response.ok) {
                    toast.error('Error al obtener la información');
                    return; // ✅ Detener ejecución en caso de error
                }

                const result = await response.json();
                setData(result);

            } catch (err) {
                console.error('Error fetching data:', err); // ✅ Log del error
                toast.error('Error de conexión');
            } finally {
                setLoading(false); // ✅ Limpia estado de carga
            }
        };

        fetchData();
    }, [user, token]);

    return (
        <>
            <PageMeta
                title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
                description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <div className="grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 space-y-6 xl:col-span-12">
                    <CardsHome cantidad={cantidad} promedio={promedio}/>
                </div>

                <div className="col-span-12 sm:col-span-4 md:col-span-6">
                    <UnorderedList/>
                </div>

                <div className="col-span-12">
                    {loading ? (
                        <div className="p-8 text-center">Cargando exámenes...</div>
                    ) : (
                        <ExamenesTable examenes={examenes}/>
                    )}
                </div>
            </div>
        </>
    );
}