# The Plain-Language Walkthrough (v0.4)
**Supersedes the step explanations in v0.3.** This is written so that anyone — with no prior context — can read it top to bottom and picture the whole process as one unbroken chain. The exhaustive lists (every note-type's allowed values, the full zone definitions) still live in v0.3 and in the Central Reference; *this* document is the story and the reasoning behind it.

*Revision note: Stage 4 now specifies searcher-voice titles; Stage 6 now specifies the tree's spine + horizontal/vertical ordering + unlimited depth. Vertical ordering is flagged as an open discussion.*

---

## What you're starting with, and what you're trying to get

Picture one Excel file. **Column A** is a list of about 8,000 phrases that real people typed into Google about bursitis. **Column B** is how many times each phrase gets searched per month. That is the entire raw material — a pile of phrases and their popularity.

By the end, you want that pile turned into a detailed **map of every question, fear, and goal a bursitis sufferer carries**, arranged as a **journey** — from the first uneasy "something's wrong with my joint," through "what is this and is it serious," through "what can I do about it," all the way to "I'll order this product." And arranged so precisely that for *any* phrase a person could have typed, you know exactly which worries sit behind it and exactly what to say to walk them toward your product.

## The one idea that changes everything

We don't actually care about the phrases as phrases. We care about the **intent** behind each one — the real question or worry in the searcher's head. The phrase is just a clue they left behind.

Here is the catch that makes this rich: **one phrase can hide several different intents.** "diverticulitis and colon cancer" might mean *"can the first cause the second?"* or *"which of the two do I have?"* — genuinely different worries that deserve different answers. So the real job is detective work on **intents**, and the phrases are the evidence. We never discard a phrase: **every intent and every topic we build always shows which phrases it came from.** The phrase doesn't disappear — it *unfolds* into the intents we find inside it, and stays attached to each one.

Now here is the chain, stage by stage. At each stage I'll tell you what you have going in, what happens, and what you're holding when it's done.

---

## Stage 1 — Load the rulebook

**Going in:** your 8,000 phrases.

Before anyone reads a single phrase, you load a shared **rulebook** — we call it the Central Reference. Think of it as the instructions handed to a new analyst on their first day: *here's what to look for in a health search, here are the stages of a sufferer's journey, here's how to take notes.* It exists because every health condition works the same way underneath — they all have symptoms, causes, ways to diagnose them, treatments, an outlook, costs, and different kinds of sufferers. So most of the rulebook is the same no matter which condition you're working on.

**"But this is my first-ever project — where does the rulebook come from?"** You don't start from a blank page. You start from a sensible universal template (the journey stages and the kinds of notes that apply to *any* health condition), then you sanity-check it against a small sample of your actual bursitis phrases and adjust where reality differs. Exactly *how* it gets defined and keeps improving is the same simple loop for everything in the rulebook — I explain that loop in Part Two, because it answers "how do we set this up the first time and keep updating it" once, for all parts at once.

The rulebook is **alive** — it keeps learning as you work, and what it learns carries forward to your next project. And every single thing in it is stamped either **Universal** (true for every condition) or **Niche: bursitis** (true only here), so a bursitis-only quirk never leaks into your next project and can be hidden from it.

**Coming out:** the analyst is briefed and ready, working from a rulebook tuned to this project.

## Stage 2 — Remove the exact repeats

**Going in:** the 8,000 phrases.

Many phrases are just the same words rearranged: "bursitis treatment," "treatment for bursitis," "treatments for bursitis." These obviously mean the identical thing, so we fold them into one and **add up their search counts** so we don't lose any popularity signal. This is purely to avoid paying to analyze the same thing three times — no thinking is involved yet, it's mechanical tidying.

We are deliberately careful here: we only fold together phrases that are **word-for-word the same** after light tidying (dropping the word "bursitis," which is in every phrase, and tiny filler like "for"). We do **not** fold "remedies for bursitis" in with "treatment for bursitis" — different word, possibly different meaning — and we don't touch "all treatments for bursitis" either, because "all" might signal someone wanting a complete list. Those judgment calls come later. We also leave prepositions like *in*, *on*, and *from* alone, because "pain **in** the joint" and "pain **on** the joint" can mean different things.

**Coming out:** a shorter list of unique phrases (say it shrinks to ~2,500), each still carrying its summed popularity and the list of phrasings it stands for.

## Stage 3 — Read each phrase and list every intent it could carry

**Going in:** the ~2,500 unique phrases. This is the heart of the whole process.

An AI analyst reads each phrase **in full** — every word, because the small words and the word-pairings matter ("serious complications" together means something different from "serious" alone). For each phrase it asks one question: **what are ALL the plausible things a real person might have meant by this?**

- For a clear phrase, there may be just one intent. "best supplement for bursitis" → one intent: *someone comparing supplements to pick one.*
- For an ambiguous phrase, it lists **several possible intents.** "fecal impaction colon rupture" → two: *"can a fecal impaction rupture the colon?"* (can this dangerous thing happen) and *"do I have a fecal impaction or a ruptured colon?"* (which of these is it). The more ambiguous a phrase, the more possible intents it should surface — because if we force ourselves down to one, we may never discover a real worry the searcher had, and answering that worry is how we win them.

For **each possible intent**, the analyst does two things:

1. **Fills in a small, consistent set of notes.** Always the same questions: *What is this about?* (a symptom, a cause, a treatment, a comparison, a product…) · *What's the person's situation?* (how long they've had it, how bad, who they are — an older woman, a runner) · *What do they want to do, and what are they worried about?* (identify it, find relief, check if it's dangerous; afraid it's serious, afraid it won't go away). These consistent notes are what let us compare intents reliably later.
2. **Writes a plain-language summary** — a sentence or two capturing its full read of the phrase. This is a safety net: if the phrase carries some nuance that none of the standard notes have a slot for, the summary still captures it, and the next stage can read it to understand the intent completely. (It's also how we discover when a brand-new *kind* of note is worth adding — see Part Two.)

Each possible intent becomes its own little record, with the phrase attached to it as its source.

**Coming out:** a big collection of intent records — usually **more records than phrases**, because the ambiguous phrases each spawned several. From here on, the work is done on these intents (the phrases riding along as their source).

## Stage 4 — Give each intent a clean label

**Going in:** the intent records.

Each intent gets a clear, consistent **title** and a short **"belongs here / does NOT belong here"** note (e.g., *belongs: comparing supplements to choose one; does not belong: how to actually take a supplement — that's a later, after-purchase topic*). This makes the boundaries of each intent sharp, so the next stage can tell two intents apart cleanly.

**A rule about how the title is worded.** The title should be written in the **searcher's own voice** — phrased as if it were the headline of the very content that person is looking for, so we see the topic through *their* eyes, not from the outside. So not "Searcher is looking for natural remedies for left ankle bursitis," but simply **"Remedies for left ankle bursitis."** Not "Searcher wants to know if bursitis is serious," but **"Is bursitis serious?"** The only exception is when a first-person framing doesn't naturally fit — for example "How doctors diagnose bursitis" or "Is an MRI or a CT scan better for spotting bursitis." Those keep a neutral title. (Each title is tagged as either *searcher-voice* or *neutral* so the choice is explicit.)

**Coming out:** every intent now has a tidy, comparable label and a clear edge.

## Stage 5 — Merge only the truly identical intents; keep the rest apart

**Going in:** the labelled intents.

Now we look for intents that are **the same** and combine them into a single **topic** (with all their source phrases listed underneath). Two phrases that both mean "is bursitis dangerous?" become one topic carrying both phrases.

But we are **strict**, on purpose. If one intent says *everything* another says **plus one more specific thing**, they are **not** the same. Example: "treatment for bursitis in left knee" and "treatment for bursitis **pain** in left knee." The second includes the first but adds the explicit angle of *pain* — so they stay as **two distinct topics.** (They'll end up sitting right next to each other in the next stage, with the more specific one tucked underneath the broader one — but they remain separate.) The rule of thumb: **we would rather have many precise, similar-but-distinct topics than a few fat topics that quietly blur several worries together.** That precision is exactly what lets us, later, speak to each worry exactly.

**Coming out:** a set of tight topics, each holding one single worry and the phrases that express it.

## Stage 6 — Build the tree, inventing the connecting rungs

**Going in:** the tight topics.

Now we stack them into a tree, **specific topics nested under broader ones.** A topic like "right-ankle pain from bursitis" sits under "ankle pain," which sits under "lower-limb pain," which sits under "bursitis symptoms." The original phrase appears in *all* of these: it's the **primary** phrase of its exact topic (a perfect fit, the reason that topic exists), and a **secondary** phrase in each broader topic above it (carried up because its home is nested inside them). This keeps the broad topics from being hollow and lets you later pull every specific search that lives under any general heading.

**The shape of the tree, precisely.** Picture a **central spine** running down the middle: the major parent topics, in order — the big stages of the journey (symptoms, then causes, then diagnosis, then treatments, then products, then buying, and so on). Hanging off each spine parent are its child topics. Two things about order matter, on two different axes:
- **Vertical order (down the spine):** the sequence of parent topics must mirror **how a real sufferer moves through the journey** — what they wonder about first, then next, then next, toward a purchase. This ordering is the most consequential judgment in the whole tree, and it deserves its own dedicated discussion (flagged below) — it ties directly into the funnel-placement logic in Stage 7.
- **Horizontal order (among topics at the same level):** when several child topics sit under the same parent at the same depth, *their left-to-right order also carries meaning* — it sets a relative priority/sequence among siblings.

And there is **no limit on depth** — a child can have its own children, which can have theirs, as deep as the real distinctions go. The tree is therefore a spine of ordered parents, with ordered siblings beneath each, nesting arbitrarily deep.

Here's the part your "bursitis in knee in older women" example raises. That phrase is specific along **three** dimensions at once — a location (knee), an age (older), and a sex (women). So it doesn't sit on a single ladder; it sits at the bottom of a small **web** of broader topics, and the system invents the in-between rungs: "bursitis in knee," "bursitis in women," "bursitis in older people," "bursitis in older women," and so on up to plain "bursitis symptoms." The specific phrase is carried up into **every** one of those as a secondary phrase. Some of those rungs will have a primary phrase of their own (if someone actually searched "bursitis in knee"); others stay as empty connecting shells — and that's fine, an empty rung is allowed.

**A guardrail, because this could explode:** we don't manufacture *every* mathematically possible combination. We only create a rung if it's useful — meaning either a real phrase maps to it, or it's a natural grouping level your content strategy would actually use. Rungs that no phrase touches and no content would ever target are skipped. So the web stays as big as it's helpful and no bigger.

**Coming out:** a full tree — every worry has a home, every home connects up to broader homes, and every phrase is attached to its exact topic and all the broader ones above it.

## Stage 7 — Lay the tree out as a journey, and keep tidying

**Going in:** the tree.

A tree by itself isn't yet a journey. So we place each topic **where a real person would be when they have that worry.** Someone asking "is bursitis serious?" is early and anxious; someone asking "best bursitis supplement" is far along and close to buying. We do this with simple rules — *if the worry is about identifying a symptom → place it early; if it's about comparing products → place it near the buying end; if it's about how to use something → place it after purchase.* We place into broad **zones** first (a handful of big journey regions), then into finer **stages** inside each zone.

Crucially, we **keep tidying as we go** rather than waiting until the end — if a topic turns out too broad, we split it; if one is sitting in the wrong place, we move it. (The exact rule format and how the rules get set up and improved is in Part Two.)

**Coming out:** the finished article — a tree where every worry has a home, the homes connect specific-to-general, and the whole thing reads as a journey from "something's wrong" to "I'll buy." Plus an **index**: for any phrase, you can instantly see every intent it carries and exactly where each one sits in the journey.

---

## How you use the finished map

1. **The to-do list for the product and the content.** Read off every worry the map contains, ranked by popularity (each topic carries the search counts of its phrases). That tells you what your product must address and what your content must answer, in priority order.
2. **The master story.** Write one overarching narrative for how you move a sufferer through the whole journey — meeting each worry and nudging them to the next stage, all the way to purchase.
3. **The personalized journey for a single phrase.** For any phrase, ask the index for *all* the intents it carries, look up where each one sits in the journey, and weave a single piece of content that meets that exact person across every worry they hold and walks them forward. (This is why the multi-intent detective work matters: that one phrase often touches several worries, and now you can answer all of them coherently.)

---

# PART TWO — The living machinery (the parts that grow, and how you steer them)

Everything above runs on the rulebook. This part explains how the rulebook is set up the first time and how it keeps improving — and it answers your questions about zones, placement rules, new note-types, and the improvement screen.

## The single growth loop (this answers "how do we set it up and keep updating it" for everything)

Nothing in the rulebook is built once and frozen. Every piece of it — the note-types, the lists of allowed values, the journey zones, the finer stages, the placement rules, the naming conventions — **grows by the exact same loop:**

1. **Start from a universal default.** A sensible starting point that's true for health conditions in general.
2. **Validate against a sample.** Run it on a few hundred real phrases from the project and watch where it doesn't fit.
3. **Correct the misses through the improvement screen** (below).
4. **Every correction becomes a new rulebook entry** — stamped *Universal* or *Niche: [name]*, and **versioned** (the old version is kept).
5. **Promote what proves general.** A niche entry that keeps recurring across projects gets promoted to Universal; one that's truly a one-off stays niche-tagged and out of other projects' way.

So when you ask "how do we define the zones for the first project, and keep updating them?" — that's this loop. Same for placement rules. Same for note-types. I'll show each as an example of the loop rather than repeat the loop three times.

## Niche-tagging (keeping projects from contaminating each other)

Every entry says whether it's *Universal* or *Niche: [name]*. A project only ever sees Universal entries plus its own niche's entries — never another niche's. New entries default to the **narrowest** scope (niche-specific) until they've earned a promotion. This is how a bursitis-only rule helps the bursitis project but is invisible to, and removable from, every other project.

## Zones — set up and update (an example of the loop)

**First project:** you don't invent zones from nothing. You start from the well-understood shape of any health journey — awareness, then understanding the problem, then causes and diagnosis, then researching solutions, then comparing them, then deciding and buying, then life after purchase. Then you check that starting set against your sample: if a cluster of real intents doesn't fit any zone, that's your signal to add or split one.
**Updating:** zones are rulebook entries, so they evolve through the loop. They change *rarely* (they're big and universal) — most of the real refinement happens at the finer **stage** level inside a zone. *Example:* working bursitis, you notice "is this normal?" intents don't sit comfortably anywhere, so you add a **symptom-reassurance** stage inside the Problem-Exploration zone — tagged niche at first, promoted to universal once the diverticulitis project shows the same need.

## Placement rules — the precise method, set up and update

A placement rule is a plain **if-then**: *IF an intent's notes have these values, THEN put its topic in this zone, at this stage, with this priority.*
- *Example rule:* IF the intent is about a symptom AND the person just wants to identify/understand it → Problem-Exploration zone, symptom-identification stage.
- *Another:* IF the intent is about comparing or choosing a product → Evaluation zone.
- *Another:* IF the intent is about buying or where to get it → Decision zone.

**How they run:** for each topic, the rules are checked in **priority order**, and the **first one that fits** decides its place. If no rule fits, the topic drops into a visible **"needs placement" tray** rather than being guessed at.
**Conflicts:** when two rules could fit — "bursitis vs tendonitis" is both a *comparison* and a *which-do-I-have* question — priority decides. We've set the "what they want to do" note to outrank the "what it's about" note, so the action wins; the topic lands in the comparison/diagnosis area accordingly. A clash that keeps happening becomes its own explicit rule.
**First project:** start with a handful of obvious rules like the ones above; run them on a sample; whatever lands in the "needs placement" tray, or lands somewhere wrong, tells you exactly which rule to add or fix.
**Updating:** same loop — a correction in the improvement screen becomes a new or revised rule, scoped and versioned. Over time the tray empties as the rules (including edge cases) accumulate.

## Adding a brand-new note-type (and the questions you asked about it)

Sometimes analysis turns up a dimension of intent that none of the existing notes capture — often spotted because it keeps showing up in the plain-language summaries but has nowhere structured to go.
- **Proposing it:** the analyst (or you) proposes a new note-type, scoped Universal or Niche.
- **Integrating it easily:** one action in the improvement screen adds it to the rulebook — its definition and its list of allowed values — and updates the analyst's instructions to start filling it from the next batch on.
- **Do we redo earlier work?** For the intents analyzed *before* the note existed, we run a small **catch-up pass** that fills in *only the new note* — it doesn't re-do the whole analysis, it just asks that one question of each existing intent, and it can usually answer it by reading the summary we already wrote. Cheap and targeted.
- **Won't the list of note-types grow forever?** It's a real risk, and we guard against it: a new note-type only earns a place if it actually **changes how intents group or where they get placed** — a note that never affects anything is noise and is rejected. We hold periodic **consolidation reviews** to merge overlapping note-types and retire ones that rarely fire. We keep most niche-specific notes **niche-scoped**, so the *universal* list stays short. And the plain-language summary absorbs the rare one-off nuances, so not every little thing demands its own note-type. The result: a lean universal list, with the long tail living in summaries and niche scopes.

## The improvement screen, and making changes safely

Picture a screen sitting beside the running job. As the AI works, a **table** fills in — **one row per decision it made:** the input it looked at, the decision it produced, a one-line reason it gives for that decision, an **Undo** button, and an empty **"Lesson"** box you can type into.

**Two ways to run it:** *pause-and-approve* (it stops after each decision, or each batch, until you approve or undo), or *run-and-review* (it keeps going and you approve or undo in bulk afterward). You can also switch the whole screen off for a run you trust.

**When you type a lesson** — say, *"you tagged 'serious complications' as a severity note, but it's actually a 'how dangerous is this' worry"* — the module turns it into a change. There are two kinds of change, and both are handled safely:

- **Adding a new instruction** — it's slotted into the analyst's instructions (above a reserved marker line) and applies from the next batch on, in this project and every future one.
- **Modifying something that already exists** — an instruction, a placement rule, an allowed value, or a note-type. This is the part that has to be safe, so: the change is shown as a clear **before-and-after** (you see exactly which words change), in an **editable box**; **nothing changes until you approve it**; and **every change is saved as a new version with the old one kept**, so you can **roll back** any change at any time. You also choose its **scope** (Universal or this niche only). And if the change would affect work **already done** — for instance, you redefine a placement rule after topics were already placed — the screen **tells you how many topics are affected and offers to re-run just those**, not the whole project.

That's the full loop: a mistake is caught on the screen, you explain it once, it becomes a safe, versioned, scoped change to the rulebook, and from then on every run — in this project and the next — avoids it.

---
*End of v0.4. The keyword never disappears — it unfolds into its possible intents and stays attached to every topic it touches. The rulebook is never frozen — it grows, by one loop, with everything scoped and versioned.*
