export interface FeaturedEvent {
  title: string;
  dateLabel: string;
  venue: string;
  campus: string;
  /** Se completa cuando el equipo confirme la página o URL del evento. */
  href?: string;
}
