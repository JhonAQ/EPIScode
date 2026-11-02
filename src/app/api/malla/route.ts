import { NextResponse } from "next/server";
import { getListarMalla } from "@/server/composition/container";
import { InvalidQueryError } from "@/server/domain/errors";
import { parseMallaQuery } from "@/server/interface/http/malla-query";
import type { ApiResponse, Malla } from "@/types";

type MallaResponse = ApiResponse<Malla>;

/**
 * Adaptador de entrada HTTP: traduce request -> caso de uso -> response. Sin lógica de negocio.
 *
 *   GET /api/malla?version=&areaFormativa=&semestre=&tipo=&q=
 *   respuesta: ApiResponse<Malla> (tipos en src/types)
 *
 * Sigue el patrón de GET /api/docentes: parser de query -> caso de uso -> mapeo de errores.
 */
export async function GET(request: Request) {
  try {
    const query = parseMallaQuery(new URL(request.url).searchParams);
    const data = await getListarMalla().execute(query);
    return NextResponse.json<MallaResponse>({ success: true, data });
  } catch (err) {
    if (err instanceof InvalidQueryError) {
      return NextResponse.json<MallaResponse>({ success: false, error: err.message }, { status: 400 });
    }
    // Nunca se devuelve el error interno: puede contener detalles sensibles.
    console.error("[api/malla]", err);
    return NextResponse.json<MallaResponse>(
      { success: false, error: "No se pudo obtener la malla curricular. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
