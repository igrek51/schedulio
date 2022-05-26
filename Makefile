.PHONY: deploy build run setup test

setup:
	python3.8 -m venv venv &&\
	. venv/bin/activate &&\
	pip install --upgrade pip setuptools &&\
	pip install -r requirements.txt &&\
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

run:
	python -u schedulio/main.py run
