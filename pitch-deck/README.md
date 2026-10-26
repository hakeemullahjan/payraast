# PayRaast Pitch Deck — HackMeridian 2026 (Lisbon)

Reproducing the HackMeridian 2026 Lisbon pitch deck template using LaTeX Beamer in 16:9 widescreen format.

---

## 1. Overview & Structure

The presentation contains exactly 5 slides structured directly after the official HackMeridian 2026 transit-themed pitch template:

- **Slide 1 — Title & Introduction (Platform 01 / 05)**
  - Dark Lisbon metro transit theme (`#0A0E17`).
  - Title: **PayRaast** — *Get paid globally. Cash out locally.*
  - Subtitle: *Cross-border stablecoin payments for Pakistani freelancers.*
  - Visual transit route flow diagram (Invoice $\rightarrow$ Payment Link $\rightarrow$ Stellar Testnet $\rightarrow$ Verified Receipt).
  - HackMeridian 2026 branding, partner badges (HackMeridian, Guava, Stellar).

- **Slide 2 — The Solution (Platform 02 / 05)**
  - Headline: *From payment requests to verified payments*.
  - 3 structured cards: Create invoice, share direct payment link, verify & provide receipt.
  - Callout: Differentiator highlighting the freelancer-focused workflow with a path toward local currency access.

- **Slide 3 — PMF / Problem (Platform 03 / 05)**
  - Headline: *Receiving money is only half the problem*.
  - 3 barrier cards: Traditional cross-border fees & delays (5–12%), raw crypto address limitations, and local PKR liquidity gap.
  - Callout: Target users (Pakistani freelancers & independent professionals).

- **Slide 4 — Technical Workflow (Platform 04 / 05)**
  - Headline: *Built on Stellar*.
  - 6-step vector workflow diagram (TikZ): Freelancer Invoice $\rightarrow$ Client Link $\rightarrow$ Freighter Signing $\rightarrow$ Backend Horizon Verification $\rightarrow$ SQLite Atomic State $\rightarrow$ Audit Receipt with Explorer Link.
  - Stack breakdown: Implemented MVP stack vs. Planned future direction (SEP-24 / SEP-31 anchors for PKR payouts).

- **Slide 5 — The Team (Platform 05 / 05 · Final Stop)**
  - Headline: *Built by a full-stack engineer*.
  - Founder card for Hakeem (5+ years engineering, full-stack & Web3 experience, HackMeridian MVP).
  - Mission card: HackMeridian 2026 focus on verifiable payment integrity.

---

## 2. Dependencies

To compile the deck to PDF, you need a standard TeX distribution (TeX Live, MacTeX, or MiKTeX) with:
- `beamer` (16:9 aspect ratio support)
- `tikz` (with `calc`, `shapes.geometric`, `arrows.meta`, `positioning`, `shadows`)
- `tcolorbox` (with `skins`, `raster`)
- `xcolor`, `graphicx`, `hyperref`, `amssymb`
- `microtype` (for optical kerning and legibility)
- `tgheros` / `tex-gyre` fonts (provides crisp modern Helvetica/Inter-style typography)
- `xelatex` (recommended) or `pdflatex`

On Debian/Ubuntu/WSL, these packages are provided by:
```bash
sudo apt-get install texlive-latex-base texlive-latex-extra texlive-fonts-recommended texlive-fonts-extra latexmk
```

---

## 3. Compilation Instructions

The output target is:
```text
pitch-deck/output/payraast-hackmeridian-2026.pdf
```

### Option A: Recommended (latexmk with XeLaTeX)

```bash
cd pitch-deck
latexmk -xelatex -interaction=nonstopmode -halt-on-error -outdir=output -jobname=payraast-hackmeridian-2026 main.tex
```

### Option B: Using standard pdfLaTeX

If XeLaTeX is not installed, compile with pdfLaTeX:
```bash
cd pitch-deck
latexmk -pdf -interaction=nonstopmode -halt-on-error -outdir=output -jobname=payraast-hackmeridian-2026 main.tex
```

### Option C: Direct engine invocation (without latexmk)

If `latexmk` is not available:
```bash
cd pitch-deck
xelatex -interaction=nonstopmode -halt-on-error -output-directory=output -jobname=payraast-hackmeridian-2026 main.tex
# Run twice for cross-references and TikZ overlays to resolve:
xelatex -interaction=nonstopmode -halt-on-error -output-directory=output -jobname=payraast-hackmeridian-2026 main.tex
```

---

## 4. Design Fidelity Notes

- **Transit theme & navigation:** Preserves the template's station platform system (`PLATFORM 01 / 05`, `NEXT ▸ PMF`, `PITCH STEP 01 / 04`, `FINAL STOP`).
- **Aspect ratio:** 16:9 widescreen layout matching PowerPoint presentation dimensions.
- **Vectors & Shapes:** Rendered using pure TikZ and tcolorbox vector primitives rather than static raster screenshots, ensuring crisp typography and scalable rendering.
