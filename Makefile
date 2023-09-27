install:
	npm install

setup.up:
	docker build -t image-service .
	docker-compose up

setup.down:
	docker-compose down -v