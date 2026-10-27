# Test-only canonical verses for AI curation

Four genuine verses: GEN1:1,2:7,2:10,3:1; original Portuguese text, including original trailing whitespace. They validate the four explicitly curated narrative parallels, never enter model context, and never seed development. Same translation/attribution/license as the admitted S02 corpus; notice remains in ../../../biblical-canon/porbr2018/NOTICE.source.html.

Reproduce from authenticated originals in backend: `python scripts/prepare-ai-canon.py data/biblical-canon/porbr2018 test/fixtures/ai-assistant/biblical-canon/porbr2018/snapshot.json`. The script checks original ZIP SHA1f71b7765795ae7cc416a9255c7d9c3a3932ce868206fa762606c7438c8fc682 and XML SHA5e2845e9d5551b86aaffef56d689a77946fdf8eabfb672b15d15fa8a23e627db, extracts the four exact XML values, and compares them with the original derived snapshot before writing. No source, license or translation changes; S02 fixture remains intact.
