function timeFormat(input) {
	return input.format('HH:mm');
}

function isoDate(input) {
	// format the date
	// because 0-index months are a GREAT idea

	//var mo = Math.abs(input.getMonth() + 1);
	//var da = Math.abs(input.getDate());
	//return input.getFullYear() + '-' + (mo < 10 ? '0' + mo : mo) + '-' + (da < 10 ? '0' + da : da);
	return input.format('YYYY-MM-DD');
}

function parseTimeDelta(input) {
	// duration format is HH:MM:SS
	// return number of minutes
	var toks = input.split(':');
	
	return Math.abs(60 * toks[0]) + Math.abs(toks[1]) + Math.abs(toks[2] / 60);
}

$(document).bind("mobileinit", function(){
	$.mobile.ajaxEnabled = false;
});

$('#scheduleMain').live('pageinit', function(evt) {
	$.mobile.loading('show', {text: 'Loading the schedule...', textVisible: true});
	
	try {
		var schedule_req = $.ajax('./schedule.json', { async: false });
		var schedule_raw = JSON.parse(schedule_req.responseText);
	} catch (ex) {
		$.mobile.loading('hide');
		$('#days').empty();
		$('#scheduleContainer').text('Sorry, schedule.json could not load :(');
		return;
	}
	
	$('#scheduleContainer').empty().trigger('destroy').append(
		$('<ul>').attr({'data-role': 'listview', 'id': 'scheduleList'}).addClass('ui-listview')
	);

	
	var schedule = Array();
	$.each(schedule_raw, function(i, e) {
		// reformat the object in to something that is a bit more readable
		schedule.push({
			'description': e.Description,
			'id': e.Id,
			// wat, why is there even spaces
			'room': e['Room Name'],
			'name': e.Title,
			// no tzinfo on the start time, wat
			'start': moment(e.Start.replace(' ', 'T')),
			'presenter': e.Presenters,
			'uri': e.URL,
			'durationMins': parseTimeDelta(e.Duration)

		});


		//$('#scheduleList').append(
		//	$('<li>').text(
	});


	// now determine whether to show a date list or the actual info
	if (location.search.length >= 8) {

		var day = moment(location.search.substr(1, 10));

		// select a particular date
		// parse the date
		schedule.sort(function(a, b){
			if (a.start < b.start)
				return -1;

			if (a.start > b.start)
				return 1;

			// items are at same time, sort by room
			if (a.room < b.room)
				return -1;

			if (a.room > b.room)
				return 1;

			// shouldn't get here, but no big deal
			return 0;
		});

		$('#title').text(day.format('ddd do MMMM YYYY'));

		day = isoDate(day);

		//alert(day);
		var lastTime = null;
		$.each(schedule, function(i, e) {
			if (isoDate(e.start) != day) {
				// continue
				return;
			}

			if (timeFormat(e.start) != lastTime) {
				lastTime = timeFormat(e.start);
				$('#scheduleList').append(
					$('<li>').attr('data-role', 'list-divider').text(timeFormat(e.start))
				);
			}

			var endTime = e.start.add('minutes', e.durationMins);
			var label = e.room + ': ' + e.name + ' ' + (e.presenter ? '- ' + e.presenter : '') + ' (until ' + timeFormat(endTime) + ')';
			if (e.uri == null) {
				var item = $('<li>').attr('href', e.uri).text(label);
			} else {
				var item = $('<li>').append($('<a>').attr({'href': e.uri, 'rel': 'external'}).text(label));
			}
		
			$('#scheduleList').append(item	);
		});
	} else if (location.search.substr(1, 3) == 'wat') {
		$('#scheduleContainer').empty().append(
			$('<p>').text(
				'This is an unofficial service using data parsed from LCA\'s JSON calendar feed.  This information may not be current -- it is designed to be dropped onto Zookeepr later (so UI is all in Javascript).  Please direct feedback to micolous on #linux.conf.au.'
			)
		).append(
			$('<p>').append(
				$('<a>').attr({
					'href': 'https://github.com/micolous/lca-mobile-programme',
					'rel': 'external'
				}).text('Git repository')
			)
		);
	} else {
		// select date
		var dates = new Array();
		$.each(schedule, function(i, e) {
			// format the date to ISO
			fdate = isoDate(e.start);

			if (dates.indexOf(fdate) == -1) {
				// not in list, add
				dates.push(fdate);
			}

		});

		dates.sort();

		// now print the list of dates
		$.each(dates, function(i, e) {
			$('#scheduleList').append(
				$('<li>').append(
					$('<a>').attr({'href': '?' + e, 'data-ajax': 'false'}).text(moment(e).format('dddd, do MMMM YYYY'))
				)
			)
		});

		$('#scheduleList').append(
			$('<li>').append(
				$('<a>').attr({'href': '?wat', 'data-ajax': 'false'}).text('About / Help')
			)
		);

	}



	$('#scheduleContainer').trigger('create');
	$.mobile.loading('hide');

});

