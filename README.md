# lca mobile programme #

Copyright 2013-2015 Michael Farrell <http://micolous.id.au/>.  Licensed under the same terms as Zookeepr itself (GPL-2).  Details in the file `COPYING`.

## About ##

After struggling with using linux.conf.au's programme web page on a mobile phone, I wrote this: a JavaScript-based mobile interface for reading Zookeepr JSON schedule files.

iCal feeds are nice, but calendaring apps are naïve -- they sort timetable elements using a "best fit" strategy, showing events in different locations in the same column.  Mobile calendaring apps are worse, they also are hard to read because they pack information too tight, and importing iCal files can lead to having many reminders come up -- one for each room!

Because this is entirely implemented in the browser, it should be theoretically easy to drop this on top of a Zookeepr instance and have it pull JSON directly from Zookeepr itself.  However due to cross-domain request policies, we have to include the schedule file directly (and it is included in this repository as `schedule.json`).

This software uses jQuery, jQuery Mobile and Moment.js.  Minified versions of their Javascript/CSS code is included for convienience.

It seems to work fine on Android and iOS devices.  However, there are still some issues with adding this to your home screen on iOS as a "web application".

Despite all the query strings, this application has no server-side dependancies and is entirely rendered by the client.
