# Cove Movie Theater: website preview

A three-page preview site for Cove Movie Theater, Island Village, Ocho Rios, Jamaica, built by Code Canvas Consultants Ltd.

- `index.html`: home, with today's shows, this week's films, Cove Café, group visits and what's coming soon
- `showtimes.html`: day picker, ticket prices and the week at a glance
- `visit.html`: address, map, group enquiry form (opens WhatsApp) and common questions

## Updating the week's films

The whole listing lives in one place: the `WEEK` object at the top of `assets/site.js`. Change it each Wednesday and every page updates. Times are worked out in Jamaica time.

## Building

The three pages share a header and footer, kept in `build.py`:

```
python3 build.py
python3 -m http.server 8141
```

No dependencies and no build step beyond that. The site is plain HTML, CSS and JavaScript.

## Credits

Trailers play from the studios' and distributors' official YouTube channels. Film titles and artwork belong to their owners.
