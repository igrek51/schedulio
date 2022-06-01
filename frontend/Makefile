.PHONY: build run

setup:
	nvm install v16.15.0
	npm install

run:
	FORCE_COLOR=true BROWSER=none npm start | cat

build:
	npm run build
	rm -rf ../static/react
	cp -r build ../static/react
