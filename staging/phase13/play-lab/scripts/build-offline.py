from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parents[1]
files=[root/'index.html',root/'progress.html',root/'stickers.html',root/'grown-ups.html']
for folder in ['games','shared','assets/runtime','assets/levels']:
 files.extend(p for p in (root/folder).rglob('*') if p.is_file() and not p.name.startswith('.'))
files.extend([root/'assets/book/floating-garden.jpg',root/'offline.js'])
files=sorted(set(files))
paths=[p.relative_to(root).as_posix() for p in files]
digest=hashlib.sha256()
for name,p in zip(paths,files):
 digest.update(name.encode()+b'\0'+p.read_bytes())
(root/'offline-files.js').write_text('self.OFFLINE_VERSION='+json.dumps(digest.hexdigest()[:16])+';\nself.OFFLINE_FILES='+json.dumps(paths)+';\n')
