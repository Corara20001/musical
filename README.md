# Musical · Vocal interaction prototype

Landscape mobile P0/P1 prototype for a proposed Satisfied vocal game. The working demo uses **19 notes, original lyrics and synthesized tones**, not Hamilton audio or an accurate Satisfied transcription. No microphone is used. It cannot establish the real-vocal magic moment yet.

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

Synthesis is a filtered harmonic sound, not intelligible sung words. Accompaniment continues without input; melody only sounds for played notes. Released or off-pitch sustained notes fade out. There is no automatic melody playback.

## Modules and tuning

- `src/demo-chart.json`: lyric, MIDI pitch, seconds, and optional `{time,pitch}` bend points relative to note start.
- `src/config.ts`: timing windows, pitch tolerance, duration threshold, coverage thresholds, scores, pitch scale and preview horizon.
- `src/chart.ts`: data/types and bend interpolation.
- `src/judgement.ts`: touch ownership, tap timing, sustained coverage, one-time scoring.
- `src/audio.ts`: AudioContext transport, accompaniment, note gates and synthesis.
- `src/rendering.ts`: Canvas and continuous pitch mapping.
- `src/touch.ts`: independent captured pointers, quick-tap buffering and cancellation.
- `src/results.ts`: defensive local best-score storage.
- `src/main.ts`: screen and playback lifecycle.

## Real-vocal integration still required

Put supplied files in `public/audio/satisfied/` or attach them in chat. See that folder’s README for filenames and synchronization requirements. Preferred: isolated vocal WAV, instrumental WAV, and reference mix from the same recording version. A full mixed MP3/M4A/WAV is sufficient to begin reference checking but does not permit independent vocal gating.

Provide synchronized instrumental and isolated vocal audio for the requested excerpt, plus a reviewed chart. Extend AudioEngine to decode stems before Play; schedule accompaniment against the same AudioContext clock. For each note, gate a synchronized vocal stem or schedule an AudioBuffer slice with a short fade. Late successful taps need a matching slice offset. Hold/Trace gates should affect vocals while preserving accompaniment. Chart events may then add slice start/end offsets; use separate score storage keys per chart. Set `config.duration` and pitch range to the real clip and validate its timing/pitch on device. This adapter is documented but **not implemented**; the current sound engine is synthesis only.

## Verification

Automated tests cover judgement, pitch bends, quick taps, independent contacts, clock pause/resume/reset, pitch resize mapping and storage failures. Production build checks TypeScript. Browser walkthrough covers entry, play, pause, continue, results and retry. Real iPhone Safari audio latency, touch feel and the actual singing sensation need phone playtests; desktop viewport checks do not substitute for them.

## Public playtest

https://musical-vocal-stage.corachen1002.chatgpt.site

Published with Sites. Anyone with the link can open it. Landscape recommended. Current release is the original-lyrics synthesized-audio demo; Satisfied source recording is still pending.
