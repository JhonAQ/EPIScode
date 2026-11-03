import { NextResponse } from "next/server";
import { getListarVersionesMalla } from "@/server/composition/container";
import type { ApiResponse, MallaVersion } from "@/types";

type MallaVersionesResponse = ApiResponse<MallaVersion[]>;

/**
 * Adaptador de entrada HTTP: obtiene las versiones registradas de la malla curricular.
 *
 *   GET /api/malla/versiones
 *   respuesta: ApiResponse<MallaVersion[]>   (tipos en src/types)
 */
export async function GET() {
  try {
    const data = await getListarVersionesMalla().execute();
    return NextResponse.json<MallaVersionesResponse>({ success: true, data });
  } catch (err) {
    // Nunca se devuelve el error interno: puede contener detalles de SQL o infraestructura.
    console.error("[api/malla/versiones]", err);
    return NextResponse.json<MallaVersionesResponse>(
      { success: false, error: "No se pudieron obtener las versiones de la malla curricular. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
