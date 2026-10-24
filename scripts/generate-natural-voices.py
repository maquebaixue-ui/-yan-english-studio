"""Rebuild public M2/M4/M5 recordings locally; never calls a speech API.

Install numpy, onnxruntime, soundfile and lameenc in your Python environment.
Download the pinned model and official py/helper.py described in README.md.
Usage: python scripts/generate-natural-voices.py --model-dir /path/to/assets --helper-dir /path/to/py
"""
import argparse,json,re,subprocess,sys
from pathlib import Path

parser=argparse.ArgumentParser()
parser.add_argument('--model-dir',type=Path,required=True)
parser.add_argument('--helper-dir',type=Path,required=True)
args=parser.parse_args()
sys.path.insert(0,str(args.helper_dir.resolve()))
import numpy as np
import onnxruntime as ort
import lameenc
from helper import load_cfgs,load_onnx_all,load_text_processor,load_voice_style,TextToSpeech

root=Path(__file__).resolve().parents[1]
code="import{WORDS}from'./dist/data.js';import{LIBRARY}from'./dist/library-data.js';console.log(JSON.stringify({words:WORDS.slice(0,20),listening:LIBRARY.filter(x=>x.kind==='听力')}));"
items=json.loads(subprocess.check_output(['node','--input-type=module','-e',code],cwd=root,encoding='utf-8'))
opts=ort.SessionOptions();opts.intra_op_num_threads=4;opts.inter_op_num_threads=1
models=args.model_dir.resolve()
tts=TextToSpeech(load_cfgs(str(models/'onnx')),load_text_processor(str(models/'onnx')),*load_onnx_all(str(models/'onnx'),opts,['CPUExecutionProvider']))
out=root/'dist/audio/voices';out.mkdir(parents=True,exist_ok=True)
manifest={'model':'Supertonic 3','revision':'aafc6e32416a594460b32413efc49d7fe4ce6d46','license':'OpenRAIL-M','source':'https://huggingface.co/supertone-oss-archive/supertonic-3','voices':['M2','M4','M5'],'wordCount':20,'listeningCount':4,'words':{w['word']:w['id']for w in items['words']},'files':[]}
def save(name,a):
    assert np.isfinite(a).all() and len(a)>tts.sample_rate*.1
    encoder=lameenc.Encoder();encoder.set_bit_rate(48);encoder.set_in_sample_rate(tts.sample_rate);encoder.set_channels(1);encoder.set_quality(2)
    raw=encoder.encode((np.clip(a,-1,1)*32767).astype('<i2').tobytes())+encoder.flush()
    (out/name).write_bytes(raw)
    manifest['files'].append({'file':name,'seconds':round(len(a)/tts.sample_rate,3),'bytes':len(raw)})
for voice in manifest['voices']:
    np.random.seed(20261024)
    style=load_voice_style([str(models/f'voice_styles/{voice}.json')]*20)
    wav,dur=tts.batch([w['word']for w in items['words']],['en']*20,style,8,1.0)
    for i,w in enumerate(items['words']):save(f"{voice}-{w['id']}.mp3",wav[i,:int(tts.sample_rate*dur[i])])
    style=load_voice_style([str(models/f'voice_styles/{voice}.json')])
    for item in items['listening']:
        chunks=[]
        for text in re.split(r'(?<=[.!?])\s+',item['text'].strip()):
            wav,dur=tts(text,'en',style,8,1.0)
            chunks.extend([wav[0,:int(tts.sample_rate*dur[0])],np.zeros(int(.22*tts.sample_rate),dtype=np.float32)])
        save(f"{voice}-{item['id']}.mp3",np.concatenate(chunks))
    preview="Take your time. You don't have to get every word right today. I'm here with you. Let's try one sentence, slowly."
    wav,dur=tts(preview,'en',style,8,1.0);save(f'{voice}-preview.mp3',wav[0,:int(tts.sample_rate*dur[0])])
(out/'source.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print('Generated 75 public recordings locally.')
