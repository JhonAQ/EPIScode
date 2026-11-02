import { NextResponse } from "next/server";
import { getObtenerDocente } from "@/server/composition/container";
import { InvalidQueryError } from "@/server/domain/errors";
import type { ApiResponse, Docente } from "@/types";

type DocenteResponse = ApiResponse<Docente>;

/**
 * Adaptador de entrada HTTP: obtiene el detalle de un docente por su ID.
 *
 *   GET /api/docentes/[id]
 *   respuesta: ApiResponse<Docente>   (tipos en src/types)
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const docente = await getObtenerDocente().execute(id);

    if (!docente) {
      return NextResponse.json<DocenteResponse>(
        { success: false, error: "Docente no encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json<DocenteResponse>({ success: true, data: docente });
  } catch (err) {
    if (err instanceof InvalidQueryError) {
      return NextResponse.json<DocenteResponse>(
        { success: false, error: err.message },
        { status: 400 },
      );
    }
    // Nunca se devuelve el error interno: puede contener detalles de SQL o rutas.
    console.error("[api/docentes/[id]]", err);
    return NextResponse.json<DocenteResponse>(
      { success: false, error: "No se pudo obtener el detalle del docente. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
