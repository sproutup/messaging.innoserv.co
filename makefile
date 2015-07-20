environment_name = develop
platform = docker
application_name = messaging
region = us-west-2
keypair = endurance
configuration = messaging
domain = sproutup-co


all: deploy

master:
	$(eval environment_name := master)

deploy: init
	eb deploy

init:
	eb init -r $(region) -p $(platform) -k $(keypair) $(environment_name)

recreate: terminate create

create: init
	eb create $(application_name)-$(environment_name) -c $(application_name)-$(environment_name)-$(domain) --cfg $(configuration)-$(environment_name)

terminate: init
	eb terminate $(application_name)-$(environment_name) --force

build:
	docker build -t $(application_name) .

rebuild: stop delete build run

stop:
	docker stop $(application_name)

restart: stop start

start:
	docker start $(application_name)

run:
	docker run -d -p 3000:3000 --name $(application_name) --env-file local-env.list $(application_name)

delete: init
	docker rm $(application_name)

local:
	export REDISURL="192.168.59.103"
	export REDISPORT=6379
	export S3BUCKET="sproutup-test-bucket"

config-save:
	eb config save $(configuration) --cfg $(configuration)

config:
	eb config $(configuration) --cfg $(configuration)

config-put:
	eb config put $(configuration)
