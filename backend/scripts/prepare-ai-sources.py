"""Derive the explicitly scoped local AI admission from authenticated originals."""
import hashlib
import importlib.util
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True


def digest(value):
    return hashlib.sha256(value).hexdigest()


def json_bytes(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8')


def main():
    if len(sys.argv) != 5 or sys.argv[1] not in ('local-ai', 'test-ai'):
        raise ValueError('Explicit local-ai/test-ai purpose, HTML, TXT and output directory required')
    purpose = sys.argv[1]
    html_path, txt_path, output = map(Path, sys.argv[2:])
    root = Path(__file__).resolve().parent.parent
    base_bytes = (root / 'admissions/josephus-antiquities-pg2848-en.local.json').read_bytes()
    if digest(base_bytes) != 'a5162f8e2d72aaa746238ee2e2c2d6d0d25e33afac8c74fdff23cad1b3450efa':
        raise ValueError('Original operational metadata changed')
    base = json.loads(base_bytes)
    profile_digest = 'cf12565112a0c5b84a7065200ee01362052f1ae3dee6296c16a8dccabbc5dc0f'
    if digest((root / 'admissions/local-extractive-v1.json').read_bytes()) != profile_digest:
        raise ValueError('Runtime profile changed')
    html = html_path.read_bytes()
    txt = txt_path.read_bytes()
    if len(html) != base['sourceBytes'] or digest(html) != base['source']['snapshotSha256'] or digest(txt) != base['noticeContainerSha256']:
        raise ValueError('Unadmitted original bytes')
    spec = importlib.util.spec_from_file_location('biblia_source_parser', root / 'scripts/prepare-sources.py')
    parser_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(parser_module)
    parser = parser_module.ChapterParser()
    parser.feed(html.decode('utf-8', errors='strict'))
    if [number for number, _ in parser.paragraphs] != [1, 2, 3, 4] or parser.markers != 5:
        raise ValueError('Unexpected source coverage')
    raw_source = base['source']
    raw_excerpts = [dict(id=f"{raw_source['id']}-b1-c1-p{number}", sourceId=raw_source['id'], locator=f'book-1/chapter-1/paragraph-{number}', order=number, text=text, textSha256=digest(text.encode('utf-8')), originUrl=raw_source['originUrl']) for number, text in parser.paragraphs]
    notice = txt[txt.index(b'START: FULL LICENSE'):]
    if digest(json_bytes(raw_excerpts)) != base['excerptsSha256'] or digest(notice) != base['noticeSha256']:
        raise ValueError('Derived original paragraphs or notice differ')
    source_id = 'josephus-antiquities-pg2848-en-local-ai-v1'
    source = dict(raw_source)
    source['id'] = source_id
    source['permissions'] = {**raw_source['permissions'], 'sendToAi': 'allowed'}
    source['rightsStatement'] = raw_source['rightsStatement'].replace('No AI use admitted.', '').strip() + ' This admission of the same work permits only local personal embeddings and one-sentence extractive selection in the pinned authenticated loopback runtime; no training, remote provider, public service or commercial redistribution.'
    excerpts = [{**row, 'id': f"{source_id}-b1-c1-p{row['order']}", 'sourceId': source_id} for row in raw_excerpts]
    excerpt_bytes = json_bytes(excerpts)
    curations = [
        ('creation', 1, 1, 1, 'Both passages narrate creation of heaven and earth; narrative parallel only, no independent historical confirmation.'),
        ('human-formation', 2, 7, 2, 'Both passages narrate formation of the human from earth and the giving of life; narrative parallel only, not independent geological evidence.'),
        ('eden-rivers', 2, 10, 3, 'Both passages narrate the river of Eden and four branches; narrative parallel only, not independent geographical verification.'),
        ('serpent', 3, 1, 4, 'Both passages narrate the serpent addressing the woman; narrative parallel only, not independent historical confirmation.'),
    ]
    manifest = {**base, 'purpose': purpose, 'source': source, 'rawExcerptsSha256': base['excerptsSha256'], 'excerptsSha256': digest(excerpt_bytes), 'runtimeProfileSha256': profile_digest,
                'scope': 'Identified genuine test fixture only; not a development seed. CI uses deterministic doubles; no CI-provider inference admitted.' if purpose == 'test-ai' else 'Scoped local personal AI processing only; raw original derivative, never a fixture seed or an independent witness.',
                'curatedPassageLinks': [dict(id=f'local-ai-v1-gen-{name}', excerptId=f'{source_id}-b1-c1-p{paragraph}', translationId='porbr2018', bookCode='GEN', chapter=chapter, fromVerse=verse, toVerse=verse, nature='narrative-parallel', rationale=rationale) for name, chapter, verse, paragraph, rationale in curations],
                'legalEvidence': {**base['legalEvidence'], 'scope': 'Same limited original-text review; local personal AI only, retained attribution/integrity/full notice; no remote provider, public service or commercial exploitation.'},
                'transformations': [*base['transformations'], 'Rename source and excerpt identities for a separate local-ai-v1 admission without changing text, digest, locator, order or attribution', 'Declare separately reviewed narrative parallels; no additional witness, historical confirmation or transmission of biblical text to AI']}
    output.mkdir(parents=True, exist_ok=True)
    (output / 'manifest.json').write_bytes(json_bytes(manifest))
    (output / 'excerpts.json').write_bytes(excerpt_bytes)
    (output / 'NOTICE.source.txt').write_bytes(notice)
    print(json.dumps(dict(result='PASS', purpose=purpose, excerpts=len(excerpts), manifestSha256=digest(json_bytes(manifest)), excerptsSha256=digest(excerpt_bytes), noticeSha256=digest(notice))))

if __name__ == '__main__':
    main()
