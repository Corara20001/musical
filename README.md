# Musical · Vocal interaction prototype

Landscape mobile vocal-interaction prototype. Local development now uses an excerpt derived from the user-supplied `assets/music/Satisfied.flac`: **68 lyric events, 34.75 seconds including preview time**. Audio stems are locally separated estimates. The chart is explicitly a **draft**: timing, pitch and curves need listening/score review; six events use a reference pitch because extraction was unreliable. No microphone or in-game AI is used.

The public Sites URL below still hosts the earlier synthesized demo. This local recording/chart iteration has not been published.

## Technical documentation

- [技术方案（持续维护）](docs/technical-plan.md)：当前架构、数据契约、判定参数、音频接入方案、验证边界与发布流程。

## Run

On this machine, dependencies are already installed: run `./start.sh` to restart the preview. It also finds the bundled Node runtime when Node is not on PATH.

With Node 20.19+ or 22.12+ and pnpm installed:

```sh
pnpm install
pnpm dev
pnpm test
pnpm build
```

The development server binds to the local network; use its Network URL on a phone on the same Wi-Fi. Safari requires tapping Play to unlock audio. Browser backgrounding pauses the transport; tap Continue to resume. Mute uses the music button. Best Score is local to the browser and this demo.

## Play

Rotate your phone to landscape. Portrait shows a rotate prompt and interrupts active gameplay with a pause. Desktop preview uses a wide stage frame. The theatre backdrop is an original generated asset at `public/stage-backdrop.png`, with subdued amber/violet lighting inspired by musical theatre.

Lyrics move left toward the gold line. Vertical position is MIDI pitch, with a separate visible position for every semitone. Touch at the lyric's height when its head arrives at the line. Short notes need a new tap; sustained notes require holding. For curved tails, stay in contact and follow vertically. The full game region accepts input by pitch; horizontal position is forgiving.

The instrumental excerpt continues independently. Successful taps open the recorded vocal window; Hold/Trace gates affect the synchronized vocal stem. Early taps wait until their lyric start; late taps hear only the remaining recorded part. Both stems restart at the frozen offset after a pause. Separation artifacts and MP3 encoder latency still need human listening checks.

## Modules and tuning

- `src/satisfied-chart.json`: active draft chart, explicit tap/hold/trace kind, estimated/reference pitch status and confidence.
- `src/satisfied-song.json` / `src/song.ts`: excerpt boundaries, source hash, audio paths and duration.
- `src/demo-chart.json`: retained earlier original-lyrics demo.
- `src/config.ts`: timing windows, pitch tolerance, duration threshold, coverage thresholds, scores, pitch scale and preview horizon.
- `src/chart.ts`: data/types and bend interpolation.
- `src/judgement.ts`: touch ownership, tap timing, sustained coverage, one-time scoring.
- `src/audio.ts`: shared Transport and retained synthetic audio engine.
- `src/stem-audio.ts`: active synchronized recording playback and vocal gates.
- `src/lyric-layout.ts`: collision-aware label offsets, without moving actual pitch anchors.
- `src/rendering.ts`: Canvas and continuous pitch mapping.
- `src/touch.ts`: independent captured pointers, quick-tap buffering and cancellation.
- `src/results.ts`: defensive local best-score storage.
- `src/main.ts`: screen and playback lifecycle.

## Source and chart review

Source file: `assets/music/Satisfied.flac`, 44.1kHz stereo, 329.2267 seconds. Coherent requested verse identified around 67.60–98.92 seconds; excerpt audio spans 64.60–99.35 seconds to provide preview and an ending margin. This boundary choice excludes the preceding fragmented rewind repetitions and needs user listening confirmation.

Local analysis: `scripts/transcribe_satisfied.py` → `scripts/separate_satisfied.py` → `scripts/analyze_vocal.py` → `scripts/build_satisfied_draft.py`, using `requirements-audio.txt` in `.audio-env`. Model downloads are required on first run; audio is processed locally. The draft builder applies explicit editorial grouping and corrections to candidate timing/pitch evidence. It does not produce a verified automatic transcription. Intermediate/model files live in ignored `.audio-work/`; original FLAC is preserved and excluded from Git. Only two excerpt MP3 files are used by the app.

Review record: `docs/satisfied-chart-review.json`. A score or better vocal stems can replace these estimates. The remaining spoken/uncertain events have `pitchStatus: reference` and a `~` prefix; these positions are playable anchors, not measured vocal pitches.

## Verification

Automated tests cover judgement, pitch bends, quick taps, independent contacts, clock pause/resume/reset, pitch resize mapping and storage failures. Production build checks TypeScript. Browser walkthrough covers entry, play, pause, continue, results and retry. Real iPhone Safari audio latency, touch feel and the actual singing sensation need phone playtests; desktop viewport checks do not substitute for them.

## Public playtest

https://musical-vocal-stage.corachen1002.chatgpt.site

Published with Sites. Anyone with the link can open it. Landscape recommended. Current release is the original-lyrics synthesized-audio demo; Satisfied source recording is still pending.
