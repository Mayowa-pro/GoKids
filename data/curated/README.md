# Curated events

Events the site owner supplied directly, for example a library timetable. They use the same format as `data/scouted` (see that README) and go **live straight away** on the next deploy, without approval.

This folder is the source of truth: edit an entry here to change the live listing, or delete it to take the listing down.

- `stoke-libraries.json`: weekly children's sessions at Stoke-on-Trent libraries, from the council's Children's Activities page (October 2026). Fortnightly and monthly Saturday sessions aren't included because the page doesn't say which Saturdays they fall on.
- `family-hubs.json`: weekly sessions at Stoke-on-Trent Best Start Family Hubs (Abbey Hulton, Bentilee, Hanley Market, Normacot, Shelton, Tunstall Town Hall), from their Facebook timetables (October 2026).
- `blurton-halloween-spooktacular-2026.json`: Sparkle Surprize Halloween party at The Blurton Club, 27 October 2026, from a flyer a parent sent Mayowa (it was only shared on social media).
- `family-hubs-half-term-2026.json`: the Family Hubs' October 2026 half-term programme (26 to 30 October).

Each listing's web address is made from its title, venue and date (or weekday, for weekly sessions). On every deploy the site also removes listings that repeat another one (same event, same place, same day), and removes the sample events once real events are live.
