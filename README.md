# Schedulio

Schedulio lets you plan your periodic events continuously

## Setup

```bash
make setup # setup virtualenv and install dependencies
. venv/bin/activate # activate virtualenv
```

## Running

Run on localhost:
```
make run
```

and visit http://127.0.0.1:8000.

You can also run it inside a local docker container:
```
make run-docker
```

## Database Management

Visit http://127.0.0.1:8000/admin endpoint to access administration panel and manage data models.
In first place, reset the database and setup your admin account with:

```bash
make recreate-db
```

## Tech stack

- **Python 3.8**
- **Fastapi** & **Uvicorn** - serving API
- **Django** - managing data models
- **SQLite** - storing data
- [**nuclear**](https://github.com/igrek51/nuclear) - logging and error handling
- **Docker**
- **React** & **Typescript** - frontend app
- **Material UI** - component library

## Testing

Run unit tests with:

```bash
make test
```
