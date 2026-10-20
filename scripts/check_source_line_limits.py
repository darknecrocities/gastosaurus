#!/usr/bin/env python3
"""
check_source_line_limits.py - Validates the 500-Line Source File Policy.

Enforces physical line limit guardrails across source code files.
Excludes package managers, build artifacts, lockfiles, and virtual environments.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Set, Tuple

DEFAULT_MAX_LINES = 500

DEFAULT_EXTENSIONS: Set[str] = {
    ".ts", ".tsx", ".js", ".jsx", ".py", ".java", ".go", ".rs", ".cs",
}

DEFAULT_EXCLUDE_DIRS: Set[str] = {
    ".git", ".hg", ".svn", "node_modules", "vendor", "venv", ".venv",
    "env", ".env", "__pycache__", "dist", "build", "target", ".next",
    ".nuxt", ".output", "out", "coverage", ".tox", ".pytest_cache",
    ".mypy_cache", ".ruff_cache", ".agents", ".gemini", "brain",
}

DEFAULT_EXCLUDE_FILES: Set[str] = {
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "poetry.lock",
    "Pipfile.lock", "Cargo.lock", "go.sum", "composer.lock",
}


def count_physical_lines(file_path: Path) -> int:
    """Count physical lines including blanks and comments."""
    try:
        with open(file_path, "rb") as f:
            count = 0
            for _ in f:
                count += 1
            return count
    except (OSError, UnicodeDecodeError):
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                return sum(1 for _ in f)
        except OSError as err:
            sys.stderr.write(f"Warning: Unable to read {file_path}: {err}\n")
            return 0


def scan_directory(
    root_dir: Path,
    max_lines: int = DEFAULT_MAX_LINES,
    allowed_extensions: Set[str] | None = None,
    exclude_dirs: Set[str] | None = None,
    exclude_files: Set[str] | None = None,
    verbose: bool = False,
) -> Tuple[List[Dict[str, object]], List[Dict[str, object]]]:
    """Scan root_dir and return (violations, scanned_files)."""
    extensions = allowed_extensions or DEFAULT_EXTENSIONS
    dirs_to_skip = exclude_dirs or DEFAULT_EXCLUDE_DIRS
    files_to_skip = exclude_files or DEFAULT_EXCLUDE_FILES

    violations: List[Dict[str, object]] = []
    scanned: List[Dict[str, object]] = []

    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if d not in dirs_to_skip]

        for fname in filenames:
            if fname in files_to_skip:
                continue

            file_path = Path(dirpath) / fname
            if file_path.suffix.lower() not in extensions:
                continue

            lines = count_physical_lines(file_path)
            rel_path = str(file_path.relative_to(root_dir)) if root_dir != file_path else fname

            record = {
                "file": rel_path,
                "absolute_path": str(file_path.resolve()),
                "lines": lines,
                "max_allowed": max_lines,
            }
            scanned.append(record)

            if lines > max_lines:
                violations.append(record)
                if verbose:
                    sys.stderr.write(f"[VIOLATION] {rel_path}: {lines} lines (max {max_lines})\n")
            elif verbose:
                sys.stderr.write(f"[OK] {rel_path}: {lines} lines\n")

    return violations, scanned


def build_arg_parser() -> argparse.ArgumentParser:
    """Configure CLI arguments."""
    parser = argparse.ArgumentParser(
        description="Verify that source files do not exceed the physical line limit.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--path", "-p",
        type=str,
        default=".",
        help="Root directory or file to check.",
    )
    parser.add_argument(
        "--max-lines", "-m",
        type=int,
        default=DEFAULT_MAX_LINES,
        help="Maximum allowable physical lines per source file.",
    )
    parser.add_argument(
        "--extensions", "-e",
        type=str,
        default=",".join(sorted(DEFAULT_EXTENSIONS)),
        help="Comma-separated list of file extensions to check.",
    )
    parser.add_argument(
        "--exclude-dirs",
        type=str,
        default="",
        help="Additional comma-separated directory names to exclude.",
    )
    parser.add_argument(
        "--exclude-files",
        type=str,
        default="",
        help="Additional comma-separated file names to exclude.",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results in JSON format.",
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Print each scanned file and status.",
    )
    return parser


def main() -> int:
    parser = build_arg_parser()
    args = parser.parse_args()

    target_path = Path(args.path).resolve()
    if not target_path.exists():
        sys.stderr.write(f"Error: Path '{args.path}' does not exist.\n")
        return 2

    extensions = {
        ext if ext.startswith(".") else f".{ext}"
        for ext in [x.strip() for x in args.extensions.split(",") if x.strip()]
    }

    exclude_dirs = set(DEFAULT_EXCLUDE_DIRS)
    if args.exclude_dirs:
        exclude_dirs.update(x.strip() for x in args.exclude_dirs.split(",") if x.strip())

    exclude_files = set(DEFAULT_EXCLUDE_FILES)
    if args.exclude_files:
        exclude_files.update(x.strip() for x in args.exclude_files.split(",") if x.strip())

    if target_path.is_file():
        lines = count_physical_lines(target_path)
        violations = []
        scanned = [{"file": target_path.name, "lines": lines, "max_allowed": args.max_lines}]
        if lines > args.max_lines:
            violations.append(scanned[0])
    else:
        violations, scanned = scan_directory(
            root_dir=target_path,
            max_lines=args.max_lines,
            allowed_extensions=extensions,
            exclude_dirs=exclude_dirs,
            exclude_files=exclude_files,
            verbose=args.verbose,
        )

    if args.json:
        output_payload = {
            "status": "fail" if violations else "pass",
            "root_path": str(target_path),
            "max_lines": args.max_lines,
            "scanned_count": len(scanned),
            "violation_count": len(violations),
            "violations": violations,
        }
        print(json.dumps(output_payload, indent=2))
    else:
        print(f"\nSource File Line Limit Checker (Threshold: {args.max_lines} lines)")
        print(f"Scanned {len(scanned)} source file(s) in: {target_path}")

        if violations:
            print(f"\n[FAIL] Found {len(violations)} file(s) exceeding {args.max_lines} lines:\n")
            for v in violations:
                print(f"  • {v['file']}: {v['lines']} lines (+{int(v['lines']) - args.max_lines} lines over)")
            print("\nPlease refactor these files according to the 7-step extraction protocol in SKILL.md.")
        else:
            print("[PASS] All checked source files comply with the line limit guardrail.")

    return 1 if violations else 0


if __name__ == "__main__":
    sys.exit(main())
