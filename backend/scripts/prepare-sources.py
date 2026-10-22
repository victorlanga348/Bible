"""Reconstruct the explicitly admitted local corpus from authenticated originals."""
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys


class ChapterParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.active = False
        self.paragraph = None
        self.skip_note = False
        self.markers = 0
        self.paragraphs = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == 'a':
            anchor = attributes.get('id')
            if anchor == 'link2HCH0001':
                self.active = True
            if anchor == 'link2HCH0002':
                self.active = False
            if self.active and attributes.get('href', '').startswith('#linknote-'):
                self.skip_note = True
                self.markers += 1
        if self.active and tag == 'p':
            self.paragraph = []

    def handle_endtag(self, tag):
        if tag == 'a':
            self.skip_note = False
        if tag == 'p' and self.paragraph is not None:
            text = re.sub(r'\s+', ' ', ''.join(self.paragraph)).strip()
            match = re.fullmatch(r'([1-4])\. (.+)', text)
            if match:
                self.paragraphs.append((int(match[1]), match[2]))
            self.paragraph = None

    def handle_data(self, data):
        if self.active and self.paragraph is not None and not self.skip_note:
            self.paragraph.append(data)


def main():
    if len(sys.argv) != 4:
        raise ValueError('Explicit HTML, TXT and output directory required')
    html_path, txt_path, output_path = map(Path, sys.argv[1:])
    admission = json.loads((Path(__file__).resolve().parent.parent / 'admissions/josephus-antiquities-pg2848-en.local.json').read_text(encoding='utf-8'))
    html = html_path.read_bytes()
    txt = txt_path.read_bytes()
    if len(html) != admission['sourceBytes'] or hashlib.sha256(html).hexdigest() != admission['source']['snapshotSha256']:
        raise ValueError('Unadmitted HTML bytes')
    if hashlib.sha256(txt).hexdigest() != admission['noticeContainerSha256']:
        raise ValueError('Unadmitted notice container')
    parser = ChapterParser()
    parser.feed(html.decode('utf-8', errors='strict'))
    if [number for number, _ in parser.paragraphs] != [1, 2, 3, 4] or parser.markers != 5:
        raise ValueError('Unexpected paragraph coverage or footnote markers')
    source = admission['source']
    excerpts = [dict(id=f"{source['id']}-b1-c1-p{number}", sourceId=source['id'], locator=f'book-1/chapter-1/paragraph-{number}',
                     order=number, text=text, textSha256=hashlib.sha256(text.encode('utf-8')).hexdigest(), originUrl=source['originUrl'])
                for number, text in parser.paragraphs]
    excerpt_bytes = (json.dumps(excerpts, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
    notice = txt[txt.index(b'START: FULL LICENSE'):]
    if hashlib.sha256(excerpt_bytes).hexdigest() != admission['excerptsSha256'] or hashlib.sha256(notice).hexdigest() != admission['noticeSha256']:
        raise ValueError('Derived text or notice differs from admission')
    output_path.mkdir(parents=True, exist_ok=True)
    (output_path / 'excerpts.json').write_bytes(excerpt_bytes)
    (output_path / 'NOTICE.source.txt').write_bytes(notice)
    print(json.dumps(dict(result='PASS', excerpts=len(excerpts), omittedFootnoteMarkers=parser.markers, excerptsSha256=admission['excerptsSha256'], noticeSha256=admission['noticeSha256'])))


if __name__ == '__main__':
    main()
