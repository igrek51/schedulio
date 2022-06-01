.PHONY: build run

run:
	FORCE_COLOR=true BROWSER=none npm start | cat

build: build-copy
	npm run build

build-copy:
	rm -rf ../static/react
	cp -r build ../static/react
