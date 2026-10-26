"""Quantize the pinned COCO-SSD float weights for small browser downloads.
Uses TensorFlow.js per-tensor uint8 weight encoding (min + scale * value).
Original downloaded assets are retained under ignored .local/world-model-original.
"""
import json,math,hashlib,pathlib,shutil,numpy as np
root=pathlib.Path(__file__).resolve().parents[1];folder=root/'dist/models/world';original=root/'.local/world-model-original';original.mkdir(parents=True,exist_ok=True)
model=json.loads((folder/'model.json').read_text());shutil.copyfile(folder/'model.json',original/'model.json');output=bytearray();allweights=[]
for group in model['weightsManifest']:
 raw=b''.join((folder/p).read_bytes()for p in group['paths']);at=0
 for path in group['paths']:shutil.copyfile(folder/path,original/path)
 for w in group['weights']:
  if 'quantization'in w:raise ValueError('Already quantized')
  n=math.prod(w['shape']);chunk=raw[at:at+4*n];at+=4*n
  if w['dtype']=='float32':
   a=np.frombuffer(chunk,dtype='<f4').astype(np.float64);lo=float(a.min())if n else 0;hi=float(a.max())if n else 0;scale=(hi-lo)/255 if hi>lo else 1
   q=np.clip(np.rint((a-lo)/scale),0,255).astype('u1');output.extend(q.tobytes());w['quantization']={'dtype':'uint8','min':lo,'scale':scale}
  elif w['dtype']=='int32':output.extend(chunk)
  else:raise ValueError('Unsupported weight dtype')
  allweights.append(w)
 if at!=len(raw):raise ValueError('Weight length mismatch')
paths=[]
for i,start in enumerate(range(0,len(output),1048576)):
 name=f'quantized-{i+1}.bin';paths.append(name);(folder/name).write_bytes(output[start:start+1048576])
model['weightsManifest']=[{'paths':paths,'weights':allweights}];(folder/'model.json').write_text(json.dumps(model,separators=(',',':')),encoding='utf8')
meta=json.loads((root/'dist/vendor/world/source.json').read_text());meta['originalFiles']=meta['files'];meta['files']=[x for x in meta['files']if not x['file'].startswith('models/')];meta['note']='COCO-SSD float32 weights quantized per tensor to TFJS uint8 (min + scale * q); int32 constants preserved. Learning cards use local templates. See scripts/quantize-world-model.py.'
for file in [folder/'model.json',*[folder/p for p in paths]]:
 b=file.read_bytes();meta['files'].append({'file':file.relative_to(root/'dist').as_posix(),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
(root/'dist/vendor/world/source.json').write_text(json.dumps(meta,indent=2),encoding='utf8')
print(json.dumps({'weights':len(output),'total':sum(x['bytes']for x in meta['files']),'files':paths}))
# Only the specifically downloaded old files are removed; originals are retained above.
for group in json.loads((original/'model.json').read_text())['weightsManifest']:
 for name in group['paths']:
  file=(folder/name).resolve()
  if file.parent!=folder.resolve()or not name.startswith('group1-shard'):raise ValueError('Unexpected old file')
  file.unlink()
