"""Separate only analysis excerpt locally. Stems remain unverified model outputs."""
import os
from pathlib import Path
os.environ['HF_HOME']=str(Path('.audio-work/hf').resolve())
os.environ['TORCH_HOME']=str(Path('.audio-work/torch').resolve())
import torch, soundfile as sf
from demucs.pretrained import get_model
from demucs.apply import apply_model

torch.set_num_threads(4)
y,sr=sf.read('assets/music/Satisfied.flac',dtype='float32',stop=44100*180)
assert sr==44100
model=get_model('htdemucs')
device='mps' if torch.backends.mps.is_available() else 'cpu'
print('Model ready; device',device,flush=True)
x=torch.from_numpy(y.T.copy())
ref=x.mean(0);mean=ref.mean();std=ref.std();x=(x-mean)/std
with torch.no_grad():
 result=apply_model(model,x[None],device=device,shifts=0,split=True,overlap=.25,progress=True)[0].cpu()*std+mean
for name,a in zip(model.sources,result):
 sf.write(f'.audio-work/{name}.wav',a.numpy().T,sr,subtype='PCM_16')
v=result[list(model.sources).index('vocals')]
# Use source minus predicted vocal so the two stems reconstruct the reference.
sf.write('.audio-work/instrumental.wav',y-v.numpy().T,sr,subtype='PCM_16')
print('Local stems ready',flush=True)
