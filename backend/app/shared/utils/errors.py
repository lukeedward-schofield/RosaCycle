import traceback

class ApiError(Exception):
    status_code = 400

    def __init__(self, message, status_code=None):
        super().__init__(message)
        self.message = message
        if status_code is not None:
            self.status_code = status_code


class NotFoundError(ApiError):
    status_code = 404


class ConflictError(ApiError):
    status_code = 409


class ForbiddenError(ApiError):
    status_code = 403


class ValidationError(ApiError):
    status_code = 422


def register_error_handlers(app):
    @app.errorhandler(ApiError)
    def handle_api_error(err):
        return {"error": err.message}, err.status_code

    @app.errorhandler(404)
    def handle_404(err):
        return {"error": "Not found."}, 404



    @app.errorhandler(500)
    def handle_500(err):
        traceback.print_exc()
        app.logger.exception("Unhandled exception")
        return {"error": "Internal server error."}, 500
