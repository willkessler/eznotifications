# This Is Not a Drill! Dashboard

<img src="./public/ThisIsNotADrill_cutout.png" width="250" height="250">

This package contains the client dashboard for the **This Is Not A
Drill!** (TINAD) notification system.

It was built on top of a Mantine + Vite template (see that README file
in this directory).

To use it, copy `.env_example` to `.env` and set the required
environment variables up to talk to the TINAD API.

Then you can start the dashboard up locally with `npm run dev` and
visit `localhost:5173`. The TINAD API must be up on port 5000 by
default, see `/packages/api/README.md` for details.
