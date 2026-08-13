# The Qilvayas Symphony

A Dungeons & Dragons 5th Edition campaign setting.

An imperial fantasy campaign set in the declining Empire of Zhuvedus, where a young
drow emperor attempts to restore former glory through legal reform, institutional
rebuilding, and diplomatic reunification. The player characters are final-year
students at the Imperial Academy of the Lupine Throne, drawn out of their intended
futures by a shared prophetic vision of the capital burning.

This repository is the source of truth for the campaign.

## How this repository works

The **generator scripts are the canon.** Everything else is input to them or output
from them. To change the campaign, edit a script in `scripts/` and run `tools/build.sh`;
never edit the generated files directly, because the next build discards those edits.

| Directory | What it is |
|---|---|
| `scripts/` | **The canon.** docx-js generators, `transplant.py`, and the encoded visual template. |
| `corpus/` | **Generated Markdown** — readable and greppable on any device. Start here. |
| `documents/` | **Generated `.docx`** — styled, and what you read at the table. |
| `tools/` | `build.sh` regenerates and verifies everything; `docx-md-shim/` emits the Markdown. |
| `reference/` | The mirrored instructions for the Claude Chat project. |
| `drafts/` | Design drafts awaiting sign-off. **Not canon.** |

`corpus/` and `documents/` are produced from the same untouched scripts in the same
build, so the Markdown and the published documents cannot drift apart.

## The documents

### Sourcebook

- [The Qilvayas Symphony Campaign Setting (v11)](corpus/The_Qilvayas_Symphony_Campaign_Setting_v11.md) — the canonical sourcebook · [.docx](documents/The_Qilvayas_Symphony_Campaign_Setting_v11.docx)

### Session modules

| Session | Title | Markdown | Document |
|---|---|---|---|
| 0 | Foundations | [md](corpus/QS_Session_0_Primer.md) | [docx](documents/QS_Session_0_Primer.docx) |
| 1 | The Silent Road | [md](corpus/QS_Session_1_The_Silent_Road.md) | [docx](documents/QS_Session_1_The_Silent_Road.docx) |
| 2 | The Road Back | [md](corpus/QS_Session_2_The_Road_Back.md) | [docx](documents/QS_Session_2_The_Road_Back.docx) |
| 3–4 | The Proving Below | [md](corpus/QS_Sessions_3-4_The_Proving_Below.md) | [docx](documents/QS_Sessions_3-4_The_Proving_Below.docx) |
| 5 | Dead Letters | [md](corpus/QS_Session_5_Dead_Letters.md) | [docx](documents/QS_Session_5_Dead_Letters.docx) |
| 6 | The Second Seal | [md](corpus/QS_Session_6_The_Second_Seal.md) | [docx](documents/QS_Session_6_The_Second_Seal.docx) |
| 7 | The Turning Away | [md](corpus/QS_Session_7_The_Turning_Away.md) | [docx](documents/QS_Session_7_The_Turning_Away.docx) |
| 8 | The Unkept Vigil | [md](corpus/QS_Session_8_The_Unkept_Vigil.md) | [docx](documents/QS_Session_8_The_Unkept_Vigil.docx) |

### Guides

- [DM Reference Guide](corpus/QS_DM_Reference_Guide.md) — quick-lookup tables, the Branch Ledger, the deliberately-open list · [.docx](documents/QS_DM_Reference_Guide.docx)
- [Player Guide](corpus/QS_Player_Guide.md) — the sanitized, shareable edition · [.docx](documents/QS_Player_Guide.docx)

## Rebuilding

```bash
npm install docx
tools/build.sh
```

`build.sh` regenerates both outputs, applies the visual template, renders every
document to PDF, and **fails the build** on escape-sequence leaks or font substitution.
It refuses to run at all if the template's three fonts — Alegreya SC, Alegreya Sans SC,
and Lato — are not installed, because layout verified under substituted fonts is not the
layout that gets published.

See [`PIPELINE_README.md`](PIPELINE_README.md) for the full pipeline reference and
[`CLAUDE.md`](CLAUDE.md) for the working instructions and canon rules.

## Working notes

- [Timeline arithmetic audit](drafts/timeline-arithmetic-audit.md) — findings by severity, awaiting sign-off.
