import { NextResponse } from "next/server";
import { getListarDocentes } from "@/server/composition/container";
import { InvalidQueryError } from "@/server/domain/errors";
import { parseDocentesQuery } from "@/server/interface/http/docentes-query";
import type { ApiResponse, Docente, Paginado } from "@/types";

type DocentesResponse = ApiResponse<Paginado<Docente>>;

/**
 * Adaptador de entrada HTTP: traduce request -> caso de uso -> response. Sin lógica de negocio.
 *
 *   GET /api/docentes?q=&departamento=&especialidad=&page=&pageSize=
 *   respuesta: ApiResponse<Paginado<Docente>>   (tipos en src/types)
 *
 * Es la PLANTILLA para los demás endpoints: parser de query -> caso de uso -> mapeo de errores.
 */
export async function GET(request: Request) {
  try {
    const query = parseDocentesQuery(new URL(request.url).searchParams);
    const data = await getListarDocentes().execute(query);
    return NextResponse.json<DocentesResponse>({ success: true, data });
  } catch (err) {
    if (err instanceof InvalidQueryError) {
      return NextResponse.json<DocentesResponse>({ success: false, error: err.message }, { status: 400 });
    }
    // Nunca se devuelve el error interno: puede contener detalles de SQL o rutas.
    console.error("[api/docentes]", err);
    return NextResponse.json<DocentesResponse>(
      { success: false, error: "No se pudo obtener el directorio docente. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
