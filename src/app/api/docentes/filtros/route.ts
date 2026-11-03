import { NextResponse } from "next/server";
import type { FiltrosDocentes } from "@/server/application/ports/docente-repository";
import { getListarFiltrosDocentes } from "@/server/composition/container";
import type { ApiResponse } from "@/types";

export async function GET() {
  try {
    const data = await getListarFiltrosDocentes().execute();
    return NextResponse.json<ApiResponse<FiltrosDocentes>>({ success: true, data });
  } catch (error) {
    console.error("[api/docentes/filtros]", error);
    return NextResponse.json<ApiResponse<FiltrosDocentes>>(
      { success: false, error: "No se pudieron obtener los filtros de docentes. Intenta de nuevo." },
      { status: 500 },
    );
  }
}
