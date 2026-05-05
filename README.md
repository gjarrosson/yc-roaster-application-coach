# YC Application Coach

A Claude Code skill that helps you write a stronger YC application by acting as the kind of brutal, specific coach a YC alum would be if they had unlimited time for you.

Built by Lobster Capital, the team behind [YC Roaster](https://ycroaster.com).

---

## What this is

A coach. It walks you through every YC application question one at a time. It pushes back when your answers are vague, asks for evidence from your codebase and customer notes, and refines what you wrote so it sounds like you on your sharpest day.

## What this isn't

A generator. This skill will not write your YC application for you, and it will refuse if you ask. Generated applications are easy for YC partners to spot and they hurt your chances. The point of this skill is to help you say what you actually mean, with the specifics that make YC partners lean in.

---

## Why use this instead of just asking Claude or ChatGPT directly

Three things make this different:

**It uses your local context.** Your README, your pitch deck if you have one, your analytics exports, your customer interview notes, your actual code. The skill grounds every answer in real evidence from your project, not in vibes.

**It's built on real YC application data.** The reference material distills patterns from hundreds of YC applications reviewed by real YC alumni through YC Roaster. It knows the difference between answers that get interviews and answers that get rejected.

**It pushes back.** A generic LLM will help you sound polished. This one is tuned to demand specifics, kill hedging language, and call out claims you can't defend in person.

---

## Installation

From your project's root directory:

```bash
mkdir -p .claude/skills
cp -r path/to/yc-application-coach .claude/skills/
```

Or clone directly into your skills folder:

```bash
git clone https://github.com/gjarrosson/yc-roaster-application-coach .claude/skills/yc-application-coach
```

---

## Usage

In your project directory, start Claude Code and say something like:

> "Help me with my YC application"

or

> "I'm applying to YC W27, walk me through it"

Claude will detect the skill and start working through the application with you, one question at a time. Plan for 60–120 minutes for a first pass. You can stop and resume across multiple sessions.

At the start of a session, the skill will run `scripts/prepare_yc_context.py` automatically to gather context from your project. You can also run it manually first:

```bash
python .claude/skills/yc-application-coach/scripts/prepare_yc_context.py
```

Requires Python 3.10+ with no external dependencies.

---

## What you'll need

You don't need everything below, but the more you have in your project, the better the coaching gets:

- A README that describes what your company does
- A pitch deck (any format — PDF, markdown, or in the repo)
- Customer interview notes, even rough ones
- Analytics exports (CSV or JSON) if you have any traction
- Your actual codebase

The skill works fine with just a README. It works much better with all of the above.

---

## What you'll get

A markdown file at `yc-application-draft.md` in your project root containing your full, refined application. You own this file. Iterate on it as long as you want. When you're ready, paste the answers into YC's official application form.

---

## How a session works

1. The skill runs the context script to understand your project
2. You choose which section to start with, or go through them in order
3. For each YC question: paste your draft, the skill probes the weakest part, you answer, it produces a refined version
4. At the end: all confirmed answers compile into `yc-application-draft.md` at your project root
5. You read the draft out loud, identify anything you can't defend in a YC interview, and revise

Typical time per section: 10–20 minutes if you engage seriously with the probing questions.

---

## After you finish

Two things worth doing before you submit:

**1. Read your full application out loud.** Every claim should be something you can defend in a 10-minute YC interview with no notes. If a sentence sounds smooth but you can't back it up, cut it.

**2. Get a real human to review it.** Submit your draft to [YC Roaster](https://ycroaster.com) for free feedback from an actual YC alum. The skill is a coach. The website is the second opinion.

---

## Honest disclaimers

This skill does not guarantee acceptance into YC. Nothing does. Acceptance rates are around 1% and depend on factors no application can fix — team, traction, timing, market. What this skill does is help you avoid the avoidable mistakes that get otherwise good companies rejected.

**The skill is offline-only.** None of your application content is sent to Lobster Capital or stored anywhere outside your machine. If you later submit to YC Roaster, that's a separate decision and a separate flow.

Question wording is based on YC's current application form and may shift between batches. Check the live YC application for the most up-to-date wording before submitting.

This skill is not affiliated with Y Combinator.

---

## Built by

Lobster Capital is a seed-stage venture firm focused exclusively on Y Combinator companies. We've worked with hundreds of YC founders and built this skill as a way to give pre-YC founders the kind of help they usually can't get until after they're already in the batch.

Questions, feedback, or interest in working with Lobster Capital: [admin@ycroaster.com](mailto:admin@ycroaster.com)

If this helped you get into YC, we'd love to hear about it.

---

## License

MIT
