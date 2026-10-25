/** Minúsculas y sin tildes, para comparar texto del usuario sin importar cómo lo escriba. */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
