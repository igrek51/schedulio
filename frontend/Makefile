.PHONY: build run

setup:
	nvm install v16.15.0
	npm install
	. ./nvm-activate.sh

run:
	. ./nvm-activate.sh
	FORCE_COLOR=true BROWSER=none npm start | cat

build:
	. ./nvm-activate.sh &&\
	npm run build
	rm -rf ../static/react
	cp -r build ../static/react

build-in-docker:
	DOCKER_BUILDKIT=1 docker build -t frontend-builder:latest -f build.Dockerfile .

build-in-docker-replace: build-in-docker
	set -e ;\
	rm -rf ../static/react ;\
	ID=$$(docker create frontend-builder:latest) ;\
	echo $$ID ;\
	docker cp "$$ID:/build/build" ../static/react/ ;\
	docker rm -v $$ID ;\
