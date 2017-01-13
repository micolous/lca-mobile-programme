all: schedule.json

schedule.json:
	curl -o schedule.json https://linux.conf.au/schedule/conference.json

devserver:
	python -m SimpleHTTPServer

.PHONY: schedule.json devserver
