import json
from pathlib import Path
import soundfile as sf
import numpy as np
from scipy.signal import resample_poly
from faster_whisper import WhisperModel
import librosa
x,sr=sf.read('.audio-work/vocals.wav',dtype='float32');mono=x.mean(1)
model=WhisperModel('small.en',device='cpu',compute_type='int8',cpu_threads=4,download_root='.audio-work/models',local_files_only=True)
rows=[]
for start,end in [(54,66),(66,78),(78,90),(90,100)]:
 audio=resample_poly(mono[int(start*sr):int(end*sr)],16000,sr)
 segs,_=model.transcribe(audio,language='en',word_timestamps=True,beam_size=5,condition_on_previous_text=False,vad_filter=False,repetition_penalty=1.15,no_repeat_ngram_size=4)
 for s in segs:
  r={'start':s.start+start,'end':s.end+start,'text':s.text,'words':[{'start':w.start+start,'end':w.end+start,'word':w.word,'probability':w.probability}for w in s.words or []]};rows.append(r);print(r['start'],r['end'],r['text'],flush=True)
Path('.audio-work/vocal-transcript.json').write_text(json.dumps(rows,indent=2))
# These are analysis candidates; review is needed for speech-like singing.
y=resample_poly(mono[54*sr:100*sr],1,2)
f0,voiced,confidence=librosa.pyin(y,sr=22050,fmin=90,fmax=900,frame_length=1024,hop_length=220)
times=54+librosa.times_like(f0,sr=22050,hop_length=220)
midi=librosa.hz_to_midi(f0)
np.savez('.audio-work/pitch.npz',times=times,pitch=midi,voiced=voiced,confidence=confidence)
print('Vocal evidence saved',flush=True)
