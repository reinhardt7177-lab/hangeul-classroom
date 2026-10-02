"""Create pixel-identical WebP classroom assets; retain the source PNG/JPEG files.

Run with Pillow installed. --verify checks decoded pixels, source hashes and sizes
without writing anything. The manifest is also the deployment image allowlist.
"""
from pathlib import Path
from hashlib import sha256
import argparse
import json
from PIL import Image

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / 'dist' / 'assets'
MANIFEST = ROOT / 'image-assets.json'
SOURCES = [
    'hero-sejong.png', 'writing-desk.png', 'school-sign.png', 'classroom-note.png',
    'library-together.png', 'hangul-garden.png', 'timeline-skia.png',
    'documentary-poster.png', 'gaecheon-documentary-poster.png', 'gaecheon-tree.png',
    'gaecheon-bear-tiger.png', 'gaecheon-community.png', 'gaecheon-classroom.png',
    'gaecheon-dolmen.png', 'gaecheon-fact-skia.png', 'gaecheon-helping-today.png',
    'gaecheon-source-study.png', 'gaecheon-story-hwanung.png',
    'gaecheon-story-promise.png', 'gaecheon-story-ungnyeo.png', 'gaecheon-story-dangun.png',
    'bronze-dagger-songgukri.jpg', 'gochang-dolmen-steve46814.jpg',
    'hunminjeongeum-haerye-facsimile.jpg',
]


def inspect(source_name, write):
    source = ASSETS / source_name
    target = source.with_suffix('.webp')
    with Image.open(source) as original:
        pixels = original.convert('RGBA' if 'A' in original.getbands() else 'RGB')
        if write:
            metadata = {key: original.info[key] for key in ('icc_profile', 'exif')
                        if original.info.get(key)}
            # In lossless mode quality controls compression effort, not pixel fidelity.
            pixels.save(target, 'WEBP', lossless=True, quality=80, method=4,
                        exact=True, **metadata)
        with Image.open(target) as converted:
            assert converted.format == 'WEBP', target.name
            assert converted.size == pixels.size, target.name
            assert converted.convert(pixels.mode).tobytes() == pixels.tobytes(), target.name
        return dict(source=source.name, file=target.name, width=pixels.width,
                    height=pixels.height, sourceBytes=source.stat().st_size,
                    bytes=target.stat().st_size,
                    sourceSha256=sha256(source.read_bytes()).hexdigest(),
                    sha256=sha256(target.read_bytes()).hexdigest())


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--verify', action='store_true')
    args = parser.parse_args()
    records = []
    for source in SOURCES:
        records.append(inspect(source, not args.verify))
        print(f'{len(records)}/{len(SOURCES)} {source}: pixels identical', flush=True)
    manifest = dict(encoding='lossless', resized=False, images=records)
    if args.verify:
        assert manifest == json.loads(MANIFEST.read_text(encoding='utf-8'))
    else:
        MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n',
                            encoding='utf-8')
    before = sum(image['sourceBytes'] for image in records)
    after = sum(image['bytes'] for image in records)
    print(json.dumps(dict(images=len(records), originalBytes=before, webpBytes=after,
                          reductionPercent=round((1-after/before)*100, 2),
                          decodedPixels='identical', originals='preserved'), ensure_ascii=False))


if __name__ == '__main__':
    main()
