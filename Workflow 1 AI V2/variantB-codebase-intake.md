# Codebase Intake — Variant B Integration (Brief for Claude Code)

## Your task
You are working inside the repository for our application. We are planning to add a new feature, and we need you to **investigate the existing codebase and produce a report that answers the questions below.**

**This is an investigation-and-reporting task only. Do NOT modify any code, scaffold anything, or begin implementing. Just read the codebase and report.** Your report will be used to adapt an external technical specification so that it fits this codebase exactly.

## Background — why we're asking these questions
We already have a keyword-analysis stage in this app; call it **"Variant A."** We are going to build a new, **additive** keyword-analysis section, **"Variant B,"** that runs **alongside** Variant A — same input, separate output — so we can **A/B test** the two approaches on identical data. Variant B is an intent-driven pipeline that turns a spreadsheet of search keywords (Column A) and their monthly search volumes (Column B) into an organized, hierarchical conversion-funnel tree of topics.

A full technical specification for Variant B already exists. But to leave nothing for the implementer to guess, that spec must bind to **this** codebase's real stack, data storage, job orchestration, prompt handling, and conventions — and the new section must **mirror the existing patterns rather than introduce new ones.** Your report gives us the facts to do that binding correctly.

(If the Variant B primer and technical spec have already been added to this repo, you may skim them for extra context, but they are not required to answer these questions.)

## How to answer
- Answer **every** numbered question in a single markdown report, using matching numbering.
- **Ground every answer in the actual code.** Cite specific file paths, and include short code snippets where they help.
- If something is **not present, or you cannot determine it from the code, say so explicitly.** Do not guess or fill gaps with assumptions.
- For questions that involve a **choice or preference** (where the new section should live; how to toggle between variants), report the **existing patterns and options you find**, then give a **recommendation** — but clearly label it as a recommendation for the human to confirm.
- **Flag anything ambiguous or inconsistent** you come across.
- Do not implement anything. End your turn with the report.

## Questions

1. **Stack.** What languages and frameworks does this app use — backend framework, frontend framework, primary language(s), package manager, and runtime versions? (Check manifest/config files such as `package.json`, `requirements.txt`/`pyproject.toml`, `go.mod`, `Gemfile`, lockfiles, and framework markers.)

2. **Repo layout.** Map the high-level structure: top-level directories, how the code is modularized (monorepo, services, packages), and where backend vs. frontend code live. Identify where the existing keyword-analysis stage lives. Then recommend where a new, additive "Variant B" section should sit to match the existing conventions (mark this as a recommendation to confirm).

3. **Persistence.** What datastore(s) are used (SQL, NoSQL, plain files, blob storage)? What ORM or data-access layer and migration approach? And specifically, how are the existing keyword-analysis artifacts stored — the input keyword lists and the analysis outputs (which tables/collections/files, and their shapes)? Cite models, schema, and migration files.

4. **Orchestration.** How are AI tasks executed — synchronous request/response, background jobs, a queue/worker system (e.g., Celery, BullMQ, Sidekiq, a custom worker), or serverless functions? Separately, locate and describe the **"AI task overlay"** — the UI panel where a user picks the model, sets batch size, and watches progress and cost — and explain how it wires to the backend. Cite files.

5. **Prompts.** Where do AI prompts currently live in the codebase (inline constants, dedicated files, a database, a prompt-management system)? How are they versioned and edited? Cite examples.

6. **Existing Variant A (the current keyword-analysis stage).** This is the most important question. Describe the current keyword-analysis flow end to end: the entry point, the **input loader** (how the spreadsheet / keyword list is read in), the processing steps, where and how the outputs are written, and the key data shapes along the way. Give the module boundaries and a rough call graph with file references — Variant B must mirror these boundaries and reuse the same input loader.

7. **A/B toggling.** Search for any existing feature-flag, variant, experiment, or A/B mechanism already in the codebase (a flag system, config switches, env vars, separate routes). Report what exists. Then recommend how to switch between Variant A and Variant B using the existing patterns (mark as a recommendation to confirm).

8. **Model access & embeddings.** How does the code call AI models — which SDK/provider(s), how is the client set up, and how is authentication handled (env vars, secrets manager)? Are streaming and retries handled anywhere? Separately: are **vector embeddings** available or used anywhere in the stack (an embeddings client, or a vector store such as pgvector, Pinecone, Weaviate, etc.)? Variant B can use embeddings, if present, to cheaply find candidate topics to compare. Cite files.

## Required output format
Produce a markdown report titled **"Variant B — Codebase Intake Report,"** containing:
- One numbered section per question (1–8). Each section has: **Answer**, **Evidence** (file paths + short snippets), and **Caveats** (if any).
- A section **"Decisions for the human"** — list every choice/preference item (at least Q2 and Q7) with your recommendation.
- A section **"Gaps / not found"** — list anything you could not determine from the code.

Remember: investigate and report only. Do not change code.
