"""Apply explicit editorial segmentation to local alignment/pitch evidence.
Output stays labelled draft. This is not an automatic verified transcription.
"""
import json,hashlib
from pathlib import Path
import numpy as np,soundfile as sf,librosa,lameenc
rows=json.loads(Path('.audio-work/vocal-transcript.json').read_text());words=[dict(w)for r in rows if r['start']>=67 for w in r['words'] if w['start']<98.93]
# Editorial corrections; timings retained from candidate alignment, confidence stays visible.
for w in words:
 s=w['word'].strip().strip('.,!').lower()
 w['word']={'salty':'soldier','said':'said'}.get(s,s)
 if 94.1<=w['start']<94.6:w['word']='set'
# Missing 'frame' was swallowed by the start of the next sentence.
for w in words:
 if w['start']==90.0:w['start']=90.45
words.append({'word':'frame','start':89.88,'end':90.45,'probability':0.0})
words.sort(key=lambda w:w['start'])
# Explicit groups balance lyric readability against rapid rap density.
phrases=['i','remember','that night','i just','might','regret','that night','for the rest','of my','days','i','remember','those','soldier boys','tripping','over','themselves','to win','our','praise','i','remember','that','dreamlike','candlelight','like a dream','that you','can’t quite','place','but','alexander','i’ll never','forget','the first','time','i saw','your','face','i have','never','been','the','same','intelligent','eyes','in a','hunger-pang','frame','and when','you','said','hi','i','forgot','my','dang','name','set my','heart','aflame','every','part','aflame','this','is','not','a','game']
# Word ranges map to phrase chunks and documented corrected transcriptions.
ranges=[(67.6,68.1),(68.1,68.32),(68.32,68.86),(68.9,69.24),(69.24,69.46),(69.46,69.76),(69.76,70.34),(70.34,70.74),(70.74,71.08),(71.08,71.52),(71.52,71.98),(71.98,72.22),(72.22,72.58),(72.58,73.12),(73.12,73.52),(73.52,73.7),(73.7,74.14),(74.14,74.64),(74.64,74.94),(74.94,75.36),(75.36,75.86),(75.86,76.1),(76.1,76.38),(76.38,76.9),(76.9,77.5),(77.5,77.98),(78,78.36),(78.36,78.82),(78.82,79.32),(79.4,79.8),(79.8,80.56),(80.56,81.46),(81.46,81.8),(81.8,82.2),(82.2,82.48),(82.48,82.92),(82.92,83.18),(83.18,84.04),(84.04,85.12),(85.12,85.46),(85.46,85.82),(85.82,86.04),(86.04,86.6),(86.6,87.52),(87.52,88.5),(88.5,89.02),(89.02,89.88),(89.88,90.45),(90.45,91.16),(91.16,91.36),(91.36,91.72),(91.72,92.32),(92.5,92.64),(92.64,92.98),(92.98,93.32),(93.32,93.82),(93.82,94.16),(94.16,94.8),(94.8,95.12),(95.12,95.72),(95.9,96.18),(96.18,96.54),(96.54,97.22),(97.22,97.48),(97.48,97.66),(97.66,98),(98,98.24),(98.24,98.92)]
assert len(phrases)==len(ranges)
p=np.load('.audio-work/pitch.npz');notes=[];last=63.;offset=64.6
for i,(lyric,(a,b)) in enumerate(zip(phrases,ranges)):
 mask=(p['times']>=a)&(p['times']<b)&p['voiced']&(p['confidence']>=.12)&(p['pitch']>=54)&(p['pitch']<=78)
 values=p['pitch'][mask];confidence=round(float(mask.sum()/max(1,((p['times']>=a)&(p['times']<b)).sum())),3)
 valid=len(values)>=4
 pitch=round(float(np.median(values)),2)if valid else last
 if valid:last=pitch
 # Syllabic rap stays Tap even when a displayed chunk spans several consonants.
 kind='tap';curve=None
 if lyric in ['days','praise','place','face','same','eyes','hi','aflame'] and b-a>=.4 and valid:
  kind='hold'
  sample=[]
  for t in np.linspace(a+.04,b-.06,7):
   m=mask&(np.abs(p['times']-t)<=.065);v=p['pitch'][m]
   sample.append(float(np.median(v))if len(v)>=2 else pitch)
  sample=np.clip(sample,pitch-4,pitch+4)
  if max(sample)-min(sample)>=1.3 and confidence>=.5:
   kind='trace';curve=[{'time':round(t*(b-a),3),'pitch':round(float(v),2)}for t,v in zip(np.linspace(0,1,7),sample)];pitch=curve[0]['pitch']
 note={'id':f'satisfied-{i+1:03}','startTime':round(a-offset,3),'duration':round(b-a,3),'pitch':pitch,'lyric':lyric.capitalize()if lyric in ['i','this'] else lyric,'kind':kind,'pitchStatus':'estimated'if valid else 'reference','pitchConfidence':confidence,'timingStatus':'draft'}
 if curve:note['pitchCurve']=curve
 notes.append(note)
Path('src/satisfied-chart.json').write_text(json.dumps(notes,indent=2,ensure_ascii=False)+'\n')
# Cut synchronized stems only; no complete recording is exposed by the app.
end=99.35
Path('public/audio/satisfied').mkdir(parents=True,exist_ok=True)
for name in ['vocals','instrumental']:
 y,sr=sf.read(f'.audio-work/{name}.wav',start=round(offset*44100),stop=round(end*44100))
 # Model subtraction can clip; keep exported stem gain conservative.
 enc=lameenc.Encoder();enc.set_bit_rate(192);enc.set_in_sample_rate(sr);enc.set_channels(2);enc.set_quality(2)
 pcm=(np.clip(y*.8,-1,1)*32767).astype(np.int16)
 data=enc.encode(pcm.tobytes())+enc.flush();Path(f'public/audio/satisfied/{name}-excerpt.mp3').write_bytes(data)
meta={'id':'satisfied-flac-draft-v1','title':'Satisfied','duration':round(end-offset,3),'sourceOffset':offset,'sourceEnd':end,'firstVocalSourceTime':67.6,'lastVocalSourceTime':98.92,'quality':'draft','audio':{'vocal':'/audio/satisfied/vocals-excerpt.mp3','instrumental':'/audio/satisfied/instrumental-excerpt.mp3'},'noteCount':len(notes),'sourceSha256':hashlib.sha256(Path('assets/music/Satisfied.flac').read_bytes()).hexdigest()}
Path('src/satisfied-song.json').write_text(json.dumps(meta,indent=2)+'\n')
Path('docs/satisfied-chart-review.json').write_text(json.dumps({'status':'draft-not-a-reviewed-transcription','source':meta,'corrections':['salty→soldier','took rid→tripping','doing→to win','dream like→dreamlike','Said my heart of flame→Set my heart aflame','frame inserted 89.88–90.45 pending listening check'],'notes':notes},indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'notes':len(notes),'duration':meta['duration'],'kinds':{k:sum(n['kind']==k for n in notes)for k in ['tap','hold','trace']},'referencePitchNotes':[n['lyric']for n in notes if n['pitchStatus']=='reference']}))
