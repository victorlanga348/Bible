"""Explicit, pinned full-corpus preparation; independent of test fixtures."""
import hashlib
import json
import sys
from pathlib import Path
import xml.etree.ElementTree as ET
import zipfile


def checked(value: bool) -> None:
    if not value:
        raise ValueError('Unadmitted canonical preparation input')


def prepare() -> None:
    base = Path('data/biblical-canon/porbr2018')
    manifest = json.loads(Path('admissions/biblical-canon/porbr2018/manifest.json').read_text(encoding='utf-8'))
    # Semantic JSON pin is independent of checkout line endings or formatting.
    canonical = json.dumps(manifest, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')
    checked(hashlib.sha256(canonical).hexdigest() == '75108bba45f9c2a3a5f7ea52c4663a9f47b369653200bdb3534a720ba7afab1f')
    checked(manifest['purpose'] == 'operational-full-corpus-local' and 'fixtureSelection' not in manifest)
    archive = base / 'source.zip'
    checked(hashlib.sha256(archive.read_bytes()).hexdigest() == manifest['sourceSha256'])
    checked(hashlib.sha256((base / 'catalog.source.html').read_bytes()).hexdigest() == manifest['catalogSha256'])
    with zipfile.ZipFile(archive) as zipped:
        xml = zipped.read(manifest['member'])
        notice = zipped.read('porbr2018_about.htm')
    checked(hashlib.sha256(xml).hexdigest() == manifest['memberSha256'])
    checked(hashlib.sha256(notice).hexdigest() == manifest['noticeSha256'])
    verses = [dict(bookCode=v.attrib['b'], chapter=int(v.attrib['c']), number=int(v.attrib['v']), text=v.text) for v in ET.fromstring(xml).iter('v')]
    checked(len(verses) == manifest['verseCount'])
    checked(all(isinstance(v['text'], str) and v['text'].strip() for v in verses))
    checked(len({(v['bookCode'], v['chapter'], v['number']) for v in verses}) == len(verses))
    books = [dict(translationId=manifest['translation']['id'], code=b['code'], name=b['name'], order=b['order']) for b in manifest['catalog']]
    positions = list(dict.fromkeys((v['bookCode'], v['chapter']) for v in verses))
    chapters = [dict(translationId=manifest['translation']['id'], bookCode=b, number=c) for b, c in positions]
    checked(len(books) == manifest['bookCount'] and len(chapters) == manifest['chapterCount'])
    checked({v['bookCode'] for v in verses} == {b['code'] for b in books})
    snapshot = dict(translation=manifest['translation'], books=books, chapters=chapters, verses=verses)
    output = base / 'snapshot.json'
    encoded = (json.dumps(snapshot, ensure_ascii=False, separators=(',', ':')) + '\n').encode('utf-8')
    checked(json.loads(encoded) == snapshot)
    output.write_bytes(encoded)
    print(json.dumps(dict(result='PASS', books=len(books), chapters=len(chapters), verses=len(verses), snapshotSha256=hashlib.sha256(encoded).hexdigest())))


if __name__ == '__main__':
    try:
        prepare()
    except Exception:
        print('CANON_PREPARATION_FAILED', file=sys.stderr)
        sys.exit(1)
