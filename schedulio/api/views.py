from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from schedulio.api.schedule import schemas

from schedulio.api.schedule.schedule import get_schedule_schema


def setup_web_views(app: FastAPI):
    app.mount("/static", StaticFiles(directory="static"), name="static")
    templates = Jinja2Templates(directory="templates")

    @app.get("/")
    async def home_page():
        return RedirectResponse("/schedule")

    @app.get("/schedule/{schedule_id}", response_class=HTMLResponse)
    def view_new_page(schedule_id: str, request: Request):
        schedule: schemas.Schedule = get_schedule_schema(schedule_id)
        return templates.TemplateResponse("schedule.html", {
            "request": request,
            "schedule": schedule,
        })
