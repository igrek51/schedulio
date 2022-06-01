.PHONY: deploy build run setup test

setup:
	python3.8 -m venv venv &&\
	. venv/bin/activate &&\
	pip install --upgrade pip setuptools &&\
	pip install -r requirements.txt -r requirements-dev.txt &&\
	python setup.py develop
	@echo Activate your venv: . venv/bin/activate


build:
	COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -f docker-compose.yaml build

run-docker: build
	echo "Working on local modifiable copy"
	mkdir -p .volumes
	cp -r db .volumes/
	docker-compose up
	docker-compose rm -f schedulio

run-django:
	python -u schedulio/djangoapp/manage.py runserver 0.0.0.0:8000 --noreload

run-fastapi:
	python -m schedulio run

run: run-fastapi

test:
	cd tests &&\
	python -m pytest -vv --tb=short -ra $(test)


recreate-db:
	rm -f db/schedulio.sqlite
	python schedulio/djangoapp/manage.py makemigrations djangoapp
	python schedulio/djangoapp/manage.py migrate
	python schedulio/djangoapp/manage.py createsuperuser

add-migration:
	python schedulio/djangoapp/manage.py makemigrations djangoapp
	python schedulio/djangoapp/manage.py migrate


frontend-setup:
	cr frontend && make setup

frontend-run:
	cd frontend && make run

frontend-build:
	cd frontend && make build


deploy: build
	cd deploy && \
	ansible-playbook -i inventory.yaml deploy-playbook.yaml

deploy-with-volumes: build
	cd deploy && \
	ansible-playbook -i inventory.yaml deploy-playbook.yaml --extra-vars "copy_volumes=true"
