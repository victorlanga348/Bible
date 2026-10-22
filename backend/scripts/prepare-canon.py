"""Explicit, pinned corpus preparation; never executed by the HTTP runtime."""
import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET
import zipfile

base = Path('data/biblical-canon/porbr2018')
fixture = Path('test/fixtures/biblical-canon/porbr2018/manifest.json')
manifest = json.loads(fixture.read_text(encoding='utf-8'))
archive = base / 'source.zip'
assert hashlib.sha256(archive.read_bytes()).hexdigest() == '1f71b7765795ae7cc416a9255c7d9c3a3932ce868206fa762606c7438c8fc682'
with zipfile.ZipFile(archive) as zipped:
    xml = zipped.read('porbr2018_vpl.xml')
    notice = zipped.read('porbr2018_about.htm')
assert hashlib.sha256(xml).hexdigest() == '5e2845e9d5551b86aaffef56d689a77946fdf8eabfb672b15d15fa8a23e627db'
assert hashlib.sha256(notice).hexdigest() == manifest['noticeSha256']
verses = [dict(bookCode=v.attrib['b'], chapter=int(v.attrib['c']), number=int(v.attrib['v']), text=v.text) for v in ET.fromstring(xml).iter('v')]
assert len(verses) == 31102
assert all(isinstance(v['text'], str) and v['text'].strip() for v in verses)
assert len({(v['bookCode'], v['chapter'], v['number']) for v in verses}) == len(verses)
books = [dict(translationId=manifest['translation']['id'], code=b['code'], name=b['name'], order=b['order']) for b in manifest['catalog']]
positions = list(dict.fromkeys((v['bookCode'], v['chapter']) for v in verses))
chapters = [dict(translationId=manifest['translation']['id'], bookCode=b, number=c) for b, c in positions]
assert len(books) == 66 and len(chapters) == 1189
assert {v['bookCode'] for v in verses} == {b['code'] for b in books}
snapshot = dict(translation=manifest['translation'], books=books, chapters=chapters, verses=verses)
output = base / 'snapshot.json'
output.write_bytes((json.dumps(snapshot, ensure_ascii=False, separators=(',', ':')) + '\n').encode('utf-8'))
restored = json.loads(output.read_text(encoding='utf-8'))
assert restored == snapshot  # Full text/identity round trip, including trailing spaces.
print(json.dumps(dict(result='PASS', books=len(books), chapters=len(chapters), verses=len(verses), snapshotSha256=hashlib.sha256(output.read_bytes()).hexdigest())))
