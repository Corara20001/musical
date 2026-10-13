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
