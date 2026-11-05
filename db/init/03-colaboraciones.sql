-- Solicitudes enviadas desde el formulario de proyectos y colaboración.
CREATE TABLE IF NOT EXISTS solicitudes_colaboracion (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre TEXT NOT NULL CHECK (char_length(trim(nombre)) BETWEEN 1 AND 150),
  correo TEXT NOT NULL CHECK (char_length(trim(correo)) BETWEEN 1 AND 254),
  tipo_interes TEXT NOT NULL CHECK (tipo_interes IN ('investigacion', 'practicas', 'alianzas')),
  mensaje TEXT NOT NULL CHECK (char_length(trim(mensaje)) BETWEEN 1 AND 2000),
  fecha_recepcion TIMESTAMPTZ NOT NULL DEFAULT now(),
  estado TEXT NOT NULL DEFAULT 'nueva' CHECK (estado IN ('nueva', 'en revisión', 'atendida'))
);
