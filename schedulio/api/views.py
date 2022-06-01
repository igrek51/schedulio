from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse


def setup_web_views(app: FastAPI):

    @app.get("/")
    async def _index():
        return FileResponse('static/react/index.html')

    @app.get("/schedule/{schedule_id}")
    async def _index_on_schedule(schedule_id: str):
        return FileResponse('static/react/index.html')

    @app.get("/s/{schedule_id}")
    async def _index_on_schedule(schedule_id: str):
        return FileResponse('static/react/index.html')

    app.mount("/", StaticFiles(directory="static/react/"), name="static_react")
