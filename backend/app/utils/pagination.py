from flask import request

DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100


def paginate_query(query):
    page = request.args.get("page", 1, type=int)
    page_size = request.args.get("page_size", DEFAULT_PAGE_SIZE, type=int)
    page = max(page, 1)
    page_size = min(max(page_size, 1), MAX_PAGE_SIZE)

    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
    }
