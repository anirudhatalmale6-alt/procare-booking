# ProCare — Property Maintenance Booking

A clean, modern, minimalist booking website for property managers (hotels, resorts, residential, commercial) to reserve maintenance & facilities services online.

**Live demo:** https://anirudhatalmale6-alt.github.io/procare-booking/

## Pages
- `index.html` — Homepage (hero, services, how-it-works, property types, features)
- `booking.html` — Booking flow: real-time availability calendar → slot selection → details → instant confirmation
- `admin.html` — Admin panel: dashboard, bookings, services CMS, time-slot editor

## Highlights in this demo
- **Real-time availability calendar** — open days flagged, past/full days disabled
- **No double-booking** — a booked slot is instantly blocked for that service + date
- **Services CMS** — create/edit services, pricing, duration, property availability, active/hidden
- **Confirmation flow** — on-screen confirmation + simulated email to client & team
- **Fully responsive** — desktop, tablet, mobile
- **Fast & SEO-ready** — no heavy frameworks, semantic markup, meta tags

## Note on the demo
This front-end demo uses the browser's `localStorage` to simulate the backend (services, bookings, double-booking checks) so the whole flow is clickable without a server. In the production build this layer is replaced by a real API + database, and confirmation emails are sent for real. The UI, flow and admin panel stay the same.

Sample services/pricing are placeholders — all editable from the admin panel.
