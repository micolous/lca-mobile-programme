# lca mobile programme

Copyright 2013-2020 Michael Farrell <http://micolous.id.au/>.  Licensed under GPLv2+.  Details in the file `COPYING`.

## This project is no longer maintained

Now that linux.conf.au and PyConAU have had a mobile-friendly website for _at least_ the last four years (2017-2020), I don't see any point of keeping this running.

**This is a great problem to have! :)**

The current codebase in the `lca2020` branch works with Symposion (and some things that pretend to be it).

If you're interested in working with Zookeepr, check out the `master` branch.   There are some other bug fixes and updates that _aren't_ on that branch, because it hasn't been used in a long while.

## Old README

### The problem

After struggling with using linux.conf.au 2013's programme web page on a mobile phone, I wrote this: a JavaScript-based mobile interface for reading Zookeepr (now Symposion) JSON schedule files.

Fast forward to 2018... the conference now has a mobile friendly schedule!

### Alternatives

iCal feeds are nice, but most calendaring apps are naïve -- they sort timetable elements using a "best fit" strategy, showing events in different locations in the same column.

Mobile calendaring apps are worse, they also are hard to read because they pack information too tight, and importing iCal files can lead to having many reminders come up -- one for each room!

### The implementation

Because this is entirely implemented in the browser, it should be theoretically easy to drop this on top of a Zookeepr instance and have it pull JSON directly from Zookeepr itself.  However due to cross-domain request policies, we have to include the schedule file directly (and it is included in this repository as `schedule.json`).

This software uses jQuery, jQuery Mobile and Moment.js.  Minified versions of their Javascript/CSS code is included for convenience.

It seems to work fine on Android and iOS devices.  However, there are still some issues with adding this to your home screen on iOS as a "web application".

Despite all the query strings, this application has no server-side dependancies and is entirely rendered by the client.
