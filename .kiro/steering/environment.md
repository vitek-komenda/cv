# Environment & Shell Guidelines

## Terminal

The primary terminal in this workspace is **git-bash** (not cmd or PowerShell). All shell commands should use bash syntax.

## Creating Binary Files (PNG, etc.)

When a task requires creating a binary file such as a PNG image:

1. Generate the file content as a base64-encoded string.
2. Use a bash one-liner to decode it into the target path:

```bash
echo '<base64-data>' | base64 -d > path/to/file.png
```

Do **not** use PowerShell, `certutil`, or other Windows-specific utilities for this. Stick to portable bash tooling available in git-bash (`base64`, `printf`, `xxd`, etc.).

## Example — Minimal Placeholder PNG

```bash
# 1x1 transparent PNG (67 bytes)
echo 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAABJRU5ErkJggg==' | base64 -d > assets/photo-placeholder.png
```

Use this approach for any placeholder or generated image assets during implementation.
