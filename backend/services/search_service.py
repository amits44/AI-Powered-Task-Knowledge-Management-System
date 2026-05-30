from sqlalchemy.orm import Session
from typing import List

from ai.embedder import embed_query
from ai.vector_store import vector_store
from schema.document import SearchResponse, SearchResult
from services.activity_service import ActivityService


class SearchService:
    @staticmethod
    def search(db: Session, query: str, top_k: int, user_id: int) -> SearchResponse:
        query_vec = embed_query(query)
        raw_results = vector_store.search(query_vec, top_k=top_k)

        results: List[SearchResult] = [
            SearchResult(
                document_id=meta["document_id"],
                document_title=meta["document_title"],
                chunk=meta["chunk_text"],
                score=round(score, 4),
            )
            for meta, score in raw_results
        ]

        ActivityService.log(
            db, user_id, "search",
            {"query": query, "top_k": top_k, "results_count": len(results)},
        )

        return SearchResponse(query=query, results=results)