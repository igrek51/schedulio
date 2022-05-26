from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles


def setup_web_views(app: FastAPI):
    app.mount("/static", StaticFiles(directory="static"), name="static")
    templates = Jinja2Templates(directory="templates")

    @app.get("/")
    async def home():
        return RedirectResponse("/new")

    @app.get("/new", response_class=HTMLResponse)
    async def view_new(request: Request):
        return templates.TemplateResponse("new.html", {
            "request": request,
        })
