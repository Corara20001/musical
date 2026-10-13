# Satisfied 录音谱面迭代

素材：assets/music/Satisfied.flac，16-bit、双声道、44.1kHz、329.2267s。
范围沿用用户原规格：I remember that night … this is not a game。先定位这个版本的实际段落，再设计歌词 Note；不把整首歌曲或节拍自动生成玩法作为范围。

本次执行：本地转写辅助找词与候选时间；本地分离候选人声/伴奏；信号分析辅助获得音高证据。工具输出仅是待校对证据，不作为已验证原始演唱转录。无谱面编辑器、AI Gameplay 或游戏内 AI 自动生成谱面。

Gameplay：短词/说唱 Tap；可保持的尾音 Hold；明确变音的连续声音 Trace。保留精确音高坐标与宽容操作；不将每个歌词硬吸附到节拍。若人声证据不可靠，标注 draft，不编造精确 Pitch。

实现：独立 song metadata 和 JSON chart；真实 AudioBuffer 分轨保持统一 clock，在 gate 打开时只听到对应人声。保持伴奏持续，迟点不重新启动原词头。完整混音仅作试听/reference，不能替代分轨开门。

验收：歌词边界、相邻词可读性、分轨同步、暂停与恢复的 sample offset、片段尾端与结算、曲长 UI、按谱面 Best Score key、加载错误。保留原始文件，不发布整首 FLAC，不把本地未校对版本写成线上完成。
