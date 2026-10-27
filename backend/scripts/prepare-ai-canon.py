"""Derive the four genuine, test-only AI curation verses; never seed development."""
import hashlib
import json
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path


def prepare(originals: Path, output: Path) -> None:
    pins = {
        'source.zip': '1f71b7765795ae7cc416a9255c7d9c3a3932ce868206fa762606c7438c8fc682',
    }
    for name, digest in pins.items():
        if hashlib.sha256((originals / name).read_bytes()).hexdigest() != digest:
            raise ValueError('Unadmitted canonical original')
    base = json.loads((originals / 'snapshot.json').read_bytes())
    with zipfile.ZipFile(originals / 'source.zip') as archive:
        xml = archive.read('porbr2018_vpl.xml')
    if hashlib.sha256(xml).hexdigest() != '5e2845e9d5551b86aaffef56d689a77946fdf8eabfb672b15d15fa8a23e627db':
        raise ValueError('Unadmitted XML member')
    wanted = {(1, 1), (2, 7), (2, 10), (3, 1)}
    verses = []
    for row in ET.fromstring(xml):
        chapter, number = int(row.attrib['c']), int(row.attrib['v'])
        if row.attrib['b'] == 'GEN' and (chapter, number) in wanted:
            value = {'bookCode': 'GEN', 'chapter': chapter, 'number': number, 'text': ''.join(row.itertext())}
            if value not in base['verses']:
                raise ValueError('Derived snapshot differs from the admitted XML')
            verses.append(value)
    if len(verses) != 4 or base['translation']['sourceSha256'] != pins['source.zip']:
        raise ValueError('Incomplete canonical fixture')
    value = {'translation': base['translation'], 'books': [row for row in base['books'] if row['code'] == 'GEN'],
             'chapters': [row for row in base['chapters'] if row['bookCode'] == 'GEN' and row['number'] in (1, 2, 3)], 'verses': verses}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes((json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8'))


if __name__ == '__main__':
    try:
        if len(sys.argv) != 3:
            raise ValueError('Explicit original directory and fixture output required')
        prepare(Path(sys.argv[1]), Path(sys.argv[2]))
    except (ValueError, OSError, KeyError, ET.ParseError, zipfile.BadZipFile):
        print('Canonical fixture preparation refused.', file=sys.stderr)
        sys.exit(1)
