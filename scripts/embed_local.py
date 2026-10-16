"""Protocolo: lista JSON de textos en stdin, matriz JSON de embeddings en stdout."""

import contextlib
import json
import os
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

# Configurar antes de importar Hugging Face. Nunca descargar ni buscar tokens.
os.environ["HF_HOME"] = str(ROOT / ".venv" / "huggingface")
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_HUB_DISABLE_IMPLICIT_TOKEN"] = "1"
os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"
os.environ["HF_HUB_DISABLE_PROGRESS_BARS"] = "1"


def main():
    sys.stdin.reconfigure(encoding="utf-8")
    sys.stdout.reconfigure(encoding="utf-8")
    texts = json.load(sys.stdin)
    if not isinstance(texts, list) or any(not isinstance(text, str) for text in texts):
        raise ValueError("Se esperaba una lista JSON de textos.")
    if sys.argv[1:] != [MODEL]:
        raise ValueError("Modelo local no permitido.")
    if not texts:
        print("[]")
        return

    # Librerías y diagnósticos nunca deben contaminar el protocolo JSON.
    with contextlib.redirect_stdout(sys.stderr):
        import numpy as np
        from sentence_transformers import SentenceTransformer

        model = SentenceTransformer(MODEL, device="cpu", local_files_only=True, token=False)
        vectors = model.encode(texts, batch_size=32, show_progress_bar=False)
        if vectors.shape != (len(texts), 384) or not np.isfinite(vectors).all():
            raise ValueError("El modelo debe devolver 384 números finitos por texto.")
    json.dump(vectors.tolist(), sys.stdout, allow_nan=False)
    sys.stdout.write("\n")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Embeddings locales: {type(error).__name__}: {error}", file=sys.stderr)
        sys.exit(1)
