from __future__ import annotations

import hashlib
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SHARED = ROOT.parent
STATIC_ARCHIVE = SHARED / "Quaderno-v0.1.0-PWA-static.zip"
SOURCE_ARCHIVE = SHARED / "Quaderno-v0.1.0-source.zip"
CHECKSUMS = SHARED / "Quaderno-v0.1.0-SHA256SUMS.txt"
EXCLUDED_PARTS = {".git", "node_modules", "dist", "coverage", ".vite", "artifacts"}


def add_tree(archive: zipfile.ZipFile, root: Path, prefix: Path | None = None) -> None:
    for path in sorted(root.rglob("*")):
        if not path.is_file():
            continue
        relative = path.relative_to(root)
        if any(part in EXCLUDED_PARTS for part in relative.parts):
            continue
        archive.write(path, (prefix / relative) if prefix else relative)


def digest(path: Path) -> str:
    value = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            value.update(chunk)
    return value.hexdigest()


if not (ROOT / "dist" / "index.html").exists():
    raise SystemExit("Build mancante: esegui npm run build prima del packaging.")

with zipfile.ZipFile(STATIC_ARCHIVE, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    add_tree(archive, ROOT / "dist")

with zipfile.ZipFile(SOURCE_ARCHIVE, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    add_tree(archive, ROOT, Path("quaderno"))

lines = [f"{digest(path)}  {path.name}" for path in (STATIC_ARCHIVE, SOURCE_ARCHIVE)]
CHECKSUMS.write_text("\n".join(lines) + "\n", encoding="utf-8")
for line in lines:
    print(line)
