-- Directorio docente y planes de estudio. Los datos de ejemplo se cargan por separado.
CREATE TABLE IF NOT EXISTS malla_versiones (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  vigente BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX IF NOT EXISTS malla_versiones_una_vigente_idx
  ON malla_versiones (vigente) WHERE vigente;

-- El id es interno; el código visible puede cambiar entre versiones de malla.
CREATE TABLE IF NOT EXISTS cursos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS malla_curso (
  malla_id TEXT NOT NULL REFERENCES malla_versiones(id),
  curso_id TEXT NOT NULL REFERENCES cursos(id),
  codigo TEXT NOT NULL,
  creditos INTEGER NOT NULL CHECK (creditos > 0),
  semestre INTEGER NOT NULL CHECK (semestre BETWEEN 1 AND 10),
  tipo TEXT NOT NULL CHECK (tipo IN ('Obligatorio', 'General', 'Núcleo')),
  area_formativa TEXT NOT NULL,
  PRIMARY KEY (malla_id, curso_id),
  UNIQUE (malla_id, codigo)
);

CREATE TABLE IF NOT EXISTS prerrequisitos (
  malla_id TEXT NOT NULL,
  curso_id TEXT NOT NULL,
  prerrequisito_id TEXT NOT NULL,
  PRIMARY KEY (malla_id, curso_id, prerrequisito_id),
  FOREIGN KEY (malla_id, curso_id) REFERENCES malla_curso(malla_id, curso_id),
  FOREIGN KEY (malla_id, prerrequisito_id) REFERENCES malla_curso(malla_id, curso_id),
  CHECK (curso_id <> prerrequisito_id)
);

CREATE TABLE IF NOT EXISTS docentes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  cargo TEXT NOT NULL,
  grado TEXT NOT NULL,
  correo TEXT NOT NULL UNIQUE,
  foto_url TEXT,
  departamento TEXT NOT NULL,
  especialidades TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS docente_curso (
  docente_id TEXT NOT NULL REFERENCES docentes(id),
  malla_id TEXT NOT NULL,
  curso_id TEXT NOT NULL,
  PRIMARY KEY (docente_id, malla_id, curso_id),
  FOREIGN KEY (malla_id, curso_id) REFERENCES malla_curso(malla_id, curso_id)
);
