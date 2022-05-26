from fastapi import FastAPI


def setup_endpoints(app: FastAPI):

    @app.get("/api/status")
    async def get_player_status():
        return {'status': 'ok'}
