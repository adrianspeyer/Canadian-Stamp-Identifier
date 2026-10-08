#!/usr/bin/env python3
"""
Canadian Stamp Identifier — QA Script
Checks for mismatches between stamps.json image paths and actual image files on disk.

Run from repo root:  python3 qa-images.py
"""

import json
import os
import sys

DATA_FILE = os.path.join("data", "stamps.json")

def main():
    # Load stamps.json
    if not os.path.isfile(DATA_FILE):
        print(f"ERROR: {DATA_FILE} not found. Run this from the repo root.")
        sys.exit(1)

    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    stamps = data.get("stamps", [])
    print(f"Loaded {len(stamps)} stamps from {DATA_FILE}\n")

    # 1. Collect all image paths referenced in stamps.json
    referenced = {}
    for s in stamps:
        img = s.get("image", "")
        if img:
            referenced.setdefault(img, []).append(s["id"])

    # 2. Collect all image files on disk under images/
    on_disk = set()
    for root, _dirs, files in os.walk("images"):
        for fname in files:
            if fname.lower().endswith((".jpg", ".jpeg", ".png", ".gif", ".webp")):
                rel = os.path.join(root, fname)
                on_disk.add(rel)

    referenced_set = set(referenced.keys())
    errors = 0

    # Check 1: stamps.json entries pointing to missing image files
    missing = sorted(referenced_set - on_disk)
    if missing:
        print(f"❌  {len(missing)} stamp(s) reference missing image files:")
        for path in missing:
            ids = ", ".join(f"#{i}" for i in referenced[path])
            print(f"   {ids} → {path}")
        errors += len(missing)
    else:
        print("✅  All stamp image paths exist on disk.")

    print()

    # Check 2: Image files on disk not referenced by any stamp
    orphans = sorted(on_disk - referenced_set)
    if orphans:
        print(f"⚠️   {len(orphans)} image file(s) on disk not referenced by any stamp:")
        for path in orphans:
            print(f"   {path}")
        errors += len(orphans)
    else:
        print("✅  No orphaned image files.")

    print()

    # Check 3: Duplicate image paths (two or more stamps sharing one file)
    dupes = {path: ids for path, ids in referenced.items() if len(ids) > 1}
    if dupes:
        print(f"❌  {len(dupes)} image path(s) shared by multiple stamps:")
        for path, ids in sorted(dupes.items()):
            id_list = ", ".join(f"#{i}" for i in ids)
            print(f"   {id_list} → {path}")
        errors += len(dupes)
    else:
        print("✅  No duplicate image paths.")

    print()

    # Check 4: Empty or missing fields
    required = ["id", "year", "mainTopic", "subTopic", "denomination", "color", "image", "notes"]
    empty_fields = []
    for s in stamps:
        for field in required:
            val = s.get(field, "")
            if val == "" or val is None:
                empty_fields.append((s["id"], field))

    if empty_fields:
        print(f"❌  {len(empty_fields)} empty/missing field(s):")
        for sid, field in empty_fields[:20]:
            print(f"   #{sid}: {field} is empty")
        if len(empty_fields) > 20:
            print(f"   ... and {len(empty_fields) - 20} more")
        errors += len(empty_fields)
    else:
        print("✅  All stamps have all 8 required fields populated.")

    print()

    # Check 5: Duplicate IDs
    ids = [s["id"] for s in stamps]
    seen = {}
    dup_ids = []
    for sid in ids:
        seen[sid] = seen.get(sid, 0) + 1
    dup_ids = {k: v for k, v in seen.items() if v > 1}
    if dup_ids:
        print(f"❌  {len(dup_ids)} duplicate ID(s):")
        for sid, count in sorted(dup_ids.items()):
            print(f"   #{sid} appears {count} times")
        errors += len(dup_ids)
    else:
        print("✅  No duplicate IDs.")

    print()

    # Summary
    if errors == 0:
        print("🎉  All checks passed!")
    else:
        print(f"⚠️   {errors} issue(s) found — see above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
