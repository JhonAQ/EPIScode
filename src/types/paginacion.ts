/** Página de resultados. `page` empieza en 1. */
export interface Paginado<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
