"""Diagnóstico local del truncamiento; no modifica la base ni llama a un LLM."""

import contextlib
import json
from pathlib import Path
import sys
import runpy

settings = runpy.run_path(str(Path(__file__).with_name("embed_local.py")))
MODEL, ROOT = settings["MODEL"], settings["ROOT"]


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    baseline = ROOT / "docs/evaluacion/recuperacion-baseline-128.json"
    if not baseline.exists():
        baseline = ROOT / "docs/evaluacion/recuperacion-mediciones.json"
    report = json.loads(baseline.read_text(encoding="utf-8"))
    chunks = report["corpus"]
    questions = report["measurements"]
    with contextlib.redirect_stdout(sys.stderr):
        import numpy as np
        from sentence_transformers import SentenceTransformer

        model = SentenceTransformer(MODEL, device="cpu", local_files_only=True, token=False)
        original_limit = model.max_seq_length
        positional_limit = model[0].auto_model.config.max_position_embeddings
        model.tokenizer.model_max_length = positional_limit
        token_counts = []
        for chunk in chunks:
            encoded = model.tokenizer(chunk["content"], add_special_tokens=True, truncation=False, return_offsets_mapping=True)
            word_position = chunk["content"].find("overlap")
            word_tokens = [index for index, (start, end) in enumerate(encoded["offset_mapping"])
                           if word_position >= 0 and start <= word_position < end]
            explanation = "para no perder el contexto en los cortes"
            explanation_start = chunk["content"].find(explanation)
            explanation_tokens = [index for index, (start, end) in enumerate(encoded["offset_mapping"])
                                  if explanation_start >= 0 and end > explanation_start
                                  and start < explanation_start + len(explanation)]
            token_counts.append({
                "source": chunk["source"], "chunkIndex": chunk["chunkIndex"],
                "tokensWithSpecials": len(encoded["input_ids"]),
                "truncatedAtOriginalLimit": len(encoded["input_ids"]) > original_limit,
                "overlapWordTokenIndices": word_tokens,
                "overlapVisibleAtOriginalLimit": bool(word_tokens) and max(word_tokens) < original_limit - 1,
                "explanationTokenIndices": explanation_tokens,
                "explanationFullyVisibleAtOriginalLimit": bool(explanation_tokens) and max(explanation_tokens) < original_limit - 1,
                "originalVisibleTail": model.tokenizer.decode(encoded["input_ids"][:original_limit - 1])[-140:],
            })
        comparisons = []
        for limit in sorted({original_limit, min(256, positional_limit), positional_limit}):
            model.max_seq_length = limit
            document_vectors = model.encode([chunk["content"] for chunk in chunks], show_progress_bar=False)
            query_vectors = model.encode([entry["question"] for entry in questions], show_progress_bar=False)
            scores = (query_vectors @ document_vectors.T) / (
                np.linalg.norm(query_vectors, axis=1)[:, None] * np.linalg.norm(document_vectors, axis=1)[None, :])
            measurements = []
            for entry, values in zip(questions, scores):
                order = np.argsort(-values)
                measurements.append({
                    "id": entry["id"], "question": entry["question"], "group": entry["group"],
                    "ranked": [{"source": chunks[int(index)]["source"],
                                "chunkIndex": chunks[int(index)]["chunkIndex"],
                                "score": float(values[index])} for index in order],
                })
            comparisons.append({"maxSeqLength": limit, "measurements": measurements})
        selected = next(item for item in comparisons if item["maxSeqLength"] == 256)
        overlap = next(item for item in selected["measurements"] if item["id"] == "R4")
        assert any(item["chunkIndex"] == 1 for item in overlap["ranked"][:4])
        assert max(item["tokensWithSpecials"] for item in token_counts) <= 256
    output = {"model": MODEL, "originalMaxSeqLength": original_limit,
              "maxPositionEmbeddings": positional_limit, "baselineCorpusHash": report["corpusHash"],
              "chunks": token_counts, "comparisons": comparisons, "llmCalls": 0}
    destination = ROOT / "docs/evaluacion/diagnostico-truncamiento.json"
    destination.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"originalMaxSeqLength": original_limit, "maxPositionEmbeddings": positional_limit,
                      "chunks": token_counts,
                      "overlapComparisons": [{"maxSeqLength": item["maxSeqLength"],
                                              "ranked": next(row["ranked"] for row in item["measurements"] if row["id"] == "R4")}
                                             for item in comparisons]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Diagnóstico fallido: {type(error).__name__}: {error}", file=sys.stderr)
        sys.exit(1)
