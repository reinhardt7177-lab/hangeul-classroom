# Design Priority Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Correct the approved readability and obstruction issues, preserve the existing imagery and palette, verify and publish the revision.

**Architecture:** Add a shared, role-based contrast stylesheet loaded last on all three entry pages. Add a small-screen reading layout only for the Hangeul presenter, leaving desktop 16:9 intact. Put the existing student return link in normal document flow.

**Tech Stack:** Existing HTML/CSS/vanilla JavaScript, Node verification, browser evidence and Lighthouse, GitHub Pages and Cloudflare Workers Static Assets.

**Spec:** `docs/디자인-전체점검-및-고도화-권고-2026-11-06.md`, F01–F03, with F04 addressed by the mobile cue layout and F05 by native link naming. The user approved implementing the priority findings and publishing on 2026-11-06.

## Global Constraints

- Preserve all existing images, videos, PDFs, historical text, scene order, QR and student input behavior.
- Retain the green/cream/orange visual identity; darken only semantic text/action tones enough for contrast.
- Preserve the desktop 16:9 presentation. At widths up to 700px, reflow text and visuals instead of scaling text below 16px.
- Existing `.claude/` files are unrelated and must not be staged.
- No new services, tracking, credentials, dependencies or permissions.

## Review Focus

- Mobile video playing/paused/fallback states must not remove the poster or duplicate video surfaces.
- Image, cards, equation, open/closed quiz, inquiry and YouTube scenes must remain readable and navigable.
- Long teacher cues and wrapped toolbar labels must not hide the previous/next buttons.
- Student inputs and jamo controls must remain unobstructed through scrolling and keyboard focus.
- New styles must be copied into both offline packages and served identically on both public origins.

## Task 1: Record failing rendered evidence

**Files:** create `site/verify-design-evidence.mjs`; generated evidence under `output/design-priority-2026-11-06/`.

**Interfaces:** consumes real browser layout JSON and Lighthouse JSON; produces pass/fail for contrast, readable mobile text, full cues, unobstructed student controls and intact desktop aspect ratio.

- [x] Capture the current 390px/320px mobile presenter, student return link and desktop stage.
- [x] Run the verifier against baseline evidence. Expected: assertion failures for tiny text and the fixed student link; baseline Lighthouse contrast checks also fail.

## Task 2: Correct contrast without replacing the palette

**Files:** create `site/dist/classroom-a11y.css`; modify the three HTML entry pages and package file lists.

**Interfaces:** new stylesheet is loaded after existing theme styles, and shipped in both packages.

- [x] Add semantic muted-text/accent/action colors for the audited failing selectors. Keep base background/image/color-family values unchanged.
- [x] Remove the landing cards' unnecessary `aria-label` so their visible labels are their native accessible names.
- [x] Repeat the five Lighthouse accessibility samples. Expected: `color-contrast` passes on each; home label/content mismatch is gone. Existing heading-order issues are separately recorded, not disguised.

## Task 3: Reflow presenter and remove the student overlay

**Files:** create `site/dist/presenter-mobile.css`; modify `site/dist/hangeul.html`, relevant package lists.

**Interfaces:** at <=700px the existing presenter grid keeps tools and navigation visible, while the main region scrolls; at desktop the existing stage is unchanged.

- [x] Give mobile slides a single-column reading layout with >=16px body text, visible headings, reflowed cards/quiz/equation/inquiry/video, and a complete wrapping teacher cue.
- [x] Keep the student return link in normal flow, not as an overlay. Preserve the teacher/home modes' behavior.
- [x] Re-capture browser evidence at 320/390px, desktop 1024/1280px, and representative scene types. Expected: the design evidence verifier passes; images and videos retain the previous file hashes.

## Task 4: Verify, review and package

**Files:** existing verifiers and package scripts; report update.

- [x] Run all six existing Node verifiers and the image pixel/hash verification. Expected: all pass.
- [x] Build both ZIPs and run `verify-content-packages.py`. Expected: current styles included, integrity passes.
- [x] Run the Impeccable detector once on the completed changes; separate existing aesthetic warnings from verified defects.
- [x] Obtain a fresh whole-change code review, fix important findings with regression evidence, then rerun relevant tests.
- [x] Record remaining report items and actual-device limitations without claiming complete accessibility conformance.

## Task 5: Publish verified revision

- [x] Commit only related files, fast-forward the existing `main`, and push to the existing GitHub repository.
- [x] Verify Cloudflare authentication, deploy the same packaged app, and await GitHub Pages success.
- [x] Compare public assets with the local package on both origins, including PDFs/video range response, and inspect representative public mobile/desktop screens. GitHub: all 85 full files. Cloudflare: 84 full files, plus HTTP 200 and exact length for one 21.7MB PDF; its complete second-origin transfer remains unverified because of slow transfer. This documented verification limit does not change the unmodified PDF; its complete GitHub and ZIP copies match.
- [ ] Publish new offline ZIP release assets without replacing older releases, then report exact public links and remaining limitations.
