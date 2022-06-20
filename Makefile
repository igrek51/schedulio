.PHONY: deploy build run setup test

DOCKER_TAG ?= 1.2.0

setup:
	python3 -m venv venv &&\
	. venv/bin/activate &&\
	pip install --upgrade pip setuptools &&\
	pip install -r requirements.txt -r requirements-dev.txt &&\
	python setup.py develop
	@echo Activate your venv:
	@echo . venv/bin/activate


build:
	COMPOSE_DOCKER_CLI_BUILD=1 DOCKER_BUILDKIT=1 docker-compose -f docker-compose.yaml build \
		--build-arg GIT_VERSION="`git describe --long --tags --dirty --always`" \
		--build-arg DOCKER_TAG="$(DOCKER_TAG)"

build-frontend:
	cd frontend && make build

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

run-frontend:
	cd frontend && make run

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
	cd frontend && make setup

frontend-run:
	cd frontend && make run

frontend-build:
	cd frontend && make build

frontend-build-in-docker:
	cd frontend && make build-in-docker-replace


push-to-registry: build
	docker login ghcr.io
	docker tag schedulio:latest ghcr.io/igrek51/schedulio:latest
	docker push ghcr.io/igrek51/schedulio:latest

push-to-dockerhub-latest: build
	docker login
	docker tag schedulio:latest igrek52/schedulio:latest
	docker push igrek52/schedulio:latest

push-to-dockerhub-tag: build
	docker login
	docker tag schedulio:latest igrek52/schedulio:$(DOCKER_TAG)
	docker push igrek52/schedulio:$(DOCKER_TAG)


deploy-from-tar: build
	cd deploy && \
	ansible-playbook -i inventory.yaml playbook-deploy.yaml

deploy-with-volumes: build
	cd deploy && \
	ansible-playbook -i inventory.yaml playbook-deploy.yaml --extra-vars "copy_volumes=true"

deploy-from-registry: push-to-registry
	cd deploy && \
	ansible-playbook -i inventory.yaml playbook-registry-deploy.yaml

deploy-volumes: push-to-registry
	cd deploy && \
	ansible-playbook -i inventory.yaml playbook-copy-volumes.yaml

deploy: deploy-from-registry


mkdocs-local:
	python -m mkdocs serve

mkdocs-push:
	python -m mkdocs gh-deploy --force
