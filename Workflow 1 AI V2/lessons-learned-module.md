> **Part of the Variant B handoff package — uploaded to the `Workflow 1 AI V2/` folder in the repo. Start with `README.md` in that folder. This subsystem is a FAST-FOLLOW (not in the first build) — see the README roadmap.**

# Lessons Learned Module — Setup Specification
**Status: living document.** This is the single reference for how the Lessons Learned Module (LLM) is attached to any AI task in any workflow. Point me to it when configuring a new task, and ask me to edit it whenever the module changes.

> Naming note: "LLM" here means the **Lessons Learned Module**, not a language model. Where a language model is meant, this doc says "the model."

---

## 1. Purpose & philosophy
The Lessons Learned Module is the **engine of the never-freeze principle.** Every AI task in our workflows should get measurably better with each project, never reset to zero. The module captures a human correction once, converts it into a durable instruction or rule, and makes every future run of that task — in every project — avoid that mistake. It is how prompts and reference assets improve across projects rather than only within one.

## 2. Where it lives
It is an **adjunct panel to the task's run overlay** — the same overlay where the user selects the model and batch size and watches progress and cost. The module sits beside that, active during and after a run.

## 3. The four components of any AI task (what the module attaches to)
Every AI task has: **(a) a model** (user-selected), **(b) project data** (the input the model processes), **(c) a prompt** (instructions for what to do with the data), and **(d) an output spec** (the required output shape + where it is posted). The module observes (b)→(d) and feeds improvements back into (c).

## 4. The Lessons Table
As the model produces outputs in a session, a table accumulates **one row per output**, with these columns:
1. **Input excerpt** — the specific input field(s) the model acted on. *(Which fields appear is defined per task — see §11.)*
2. **Output excerpt** — the specific part(s) of the output. *(Defined per task — see §11.)*
3. **Output reasoning** — a brief justification the model gives for that output.
4. **Undo** — a per-row button that reverts that single output.
5. **Lesson Learned** — a free-text cell where the user states why the output was wrong and what new reasoning to apply going forward.

Above/beside the table: an **"Add additional instructions to primary prompt"** button (see §7–§8).

## 5. Settings (per run)
- **On/off toggle** — the module can be disabled for any individual run.
- **Two operating modes:**
  - **Gated** — the job pauses after each output (or each batch) until the user approves or undoes it, then proceeds.
  - **Streaming** — the job keeps running and logging every action to the table; the user later **batch-approves** or **batch-undoes** groups of rows.
- In **both** modes, the moment the user writes in a **Lesson Learned** cell, that lesson becomes visible to the **next session in the active job and to every future job** for this task.

## 6. Scope & sharing
The Lessons Table is scoped to **a specific AI task within a specific workflow**, and is **shared across all projects** that run that task. So a lesson learned while processing the bursitis project is automatically in force for the next niche's run of the same task. The primary prompt for the task (see §9) instructs the model to consult the **latest** table every session.

## 7. The analysis sub-feature (turning lessons into instructions)
Inside the module UI:
- A **Lessons Learned Analysis Prompt** (editable).
- A **model-selection dropdown** (which model performs the analysis).
- A **"Suggest Additional Instructions"** button.

When run, the analysis is given: the **task description**, the task's **current primary prompt**, and the **Lessons Learned data** (including the example rows — input excerpt, output excerpt, reasoning, and the user's lesson). It returns a set of **additional instructions** designed to prevent the logged mistakes, shown in an **editable output text box**. Beneath the box is the **"Add additional instructions to primary prompt"** button.

## 8. The prompt-insertion mechanism
Clicking **"Add additional instructions to primary prompt"** inserts the text-box content into the task's primary prompt. To place it reliably, every primary prompt contains a marker line:

```
[Note to Lessons Learned Module: Insert Additional Instructions above this line]
```

New instructions are inserted **immediately above** this marker. The marker is phrased so the task model treats it as a system/meta line meant for another process and does not act on it as task content.

## 9. The standing instruction in every primary prompt
Every task's primary prompt must include a standing instruction to **consult the current Lessons Learned Table for this task before producing output**, so each session benefits from the full accumulated history of corrections across all projects. This is in addition to the inserted instructions from §8 — the table reference keeps the model aligned even before lessons are distilled into prompt text.

## 10. Central prompt propagation
Task prompts are **centrally managed per task, not per project.** When a task's instructions are updated in any project (via §8 or a manual edit), the update applies to **every project** that runs that task. Projects never hold private, drifting copies of a task prompt.

## 11. Per-task configuration template (fill this in for each new task)
When attaching the module to a new AI task, define:
- **Task name & workflow:** _____
- **Input excerpt fields** (what goes in Table column 1): _____
- **Output excerpt parts** (what goes in Table column 2): _____
- **Output reasoning format** (column 3): _____
- **Default mode** (gated / streaming): _____
- **Analysis Prompt seed text** (the task-specific context for §7): _____
- **CLR write-targets** (where approved lessons land — e.g., a value menu, a placement rule, the prompt): _____

*Worked example — for the Step 3 "Holistic intent analysis" task:*
- Input excerpt = the keyword + its meaning-bearing units.
- Output excerpt = the produced intent profile (the descriptor values).
- Output reasoning = one line on why those descriptor values were chosen.
- Default mode = streaming with batch approval (high volume).
- Analysis Prompt seed = "This task reads a whole keyword and records its intent profile across the descriptor schema. Here is the primary prompt and the lessons…"
- CLR write-targets = the task prompt (instruction additions) and, for new-value lessons, the relevant Value Menu.

## 12. How to attach this module to a new task (repo-pointer instructions)
1. **Store this document** at a fixed path in the repo, e.g. `/docs/modules/lessons-learned-module.md`.
2. **When you want the module on a new task,** point me to it with a line like:
   > "Apply the Lessons Learned Module per `/docs/modules/lessons-learned-module.md` to the **[task name]** task in the **[workflow]** workflow."
3. **Provide the §11 fields** for that task (input excerpt, output excerpt, reasoning format, default mode, analysis-prompt seed, CLR write-targets). If you don't, I'll propose them from the task definition and ask you to confirm.
4. **To change the module itself,** say "Update the Lessons Learned Module spec: …" and I'll edit this document and note the change.

*(Confirm the path you want; I've proposed `/docs/modules/lessons-learned-module.md` but will use whatever matches your repo structure.)*

---
*End of spec. Update on request.*
