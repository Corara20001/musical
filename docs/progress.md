# Execution ledger — 2026-10-11-musical-v0
Design and plan approved; user authorizes autonomous details.
Ruling: Work in the supplied empty checkout; no previous commits or parallel work to isolate. Git metadata is read-only under workspace policy; do not change branches or create commits.
Pre-flight: audio and rendering consume chart pitchAt; touch contacts carry fresh presses, judge owns claiming; main owns lifecycle.
Task 1: core judgement and original demo chart implemented; 7 tests pass.
Task 2: audio clock, accompaniment and gated synthetic voice implemented; transport lifecycle test passes.
Task 3: entry/play/pause/results/retry and Canvas/touch implemented; pitch and storage tests pass.
Ruling: pnpm used because runtime bundles Node but no npm. Install needs network escalation, approved; esbuild install script was skipped by pnpm but Vite build works with platform binary.
Fix: sub-frame quick taps were lost on pointerup; regression observed failing then passed with a one-frame fresh-contact buffer. Cancellation clears buffered touches.
Final independent review: three Important lifecycle findings; no minor findings.
Final: fixed interrupted Hold/Trace ownership — new-finger rearm regression RED→GREEN.
Final: fixed old sounds leaking across transport restart — all oscillator sources tracked until ended; pause/stop immediately disconnect; AudioContext stub regression RED→GREEN.
Final: fixed async start/resume after navigation/background — lifecycle transition guard regressions RED→GREEN.
Verification: 18 tests pass, TypeScript check passes. iAB walkthrough observed entry/play, pause/continue, 19 Miss result with no input, best score, Retry reset, and small-screen pause layout.
Ruling: final reviewer used because executing-plans explicitly requests independent review. No task implementation delegated.
Landscape iteration: user authorized autonomous details. Existing app changed to landscape stage presentation, generated original theatrical backdrop, compact HUD, landscape entry/results and portrait rotate prompt.
Independent review found portrait rotation during pending async Play/Resume could bypass pause; fixed allowed predicate and cancellation, with orientation transition tests.
Verification: 21 tests pass, TypeScript check passes, production build succeeds. iAB screenshots checked at 844x390 and 667x375. Rotating playing screen to portrait paused it; rotating back presented Continue. Complete no-input run reached 19 Miss results, then Back returned to entry. Real iPhone still not tested.
Audio replacement remains pending supplied Satisfied assets. Created public/audio/satisfied/README.md with synchronized vocal/instrumental/reference requirements. No source music downloaded or original-chart accuracy claimed.
2026-10-14 Satisfied local draft: supplied FLAC verified 329.2267s. Local ASR, separation and pYIN evidence collected; output corrected/grouped into 68 draft lyric events, with 6 reference-only pitch anchors. Excerpt 64.60–99.35; vocal range candidate 67.60–98.92, preceding rewind fragments excluded pending listening review.
Real audio: synchronized local excerpt stems, word-window vocal gain, source cleanup and resume offset. Review found early/late tap gate leakage; regression failed then passed after gating by recorded word start/end.
Browser found dense rap labels overlapping; collision-aware labels now leave pitch anchors untouched. Raw FLAC and intermediate models ignored. Public site remains prior synthdemo; source copy not synchronized this turn.
Final verification: 28 tests across 9 files pass, TypeScript check and production build succeed. Browser at 844x390 loaded real stems, entered game with dynamic 34s clock, paused/resumed at 20s; no console errors observed. Screenshot saved docs/satisfied-draft-preview.jpg. Dense text no longer overlaps in inspected final phrase. No manual full audio/score calibration or real iPhone test claimed.
Additional regression: taps after the recorded word end cannot earn a silent Good; failed before fix, passed after rejecting expired vocal windows. Good window is therefore clipped by tap event end in recorded mode.
Public deployment attempted after existing public prototype authorization was reconsidered. Native auto-review rejected the source upload before execution: specific recording publication not explicitly authorized and usage rights not established. No bypass/retry performed. Existing public version remains v1 synthdemo. Staged sites/musical contains the newer draft locally; it was not pushed or deployed. Future publication requires explicit user approval for this recording and rights evidence.
Browser final loop confirmed 68 Miss events on an untouched run and best-score isolation (max possible 6800); Back returned to entry.
2026-10-14 risk reassessment: user reports GitHub is now private; scope is local development/playtesting without public deployment of the Satisfied recording. Local-only operations assessed as low risk. Private repository uploads remain separate external actions and are not performed or authorized by this reassessment. GitHub visibility and the existing public synthdemo site were not independently checked. Historical auto-review denial is retained; no new review, push or deployment occurred. See docs/risk-assessment.md.
