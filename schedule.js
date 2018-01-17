/*
lca-mobile-programme - Mobile viewer for Symposion schedule JSON.
Copyright 2013-2018 Michael Farrell

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

var schedule = new Array();

function timeFormat(input) {
	return input.format('HH:mm');
}

function isoDate(input) {
	return input.format('YYYY-MM-DD');
}

function parseTimeDelta(input) {
	// duration format is HH:MM:SS
	// return number of minutes
	var toks = input.split(':');
	
	return Math.abs(60 * toks[0]) + Math.abs(toks[1]) + Math.abs(toks[2] / 60);
}

function beginPage() {
	$.mobile.loading('show', {text: 'Loading the schedule...', textVisible: true});
	$('#scheduleContainer').empty().trigger('destroy').append(
		$('<ul>').attr({'data-role': 'listview', 'id': 'scheduleList'}).addClass('ui-listview')
	);
}

function endPage() {
	$('#scheduleContainer').trigger('create');
	$.mobile.loading('hide');
}

function displaySchedule(date) {
	beginPage();
	
	var day = moment(date);

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

	$('#title').text(day.format('dddd Do MMMM YYYY'));

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

		var label = (e.room ? (e.room + ': ') : '') + e['name'] + ' ' + (e.presenter ? '- ' + e.presenter : '') + ' (until ' + timeFormat(e.end) + ')';
		if (e.description) {
			// show local description text
			var item = $('<li>').append($('<a>').bind('click', function(evt) {
				$('.descriptionPopup[data-event-id=' + e.id + ']')
					.popup('open', {
						positionTo: 'window',
						transition: 'pop',
						overlayTheme: 'b',
						theme: 'a',
						shadow: true,
					});
			}).text(label));
		} else {
			if (e.uri == null) {
				var item = $('<li>').text(label);
			} else {
				var item = $('<li>').append($('<a>').attr({'href': e.uri, 'rel': 'external'}).text(label));
			}
		}
		$('#scheduleList').append(item);
	});

	endPage();
}

function displayAbout() {
	beginPage();
	
	$('#scheduleContainer').empty().append(
		$('<p>').text(
			'This is an unofficial service using data parsed from LCA\'s JSON calendar feed.  This information may not be current -- it is designed to be dropped onto Symposion later (so UI is all in Javascript).  Please direct feedback to micolous on #linux.conf.au.'
		)
	).append(
		$('<p>').append(
			$('<a>').attr({
				'href': 'https://github.com/micolous/lca-mobile-programme/tree/lca2017',
				'rel': 'external'
			}).text('Git repository')
		)
	);
	
	endPage();
}

function displayDaySelector() {
	beginPage();
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
				$('<a>')
					.data('date', e)
					.bind('click', function(evt){
						displaySchedule($(this).data('date'));
					})
					.text(moment(e).format('dddd, Do MMMM YYYY'))
			)
		)
	});

	$('#scheduleList').append(
		$('<li>').append(
			$('<a>')
				.bind('click', displayAbout)
				.text('About / Help')
		)
	);

	$('#scheduleContainer').append(
		$('<p>').append(
			$('<img>').attr('src', 'images/qr.png')
		),
		$('<p>').append(
			$('<strong>').text('Did you know that LCA 2018\'s website is fairly mobile friendly this year? '),
      $('<a>')
        .attr('href', 'https://rego.linux.conf.au/schedule/')
        .text('Try it out!')
		),
		$('<p>').text('http://lcamp.micolous.id.au/')
	);
	
	$('#title').text('Unofficial LCA' + (moment(dates[0]).format('YYYY')) + ' Mobile Programme');
	endPage();
}

$(document).bind("mobileinit", function(){
	$.mobile.ajaxEnabled = false;
});

$(function(){
	beginPage();
	
	try {
		var schedule_req = $.ajax('./schedule.json?r=' + Math.random(), { async: false });
		var schedule_raw = JSON.parse(schedule_req.responseText);
	} catch (ex) {
		$.mobile.loading('hide');
		$('#days').empty();
		$('#scheduleContainer').text('Sorry, schedule.json could not load :(');
		return;
	}

	$('#descriptionContainer').trigger('destroy').empty();
	$.each(schedule_raw['schedule'], function(i, e) {
		// reformat the object in to something that is a bit more readable
		var authors = '';
		if (e.authors) {
			$.each(e.authors, function(ia, a) {
				if (ia > 0) {
					authors += ', ';
				}
			
				authors += a;
			});
		}
		
		if (e.kind == 'shortbreak') {
			// skip this item
			return true;
		}
		
		// Data normalisation is hard.
		// Lets play it by ear.
		// Display the Kind and Name by default (this means lots of data)
		// This is when we have no idea what is going on (miniconfs)
		var name = e.kind + ' - ' + e['name'];
		
		if (e.kind == 'talk' || e.kind == 'tutorial') {
			if (e['name'] == 'Slot') {
				// Empty talk slot, skip
				return true;
			}

			// Display only the Name
			// Most events are like this
			name = e['name'];
		}
		
		if (e['name'] == 'Slot') {
			// Display only the Kind
			// Food events are like this.
			name = e.kind;
		}
		
		e = {
			'description': e.abstract,
			'id': e.conf_key,
			'room': e.room,
			'name': name,
			'start': moment(e.start),
			'presenter': authors,
			'uri': e.conf_url,
			'end': moment(e.end)
		};
		
		schedule.push(e);

		// push event descriptions into dom popups
		if (e.description && (e.description != '')) {
			var descriptionDiv = $('<div>')
				.attr({
					'data-role': 'main',
					'data-theme': 'a',
				})
				.addClass('ui-content');

			var descriptionDialog = $('<div>')
				.attr({
					'data-role': 'popup',
					'data-event-id': e.id,
					'data-overlay-theme': 'b',
					'data-theme': 'a'
				})
				.addClass('descriptionPopup')
				.append($('<div>')
					.attr({
						'data-role': 'header',
						'data-theme': 'a'
					})
					.addClass('ui-corner-top')
					.append($('<h1>')
						.text(e.room + ': ' + e.name + ' ' + (e.presenter ? '- ' + e.presenter : '') + ' (until ' + timeFormat(e.end) + ')')
					)
				)
				.append(descriptionDiv)
				.append($('<div>')
					.attr({
						'data-role': 'controlgroup',
					})
					.append($('<a>')
						.attr({
							'data-role': 'button',
							'data-icon': 'back',
							'data-rel': 'back',
						})
						.text('Close')
					)
					.append($('<a>')
						.attr({
							'href': e.uri,
							'data-role': 'button',
							'rel': 'external',
							'target': '_blank',
							'data-icon': 'info'
						})
						.text('Read more...')
					)
				);

			$.each(e.description.split('\n'), function(i, line) {
				descriptionDiv.append(
					$('<p>').text(line)
				);
			});
			
			$('#descriptionContainer').append(descriptionDialog);
			descriptionDialog.trigger('create');
		}
	});

	$('#descriptionContainer').trigger('create');


	// now determine whether to show a date list or the actual info
	// For campatibility, still handle these query strings.
	if (location.search.length >= 8) {
		displaySchedule(location.search);
	} else if (location.search.substr(1, 3) == 'wat') {
		displayAbout();
	} else {
		displayDaySelector();
	}

	$('#btnHome')
		.attr('href', '#')
		.bind('click', displayDaySelector);

});

