all: schedule.json

schedule.json:
	curl -o schedule.json http://linux.conf.au/programme/schedule/json

devserver:
	python -m SimpleHTTPServer

.PHONY: schedule.json devserver
