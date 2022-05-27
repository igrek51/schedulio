import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from nuclear.sublog import log, log_exception

from schedulio.djangoapp.asgi import application as django_app
from schedulio.api.dispatcher import AsgiDispatcher
from schedulio.api.schedule.endpoints import setup_endpoints
from schedulio.api.errors import EntityNotFound
from schedulio.api.views import setup_web_views


def run_server():
    port = 8000
    log.info(f'Starting HTTP server', addr=f'http://0.0.0.0:{port}')

    fastapi_app = creat_fastapi_app()
    dispatcher = AsgiDispatcher({
        '/admin': django_app,
        '/static/admin': django_app,
        '/dump': django_app,
    }, default=fastapi_app)

    uvicorn.run(app=dispatcher, host="0.0.0.0", port=port, log_level="debug")


def creat_fastapi_app() -> FastAPI:
    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    setup_endpoints(app)
    setup_web_views(app)

    @app.exception_handler(Exception)
    async def error_handler(request: Request, exc: Exception):
        log_exception(exc)
        return JSONResponse(
            status_code=500,
            content={'error': str(exc)},
        )

    @app.exception_handler(EntityNotFound)
    async def not_found_handler(request: Request, exc: EntityNotFound):
        log_exception(exc)
        return JSONResponse(
            status_code=404,
            content={'error': f"Not Found: {exc}"},
        )

    async def catch_exceptions_middleware(request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:
            log_exception(exc)
            return JSONResponse(
                status_code=500,
                content={'error': str(exc)},
            )

    app.middleware('http')(catch_exceptions_middleware)

    return app
