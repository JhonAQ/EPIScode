import { NextResponse } from "next/server";
import { getRegistrarColaboracion } from "@/server/composition/container";
import { parseColaboracionRequest } from "@/server/interface/http/colaboracion-request";
import type { ErroresColaboracion } from "@/server/interface/http/colaboracion-request";
import type { ApiResponse } from "@/types";

type ColaboracionResponse = ApiResponse<{ mensaje: string }> & { errores?: ErroresColaboracion };

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ColaboracionResponse>(
      { success: false, error: "Revisa los datos del formulario.", errores: { formulario: "Envía un JSON válido." } },
      { status: 400 },
    );
  }

  const resultado = parseColaboracionRequest(body);
  if (!resultado.valido) {
    return NextResponse.json<ColaboracionResponse>(
      { success: false, error: "Revisa los datos del formulario.", errores: resultado.errores },
      { status: 400 },
    );
  }

  try {
    await getRegistrarColaboracion().execute(resultado.solicitud);
    return NextResponse.json<ColaboracionResponse>(
      { success: true, data: { mensaje: "Tu solicitud fue recibida." } },
      { status: 201 },
    );
  } catch {
    // Evita registrar datos personales o exponer detalles internos.
    return NextResponse.json<ColaboracionResponse>(
      { success: false, error: "No se pudo registrar tu solicitud. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
