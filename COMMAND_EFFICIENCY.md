# CLI & TERMINAL EFFICIENCY GUIDE

## 💨 Fast Command Execution
- Always use the `-y` flag for `npx`, `npm install`, or other CLI prompts to avoid blocking.
- Combine commands with `&&` to reduce round-trips (e.g., `npm run build && npm run test`).
- Use `grep` or `ripgrep` (rg) to find content inside files instead of opening them.

## 📦 Dependency Best Practices
- Search `package.json` before installing new libs; they might already exist.
- Use `npm list <package>` to check versions without reading the whole lockfile.

## 🐍 Python Efficiency
- Use `pip install -r requirements.txt` only when necessary.
- Prefer lightweight scripts that do ONE thing (e.g., `extract_pdf.py`) over monolithic apps.

## 🧹 Cleanup Protocol
- Proactively terminate background commands once they finish.
- Delete temporary files or logs created during testing.

*verified by cli_protocol*
