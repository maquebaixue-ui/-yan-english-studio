"""Rebuild sentence windows for the shipped Supertonic recordings.

Uses local model duration prediction, not forced alignment or an online API.
python scripts/build-method-timings.py --model-dir /path/to/assets --helper-dir /path/to/py
Requires numpy and onnxruntime plus the official Supertonic helper.py.
"""
import argparse,json,re,subprocess,sys
from pathlib import Path
parser=argparse.ArgumentParser()
parser.add_argument('--model-dir',type=Path,required=True)
parser.add_argument('--helper-dir',type=Path,required=True)
args=parser.parse_args();sys.path.insert(0,str(args.helper_dir.resolve()))
import onnxruntime as ort
from helper import load_voice_style,load_text_processor
root=Path(__file__).resolve().parents[1];model=args.model_dir.resolve()
items=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import{LIBRARY}from'./dist/library-data.js';console.log(JSON.stringify(LIBRARY.filter(x=>x.kind==='听力')));"],cwd=root,encoding='utf-8'))
manifest=json.loads((root/'dist/audio/voices/source.json').read_text(encoding='utf-8'))
opts=ort.SessionOptions();opts.intra_op_num_threads=4
session=ort.InferenceSession(str(model/'onnx/duration_predictor.onnx'),sess_options=opts,providers=['CPUExecutionProvider'])
processor=load_text_processor(str(model/'onnx'));rate=44100;result={}
for item in items:
    parts=re.split(r'(?<=[.!?])\s+',item['text'].strip());result[item['id']]={'sentences':parts,'voices':{}}
    for voice in ['M2','M4','M5']:
        style=load_voice_style([str(model/f'voice_styles/{voice}.json')]);at=0;windows=[]
        for text in parts:
            ids,mask=processor([text],['en'])
            seconds=float(session.run(None,{'text_ids':ids,'text_mask':mask,'style_dp':style.dp})[0][0])
            frames=int(rate*seconds)
            windows.append([round(at/rate+.025,4),round((at+frames)/rate+.025,4)])
            at+=frames+int(.22*rate)
        expected=next(f['seconds']for f in manifest['files']if f['file']==f"{voice}-{item['id']}.mp3")
        if abs(at/rate-expected)>=.002:raise ValueError('Shipped recording differs from its generation recipe; do not publish unverified timestamps.')
        result[item['id']]['voices'][voice]=windows
(root/'dist/methods-timing.js').write_text('// Sentence boundaries derived from the exact synthetic audio duration predictor. Seconds; includes MP3 encoder padding allowance.\nexport const LISTENING_TIMING='+json.dumps(result,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
print('Verified every sentence window against the shipped recording durations.')
