"""Local analysis aid only. Output is evidence, not a verified gameplay chart."""
import json
from pathlib import Path
import soundfile as sf
import numpy as np
from scipy.signal import resample_poly
from faster_whisper import WhisperModel
source=Path('assets/music/Satisfied.flac')
y,sr=sf.read(source,dtype='float32')
print(json.dumps({'sample_rate':sr,'duration':len(y)/sr,'channels':y.shape[1]}),flush=True)
mono=y.mean(axis=1)
# First half contains the requested scene, confirmed using transcription output.
audio=resample_poly(mono[:sr*180],16000,sr)
model=WhisperModel('small.en',device='cpu',compute_type='int8',cpu_threads=4,download_root='.audio-work/models')
segments,info=model.transcribe(audio,language='en',word_timestamps=True,beam_size=5,vad_filter=False,condition_on_previous_text=False)
rows=[]
for seg in segments:
 row={'start':seg.start,'end':seg.end,'text':seg.text,'words':[{'start':w.start,'end':w.end,'word':w.word,'probability':w.probability} for w in seg.words or []]}
 rows.append(row)
 print(f'{seg.start:.2f}-{seg.end:.2f} {seg.text}',flush=True)
Path('.audio-work/transcript.json').write_text(json.dumps(rows,indent=2))
