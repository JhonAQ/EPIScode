import type { CursoMalla } from "@/types";

export type TipoProblemaMalla =
  | "CODIGO_DUPLICADO"
  | "PRERREQUISITO_INEXISTENTE"
  | "PRERREQUISITO_SEMESTRE_INVALIDO"
  | "CICLO_DETECTADO";

export interface ProblemaMalla {
  codigo: string;
  tipo: TipoProblemaMalla;
  mensaje: string;
}

/**
 * Función pura de dominio: valida la coherencia y reglas de integridad de la malla curricular.
 *
 * Reglas evaluadas:
 * 1. CODIGO_DUPLICADO: Códigos que aparecen más de una vez en la lista de cursos.
 * 2. PRERREQUISITO_INEXISTENTE: Prerrequisitos que no existen en la malla.
 * 3. PRERREQUISITO_SEMESTRE_INVALIDO: Prerrequisitos en el mismo semestre o posterior.
 * 4. CICLO_DETECTADO: Dependencias circulares (directas, indirectas o autorreferencias).
 */
export function validarMalla(cursos: readonly CursoMalla[]): ProblemaMalla[] {
  const problemas: ProblemaMalla[] = [];

  // 1. Detección de códigos duplicados
  const conteoCodigos = new Map<string, number>();
  for (const curso of cursos) {
    conteoCodigos.set(curso.codigo, (conteoCodigos.get(curso.codigo) ?? 0) + 1);
  }

  for (const [codigo, cantidad] of conteoCodigos) {
    if (cantidad > 1) {
      problemas.push({
        codigo,
        tipo: "CODIGO_DUPLICADO",
        mensaje: `El código "${codigo}" está duplicado en la malla curricular (${cantidad} ocurrencias).`,
      });
    }
  }

  // Mapa de referencia para consulta de prerrequisitos (primera ocurrencia)
  const porCodigo = new Map<string, CursoMalla>();
  for (const curso of cursos) {
    if (!porCodigo.has(curso.codigo)) {
      porCodigo.set(curso.codigo, curso);
    }
  }

  // 2 y 3. Validación de prerrequisitos inexistentes y semestres inválidos
  for (const curso of cursos) {
    for (const prerreqCodigo of curso.prerrequisitos) {
      const prerreq = porCodigo.get(prerreqCodigo);
      if (!prerreq) {
        problemas.push({
          codigo: curso.codigo,
          tipo: "PRERREQUISITO_INEXISTENTE",
          mensaje: `El curso "${curso.codigo}" tiene como prerrequisito "${prerreqCodigo}", que no existe en la malla curricular.`,
        });
      } else if (prerreq.semestre >= curso.semestre) {
        problemas.push({
          codigo: curso.codigo,
          tipo: "PRERREQUISITO_SEMESTRE_INVALIDO",
          mensaje: `El curso "${curso.codigo}" (semestre ${curso.semestre}) tiene como prerrequisito "${prerreqCodigo}" (semestre ${prerreq.semestre}), el cual no pertenece a un semestre anterior.`,
        });
      }
    }
  }

  // 4. Detección de ciclos mediante DFS con pila de recursión
  const estado = new Map<string, "BLANCO" | "GRIS" | "NEGRO">();
  for (const codigo of porCodigo.keys()) {
    estado.set(codigo, "BLANCO");
  }

  const cursosEnCiclo = new Set<string>();
  const stack: string[] = [];

  function dfs(codigo: string) {
    estado.set(codigo, "GRIS");
    stack.push(codigo);

    const curso = porCodigo.get(codigo);
    if (curso) {
      for (const prerreqCodigo of curso.prerrequisitos) {
        if (!porCodigo.has(prerreqCodigo)) continue;

        const estadoVecino = estado.get(prerreqCodigo);
        if (estadoVecino === "GRIS") {
          const index = stack.indexOf(prerreqCodigo);
          if (index !== -1) {
            for (const nodo of stack.slice(index)) {
              cursosEnCiclo.add(nodo);
            }
          }
        } else if (estadoVecino === "BLANCO") {
          dfs(prerreqCodigo);
        }
      }
    }

    stack.pop();
    estado.set(codigo, "NEGRO");
  }

  for (const codigo of porCodigo.keys()) {
    if (estado.get(codigo) === "BLANCO") {
      dfs(codigo);
    }
  }

  const reportadosCiclo = new Set<string>();
  for (const curso of cursos) {
    if (cursosEnCiclo.has(curso.codigo) && !reportadosCiclo.has(curso.codigo)) {
      reportadosCiclo.add(curso.codigo);
      problemas.push({
        codigo: curso.codigo,
        tipo: "CICLO_DETECTADO",
        mensaje: `El curso "${curso.codigo}" forma parte de una dependencia circular de prerrequisitos.`,
      });
    }
  }

  return problemas;
}
