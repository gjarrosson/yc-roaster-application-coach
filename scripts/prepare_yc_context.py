#!/usr/bin/env python3
"""
prepare_yc_context.py

Gathers context from the founder's local project to help the YC Application Coach
skill understand what has been built. Run this at the start of a coaching session.

Usage:
    python scripts/prepare_yc_context.py

Output: prints a structured context summary to stdout.
Errors: each section fails gracefully and reports what it found vs. not found.
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime, timedelta


ROOT = Path.cwd()
OUTPUT_SECTIONS = []
FOUND = []
NOT_FOUND = []


def section(title: str, content: str) -> None:
    OUTPUT_SECTIONS.append(f"## {title}\n\n{content.strip()}")


def found(item: str) -> None:
    FOUND.append(item)


def not_found(item: str) -> None:
    NOT_FOUND.append(item)


def run_cmd(cmd: list[str], cwd: Path = ROOT) -> str | None:
    try:
        result = subprocess.run(
            cmd, cwd=cwd, capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
        return None
    except (subprocess.TimeoutExpired, FileNotFoundError, OSError):
        return None


# ── 1. README ─────────────────────────────────────────────────────────────────

def gather_readme() -> None:
    candidates = ["README.md", "README.txt", "readme.md", "Readme.md"]
    for name in candidates:
        path = ROOT / name
        if path.exists():
            try:
                text = path.read_text(encoding="utf-8", errors="replace")
                lines = text.splitlines()
                # First 80 lines or full file if shorter
                preview = "\n".join(lines[:80])
                if len(lines) > 80:
                    preview += f"\n\n... ({len(lines) - 80} more lines not shown)"
                found(f"README ({path.name}, {len(lines)} lines)")
                section("README", preview)
                return
            except OSError:
                pass
    not_found("README (no README.md or README.txt found)")
    section("README", "_No README found in project root._")


# ── 2. Pitch / narrative docs ─────────────────────────────────────────────────

def gather_pitch_docs() -> None:
    pitch_patterns = [
        "pitch*", "deck*", "narrative*", "investor*", "fundraising*",
        "PITCH*", "DECK*", "overview*", "one-pager*",
    ]
    text_extensions = {".md", ".txt", ".rst"}
    binary_extensions = {".pdf", ".pptx", ".key", ".docx", ".doc"}

    matches_text = []
    matches_binary = []

    for pattern in pitch_patterns:
        for path in ROOT.glob(pattern):
            if path.is_file():
                if path.suffix.lower() in text_extensions:
                    matches_text.append(path)
                elif path.suffix.lower() in binary_extensions:
                    matches_binary.append(path)

    # Also search one level deep
    for pattern in pitch_patterns:
        for path in ROOT.glob(f"*/{pattern}"):
            if path.is_file():
                if path.suffix.lower() in text_extensions:
                    matches_text.append(path)
                elif path.suffix.lower() in binary_extensions:
                    matches_binary.append(path)

    parts = []
    if matches_text:
        for path in matches_text[:2]:  # read up to 2 text pitch docs
            try:
                text = path.read_text(encoding="utf-8", errors="replace")
                lines = text.splitlines()
                preview = "\n".join(lines[:60])
                if len(lines) > 60:
                    preview += f"\n\n... ({len(lines) - 60} more lines)"
                parts.append(f"**{path.relative_to(ROOT)}**\n\n{preview}")
                found(f"Pitch doc: {path.relative_to(ROOT)}")
            except OSError:
                pass

    if matches_binary:
        binary_list = ", ".join(
            str(p.relative_to(ROOT)) for p in matches_binary[:3]
        )
        parts.append(
            f"**Binary pitch files found (not readable as text):**\n{binary_list}\n\n"
            f"_Ask the founder to paste the key sections from these._"
        )
        found(f"Binary pitch files: {binary_list}")

    if parts:
        section("Pitch / Narrative Documents", "\n\n---\n\n".join(parts))
    else:
        not_found("Pitch/deck documents (no pitch*.md, deck*.pdf, etc. found)")
        section(
            "Pitch / Narrative Documents",
            "_No pitch documents found. Ask the founder to paste their one-pager or investor narrative if they have one._",
        )


# ── 3. Analytics exports ──────────────────────────────────────────────────────

def gather_analytics() -> None:
    analytics_names = [
        "analytics*", "metrics*", "stats*", "data*", "export*",
        "users*", "revenue*", "growth*", "dashboard*", "kpi*",
    ]
    csv_json_ext = {".csv", ".json", ".tsv"}
    found_files = []

    for pattern in analytics_names:
        for path in list(ROOT.glob(pattern)) + list(ROOT.glob(f"*/{pattern}")):
            if path.is_file() and path.suffix.lower() in csv_json_ext:
                found_files.append(path)

    if not found_files:
        not_found("Analytics exports (no CSV/JSON analytics files found)")
        section(
            "Analytics / Metrics",
            "_No analytics exports found. Ask the founder to paste key metrics: MAU, DAU, MRR, retention at 30/90 days, MoM growth rate._",
        )
        return

    parts = []
    for path in found_files[:3]:
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
            ext = path.suffix.lower()

            if ext == ".json":
                try:
                    data = json.loads(text)
                    preview = json.dumps(data, indent=2)[:2000]
                    if len(json.dumps(data)) > 2000:
                        preview += "\n... (truncated)"
                except json.JSONDecodeError:
                    preview = text[:2000]
            else:
                lines = text.splitlines()
                preview = "\n".join(lines[:30])
                if len(lines) > 30:
                    preview += f"\n... ({len(lines) - 30} more rows)"

            parts.append(f"**{path.relative_to(ROOT)}**\n\n```\n{preview}\n```")
            found(f"Analytics: {path.relative_to(ROOT)}")
        except OSError:
            pass

    section("Analytics / Metrics", "\n\n".join(parts))


# ── 4. Git activity ───────────────────────────────────────────────────────────

def gather_git_activity() -> None:
    if not (ROOT / ".git").exists():
        not_found("Git repository (no .git directory)")
        section("Git Activity", "_Not a git repository._")
        return

    # Recent commits (last 90 days)
    since = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")
    log = run_cmd(
        ["git", "log", "--oneline", f"--since={since}", "--format=%ad %s", "--date=short"]
    )

    # Most-edited files
    file_activity = run_cmd(
        ["git", "log", "--name-only", "--format=", f"--since={since}"]
    )

    # Contributor breakdown
    contributors = run_cmd(
        ["git", "shortlog", "-sn", "--no-merges", f"--since={since}"]
    )

    parts = []

    if log:
        lines = log.splitlines()
        found(f"Git log: {len(lines)} commits in last 90 days")
        preview = "\n".join(lines[:30])
        if len(lines) > 30:
            preview += f"\n... ({len(lines) - 30} more commits)"
        parts.append(f"**Recent commits (last 90 days, {len(lines)} total)**\n\n```\n{preview}\n```")
    else:
        not_found("Git commits in last 90 days (none found or git unavailable)")
        parts.append("_No recent commits found in the last 90 days._")

    if contributors:
        parts.append(f"**Contributors (last 90 days)**\n\n```\n{contributors}\n```")

    if file_activity:
        # Count file occurrences to find most-edited
        file_counts: dict[str, int] = {}
        for line in file_activity.splitlines():
            line = line.strip()
            if line and not line.startswith("commit"):
                file_counts[line] = file_counts.get(line, 0) + 1
        top_files = sorted(file_counts.items(), key=lambda x: x[1], reverse=True)[:15]
        if top_files:
            file_list = "\n".join(f"{count:3d}x  {fname}" for fname, count in top_files)
            parts.append(f"**Most-edited files (last 90 days)**\n\n```\n{file_list}\n```")

    section("Git Activity", "\n\n".join(parts))


# ── 5. Tech stack detection ───────────────────────────────────────────────────

def gather_tech_stack() -> None:
    signals = []

    # Package managers / dependency files
    checks = [
        ("package.json", "Node.js / JavaScript"),
        ("requirements.txt", "Python"),
        ("Pipfile", "Python (Pipenv)"),
        ("pyproject.toml", "Python (pyproject)"),
        ("Cargo.toml", "Rust"),
        ("go.mod", "Go"),
        ("pom.xml", "Java (Maven)"),
        ("build.gradle", "Java/Kotlin (Gradle)"),
        ("Gemfile", "Ruby"),
        ("composer.json", "PHP"),
        ("mix.exs", "Elixir"),
    ]
    for filename, label in checks:
        if (ROOT / filename).exists():
            signals.append(f"- **{label}** (`{filename}`)")

    # Framework detection from package.json
    pkg_path = ROOT / "package.json"
    if pkg_path.exists():
        try:
            pkg = json.loads(pkg_path.read_text(encoding="utf-8"))
            deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
            frameworks = {
                "next": "Next.js",
                "react": "React",
                "vue": "Vue",
                "svelte": "Svelte",
                "express": "Express",
                "fastify": "Fastify",
                "nestjs/core": "NestJS",
                "prisma": "Prisma",
                "drizzle-orm": "Drizzle ORM",
                "supabase": "Supabase",
            }
            detected = [name for key, name in frameworks.items() if any(key in dep for dep in deps)]
            if detected:
                signals.append(f"- **Frameworks/libs detected:** {', '.join(detected)}")
        except (json.JSONDecodeError, OSError):
            pass

    # Deployment / infra config
    infra_checks = [
        ("Dockerfile", "Docker"),
        ("docker-compose.yml", "Docker Compose"),
        ("fly.toml", "Fly.io"),
        ("vercel.json", "Vercel"),
        (".vercel", "Vercel"),
        ("netlify.toml", "Netlify"),
        ("railway.json", "Railway"),
        ("render.yaml", "Render"),
        (".github/workflows", "GitHub Actions CI"),
    ]
    infra = []
    for filename, label in infra_checks:
        if (ROOT / filename).exists():
            infra.append(label)
    if infra:
        signals.append(f"- **Deployment/infra:** {', '.join(infra)}")

    # Database hints
    db_hints = []
    for f in [ROOT / "prisma" / "schema.prisma", ROOT / "drizzle.config.ts", ROOT / "knexfile.js"]:
        if f.exists():
            try:
                text = f.read_text(encoding="utf-8", errors="replace")
                for db in ["postgresql", "postgres", "mysql", "sqlite", "mongodb", "firestore"]:
                    if db in text.lower():
                        db_hints.append(db.capitalize())
            except OSError:
                pass
    if db_hints:
        signals.append(f"- **Database hints:** {', '.join(set(db_hints))}")

    if signals:
        found("Tech stack signals")
        section("Tech Stack (auto-detected)", "\n".join(signals))
    else:
        not_found("Tech stack (no recognized config files found)")
        section(
            "Tech Stack (auto-detected)",
            "_No recognized stack config files found. Ask the founder to name their stack: language, framework, database, hosting._",
        )


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    print(f"# YC Application Coach — Project Context\n")
    print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"Project root: {ROOT}\n")
    print("---\n")

    gather_readme()
    gather_pitch_docs()
    gather_analytics()
    gather_git_activity()
    gather_tech_stack()

    for s in OUTPUT_SECTIONS:
        print(s)
        print("\n---\n")

    print("## Context Summary\n")
    if FOUND:
        print("**Found:**")
        for item in FOUND:
            print(f"- {item}")
        print()
    if NOT_FOUND:
        print("**Not found (ask the founder to provide manually):**")
        for item in NOT_FOUND:
            print(f"- {item}")
        print()

    print(
        "_Use whatever context is available above. Missing items are noted "
        "so you can ask the founder directly during coaching._"
    )


if __name__ == "__main__":
    main()
