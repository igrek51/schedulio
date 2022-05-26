import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from nuclear.sublog import log, log_exception
from schedulio.api import models
from schedulio.api.endpoint.endpoints import setup_endpoints

from schedulio.api.views import setup_web_views
from .database import SessionLocal, engine


def run_server():
    fastapi_app = creat_fastapi_app()
    config = uvicorn.Config(app=fastapi_app, host="0.0.0.0", port=8000, log_level="debug")
    server = uvicorn.Server(config=config)
    log.info(f'Starting HTTP server', addr=f'http://0.0.0.0:{8000}')
    server.run()


def creat_fastapi_app() -> FastAPI:

    models.Base.metadata.create_all(bind=engine)
    
    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.mount("/static", StaticFiles(directory="static"), name="static")

    @app.exception_handler(Exception)
    async def error_handler(request: Request, exc: Exception):
        log_exception(exc)
        return JSONResponse(
            status_code=500,
            content={'error': str(exc)},
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

    setup_web_views(app)
    setup_endpoints(app)

    return app
