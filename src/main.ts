import './style.css';
import { chart, pitchAt, interactionFor } from './chart';
import { config } from './config';
import { StemAudioEngine } from './stem-audio';
import { song, formatTime } from './song';
import { JudgementEngine } from './judgement';
import { Renderer } from './rendering';
import { TouchInput } from './touch';
import { saveBest } from './results';
import { TransitionGuard } from './lifecycle';
import { requiresRotation } from './orientation';
const app = document.querySelector<HTMLElement>('#app')!;
const guard = new TransitionGuard(() => !document.hidden && !needsRotation());
const audio = new StemAudioEngine(song.audio);
const judge = new JudgementEngine(chart);
let state: 'entry' | 'playing' | 'paused' | 'results' = 'entry', renderer: Renderer | undefined, touch: TouchInput | undefined, raf = 0, muted = false, busy = false, feedbackUntil = 0;
const brand = '<div class="brand"><span class="wordmark">musical<span style="color:#d4b67e">.</span></span><span class="pill">THE MUSICAL EXPERIENCE · V0</span></div>';
function entry() {
    guard.cancel(); cancelAnimationFrame(raf); audio.stop(); touch?.clear(); state = 'entry';
    app.innerHTML = `<section class="entry">${brand}
      <div class="hero"><div class="eyebrow">THE MUSICAL COLLECTION / 01</div><p class="show-name">HAMILTON</p><h1>Satisfied</h1><p class="hero-caption">ANGELICA’S MOMENT</p><div class="hero-rule"></div><p class="scene-description">A night. A spark. A story you can touch.</p><span class="scene-number">ACT I · VOCAL STUDY</span></div>
      <div class="entry-content"><div class="eyebrow">TAKE THE STAGE</div><h2 class="tagline">这一刻，由你开口。</h2><p class="intro">歌词就是音符。触碰、停留、跟随。<br>让指尖接住人声，让旋律在舞台上发生。</p>
      <div class="instructions"><div class="instruction"><b>TAP</b><p>短歌词，轻触</p></div><div class="instruction"><b>HOLD</b><p>长尾音，按住</p></div><div class="instruction"><b>TRACE</b><p>弯曲旋律，上下跟随</p></div></div>
      <button class="primary" id="play"><span>Play · 开始演奏</span><span>→</span></button><p class="notice">原曲分离音频 · 歌词谱面初稿 · 音高待校对</p><p class="error" id="error" hidden></p></div>
      <footer><span>横屏演奏 · 建议戴上耳机</span><span>VOCAL INTERACTION / PROTOTYPE</span></footer></section>`;
    document.querySelector('#play')!.addEventListener('click', () => void start());
}
async function start() { if (needsRotation()) return; if (busy)
    return; busy = true; const button = document.querySelector<HTMLButtonElement>('#play, #retry'); if (button)
    {button.disabled = true; button.textContent='加载原曲音频…';} try {
    audio.stop();
    judge.reset();
    const committed = await guard.run(() => audio.start(), () => { state = 'playing'; mountGame(); loop(); });
    if (!committed) {
        audio.stop();
        if (button)
            {button.disabled = false; button.innerHTML='<span>Play · 开始演奏</span><span>→</span>';}
    }
}
catch {
    audio.stop();
    entry();
    const e = document.querySelector<HTMLElement>('#error')!;
    e.hidden = false;
    e.textContent = '原曲音频加载或播放失败。请检查网络与浏览器音频权限后重试。';
}
finally {
    busy = false;
} }
function mountGame() { app.innerHTML = `<section class="game"><header class="game-header"><div><div class="song-title">Satisfied <span style="font:9px Arial;color:#a297b2">/ DRAFT</span></div><div class="song-sub">ORIGINAL AUDIO / 谱面待校对</div></div><div class="game-stats"><div><div class="stat-label">SCORE</div><div class="stat-value" id="score">0</div></div><div class="stat-right"><div class="stat-label">COMBO</div><div class="stat-value" id="combo">0</div></div></div><button class="icon-button" id="pause" aria-label="暂停">Ⅱ</button></header><div class="stage"><canvas aria-label="歌词演奏区域，纵向位置代表音高"></canvas><div class="feedback" id="feedback"></div></div><div class="game-bottom"><div class="progress-track"><div class="progress-fill" id="progress"></div></div><div class="bottom-row"><span class="hint" id="hint">歌词到线时，在对应高度触碰<br>上移唱高，下移唱低</span><span class="clock" id="clock">00:00 / ${formatTime(song.duration)}</span><button class="icon-button" id="mute" aria-label="切换静音">${muted ? '♩×' : '♫'}</button></div></div></section>`; renderer = new Renderer(document.querySelector('canvas')!); touch = new TouchInput(document.querySelector('canvas')!, y => renderer!.pitchFromY(y), () => audio.time(), () => state === 'playing'); document.querySelector('#pause')!.addEventListener('click', pause); document.querySelector('#mute')!.addEventListener('click', () => { muted = !muted; audio.setMuted(muted); document.querySelector('#mute')!.textContent = muted ? '♩×' : '♫'; }); feedbackUntil = 0; }
function loop() {
    if (state !== 'playing')
        return;
    const time = audio.time(), contacts = touch!.contacts(), events = judge.update(time, contacts);
    for (const event of events) {
        const s = judge.states.find(s => s.note.id === event.noteId)!;
        if (event.grade !== 'Miss' && interactionFor(s.note) === 'tap')
            audio.tap(s.note.id, s.note.pitch, s.note.duration, s.note.startTime);
        document.querySelector('#feedback')!.textContent = event.grade;
        feedbackUntil = time + .55;
    }
    for (const s of judge.states)
        if (interactionFor(s.note) !== 'tap')
            audio.setVoice(s.note.id, pitchAt(s.note, time - s.note.startTime), s.gate && time >= s.note.startTime);
    renderer!.draw(time, judge.states, contacts);
    const r = judge.results();
    document.querySelector('#score')!.textContent = String(r.score);
    document.querySelector('#combo')!.textContent = String(r.combo);
    (document.querySelector('#feedback') as HTMLElement).style.opacity = time < feedbackUntil ? '1' : '0';
    (document.querySelector('#progress') as HTMLElement).style.width = `${Math.min(100, time / config.duration * 100)}%`;
    document.querySelector('#clock')!.textContent = `${formatTime(time)} / ${formatTime(song.duration)}`;
    const upcoming = judge.states.find(s => s.status !== 'done');
    document.querySelector('#hint')!.innerHTML = time < 2.8 ? '准备好 · 在演奏线对应高度触碰' : upcoming && interactionFor(upcoming.note) === 'trace' ? '保持按住 · 跟随曲线上下滑动' : upcoming && interactionFor(upcoming.note) === 'hold' ? '保持按住 · 让尾音完整响起' : '轻触歌词 · 每个词一次新的触碰';
    if (time >= config.duration) {
        results();
        return;
    }
    raf = requestAnimationFrame(loop);
}
function pause() { if (state !== 'playing')
    return; state = 'paused'; guard.cancel(); cancelAnimationFrame(raf); touch?.clear(); judge.releaseOwners(); audio.pause(); const overlay = document.createElement('div'); overlay.className = 'overlay'; overlay.innerHTML = '<div class="overlay-inner"><div class="eyebrow">TAKE A BREATH</div><h2>演唱暂停</h2><p>声音和谱面已停在这里。<br>准备好后，继续用手指演唱。</p><button class="primary" id="resume"><span>继续演奏</span><span>↗</span></button><button class="secondary" id="back">返回首页</button></div>'; document.querySelector('.game')!.append(overlay); document.querySelector('#back')!.addEventListener('click', entry); document.querySelector('#resume')!.addEventListener('click', async () => { if (busy)
    return; busy = true; try {
    const committed = await guard.run(() => audio.resume(), () => { overlay.remove(); state = 'playing'; loop(); });
    if (!committed) {
        if (state === 'paused')
            audio.pause();
        else
            audio.stop();
    }
}
catch {
    const p = overlay.querySelector('p')!;
    p.textContent = '声音恢复失败，请再次点击继续。';
}
finally {
    busy = false;
} }); }
function results() { state = 'results'; cancelAnimationFrame(raf); audio.stop(); touch?.clear(); const r = judge.results(), best = saveBest(r.score, undefined, song.id); app.innerHTML = `<section class="results">${brand}<h1 class="result-heading">You gave it<br>a voice.</h1><p class="result-sub">刚才有没有一瞬间，<br>你觉得是自己的手让旋律唱了出来？</p><div class="score-panel"><div class="small">YOUR PERFORMANCE</div><div class="big-score">${r.score}</div><div class="best">BEST SCORE · ${best} / ${chart.length * config.perfectScore}</div></div><div class="result-grid"><div>Max Combo<strong>${r.maxCombo}</strong></div><div>Perfect<strong>${r.perfect}</strong></div><div>Good<strong>${r.good}</strong></div><div>Miss<strong>${r.miss}</strong></div></div><div class="result-actions"><button class="primary" id="retry"><span>Retry · 再唱一次</span><span>↻</span></button><button class="secondary" id="back">Back · 返回</button><p class="notice">原曲谱面初稿 · 最佳成绩仅保存在本机</p></div></section>`; document.querySelector('#retry')!.addEventListener('click', () => void start()); document.querySelector('#back')!.addEventListener('click', entry); }
function needsRotation() { return requiresRotation(window.innerWidth, window.innerHeight); }
const rotationPrompt = document.createElement('section');
rotationPrompt.className='rotation-prompt';
rotationPrompt.setAttribute('aria-label','横屏提示');
rotationPrompt.innerHTML='<div class="eyebrow">THE STAGE IS WIDER</div><h2>把手机横过来，<br>舞台就开场。</h2><p>横屏能看见更多歌词和旋律。<br>请关闭手机的竖屏锁定后旋转。</p>';
document.body.append(rotationPrompt);
window.addEventListener('resize', () => { if (needsRotation()) { guard.cancel(); pause(); } touch?.clear(); judge.releaseOwners(); if (state === 'playing' || state === 'paused')
    renderer?.resize(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) {
    guard.cancel();
    pause();
} });
window.addEventListener('pagehide', () => { if (state === 'playing')
    pause(); });
entry();
