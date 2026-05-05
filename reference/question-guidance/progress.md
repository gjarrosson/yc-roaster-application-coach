# Progress — "How far along are you?"

Also covers: time commitment, tech stack, previous batches, incubator participation.

---

## What YC is actually evaluating

This section is where YC calibrates velocity and commitment. They want to see that you're building fast, that everyone is serious about the company, and that you have a working product — not just a plan. The tech stack question is a reality check: vague or aspirational answers suggest the product isn't built yet. The "same idea as previous batch" question catches applicants who are reapplying without having changed anything meaningful.

---

## What strong answers contain

- Specific milestones with dates: "We launched a closed beta in February with 20 users; we opened public access in April"
- A working product that someone can use or has used
- Full-time commitment with a specific date: "both co-founders went full-time on March 1st"
- Named tech stack with real choices: "Next.js, Postgres on Supabase, deployed on Railway; Python FastAPI for the ML backend"
- Velocity signal: what changed in the last 30–60 days, not just current state
- If reapplying: a specific, substantive description of what changed ("last time we were pre-revenue; we now have 3 paying customers and have pivoted the ICP from SMBs to mid-market")
- If in another program: direct disclosure with the relevant terms

---

## What weak answers look like

- "We're still building the MVP" — no signal of what's been done
- "We've been working on this for 2 years part-time" — slow velocity, low commitment
- Tech stack described as "modern AI frameworks" or "cloud-based architecture" — aspirational, not real
- Progress described entirely as future plans ("we plan to ship X in Q3")
- "Our prototype is almost ready" — "almost" is doing a lot of work
- Timeline jumps from "we had the idea" to "we built a product" with nothing in between

---

## Probing questions to ask the founder

1. "What existed in this product 90 days ago vs. what exists today — specifically?"
2. "Is everyone on the team full-time? If not, what is the trigger for going full-time?"
3. "Tell me your tech stack: language, framework, database, hosting — name them all."
4. "What did you ship last week? Not plan — ship."
5. "If this is a reapplication: what specifically changed since last time, and how do you know it was the right change?"

---

## Evidence to request from the founder's local files

- **Git log**: `git log --oneline --since="90 days ago" --format="%ad %s" --date=short` — shows real commit velocity
- **package.json, requirements.txt, Cargo.toml, or equivalent** — names the actual tech stack
- **README or changelog** — describes what's been built
- **Any deployment config** (Dockerfile, vercel.json, fly.toml) — confirms the product is actually deployed somewhere

---

## Coaching note on the "almost ready" trap

"Almost ready" is a red flag phrase. If the MVP is almost ready, it's not ready — and YC knows the difference. Push the founder to describe what is actually working and usable today, even if limited. A working 10% of the product is more credible than a 90% complete product that nobody can use yet.
