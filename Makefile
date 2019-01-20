all: schedule.json

schedule.json:
	curl -o schedule.json https://lca2019.linux.org.au/schedule/conference.json

devserver:
	python -m SimpleHTTPServer

.PHONY: schedule.json devserver
