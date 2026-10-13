import json
from pathlib import Path
import soundfile as sf
from scipy.signal import resample_poly
from faster_whisper import WhisperModel
start=48
x,sr=sf.read('assets/music/Satisfied.flac',dtype='float32',start=start*44100,stop=100*44100)
x=resample_poly(x.mean(1),16000,sr)
model=WhisperModel('small.en',device='cpu',compute_type='int8',cpu_threads=4,download_root='.audio-work/models',local_files_only=True)
segments,_=model.transcribe(x,language='en',word_timestamps=True,beam_size=5,vad_filter=False,condition_on_previous_text=False,initial_prompt='Hamilton musical, Angelica Schuyler singing. I remember that night. This is not a game.')
rows=[]
for s in segments:
 row={'start':s.start+start,'end':s.end+start,'text':s.text,'words':[{'start':w.start+start,'end':w.end+start,'word':w.word,'probability':w.probability}for w in s.words or []]};rows.append(row);print(row['start'],row['end'],s.text,flush=True)
Path('.audio-work/excerpt-transcript.json').write_text(json.dumps(rows,indent=2))
