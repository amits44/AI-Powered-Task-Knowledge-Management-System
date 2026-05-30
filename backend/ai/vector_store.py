import os
import json
import faiss
import numpy as np
from typing import List, Dict, Any, Tuple

FAISS_INDEX_PATH = "faiss_index/index.bin"
METADATA_PATH = "faiss_index/metadata.json"

class VectorStore:
    def __init__(self):
        self.index: faiss.Index | None = None
        self.metadata: List[Dict[str, Any]] = []
        self._load()

    def _load(self):
        if os.path.exists(FAISS_INDEX_PATH) and os.path.exists(METADATA_PATH):
            self.index = faiss.read_index(FAISS_INDEX_PATH)
            with open(METADATA_PATH, "r") as f:
                self.metadata = json.load(f)

    def _save(self):
        os.makedirs(os.path.dirname(FAISS_INDEX_PATH), exist_ok=True)
        faiss.write_index(self.index, FAISS_INDEX_PATH)
        with open(METADATA_PATH, "w") as f:
            json.dump(self.metadata, f)

    def add(self, embeddings: np.ndarray, metadata_list: List[Dict[str, Any]]) -> None:
        if self.index is None:
            dim = embeddings.shape[1]
            self.index = faiss.IndexFlatIP(dim) 

        faiss.normalize_L2(embeddings)
        self.index.add(embeddings)
        self.metadata.extend(metadata_list)
        self._save()

    def search(self, query_vec: np.ndarray, top_k: int = 5) -> List[Tuple[Dict, float]]:
        if self.index is None or self.index.ntotal == 0:
            return []
        faiss.normalize_L2(query_vec)
        scores, indices = self.index.search(query_vec, min(top_k, self.index.ntotal))

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue
            results.append((self.metadata[idx], float(score)))
        return results

    def remove_by_document(self, document_id: int) -> None:
        keep = [m for m in self.metadata if m["document_id"] != document_id]
        if not keep:
            self.index = None
            self.metadata = []
            self._save()
            return

        self.metadata = keep
        self._save()

vector_store = VectorStore()