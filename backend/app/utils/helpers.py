from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import func
from sqlalchemy.orm import Query


def paginate_query(query: Query, page: int = 1, size: int = 20) -> Tuple[List[Any], int]:
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    return items, total


def build_filter_query(query: Query, model, filters: Dict[str, Any]) -> Query:
    for key, value in filters.items():
        if value is None or not hasattr(model, key):
            continue
        column = getattr(model, key)
        if isinstance(value, str) and value.startswith("%") and value.endswith("%"):
            query = query.filter(column.ilike(value))
        elif isinstance(value, list):
            query = query.filter(column.in_(value))
        else:
            query = query.filter(column == value)
    return query


def calculate_pagination_meta(total: int, page: int, size: int) -> Dict[str, int]:
    pages = (total + size - 1) // size
    return {
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
    }
