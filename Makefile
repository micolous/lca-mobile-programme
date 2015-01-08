all: schedule.json

schedule.json:
	./update_schedule.sh

devserver:
	python -m SimpleHTTPServer
