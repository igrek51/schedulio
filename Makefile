.PHONY: deploy build run setup test

DOCKER_TAG ?= 1.0.0

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

frontend-build-in-docker:
	cd frontend && make build-in-docker-replace


push-to-registry: build
	docker login registry.gitlab.com
	docker tag schedulio:latest registry.gitlab.com/igrek51/schedulio/schedulio:latest
	docker push registry.gitlab.com/igrek51/schedulio/schedulio:latest

push-to-dockerhub: build
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
