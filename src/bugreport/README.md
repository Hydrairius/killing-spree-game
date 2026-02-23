# Bug Report System

In-game bug reporting flow for players and QA testers. Captures high-quality reports with automatic context, optional screenshots and logs, and pluggable storage/sending.

## Setup

### Dependencies

Already included: `html2canvas`, `jszip`. No extra setup needed.

### Environment Variables

Create or update `.env`:

```env
# Optional: Webhook URL for remote delivery (Discord, Jira bridge, etc.)
# If unset, reports are stored locally only (IndexedDB)
VITE_BUGREPORT_WEBHOOK_URL=

# Optional: Commit hash for builds (e.g. from CI)
VITE_COMMIT_HASH=
```

**Never hardcode secrets.** Use environment variables or a config file excluded from version control.

### Integration

The system is already wired into:

- **Lobby** — Settings gear (top right) → Report Bug
- **Game Board** — Settings gear (top right) → Report Bug
- **Global hotkey** — `F8` opens the Report Bug modal from anywhere

## How It Works

1. **Report Bug** — User fills in title, description, category, severity, repro info.
2. **Context capture** — Platform, device, OS, locale, FPS, memory, game state snapshot.
3. **Optional attachments** — Screenshot (html2canvas) and last ~1000 log lines.
4. **Storage** — Saved to IndexedDB (`KillingSpreeBugReports`).
5. **Optional send** — If `VITE_BUGREPORT_WEBHOOK_URL` is set, also POSTs to that endpoint.

## Folder Structure

```
src/bugreport/
├── BugReportModal.tsx    # Main form UI
├── BugReportsViewer.tsx  # Dev: list, filter, export
├── Toast.tsx             # Success/error toast
├── contextCapture.ts     # Platform, FPS, memory, game state
├── logBuffer.ts          # Ring buffer for log capture
├── providers.ts          # Local + webhook providers
├── screenshot.ts         # html2canvas capture
├── storage.ts            # IndexedDB + download
├── submit.ts             # Validation, rate limit, send
├── types.ts              # BugReport schema
├── utils.ts              # ID, filename, validation
└── README.md
```

## Bug Reports Viewer (Dev Only)

In development (`npm run dev`), the Settings menu includes **Bug Reports**. From there you can:

- List all reports (most recent first)
- Filter by category/severity
- View report details, JSON, screenshot, log
- **Copy Report ID**
- **Download** JSON, screenshot, log individually
- **Export selected as ZIP**

## Cloudflare D1 (Recommended)

Store reports in Cloudflare D1. See **[docs/CLOUDFLARE_BUGREPORTS_SETUP.md](../../docs/CLOUDFLARE_BUGREPORTS_SETUP.md)** for step-by-step setup.

1. Create D1 database
2. Run migration
3. Set `VITE_BUGREPORT_WEBHOOK_URL` to `https://your-pages-url.pages.dev/api/bugreports`
4. Deploy

## Webhook Provider (Generic)

For Discord, Jira, or any custom backend:

1. Set `VITE_BUGREPORT_WEBHOOK_URL` to your endpoint.
2. The provider POSTs the full `BugReport` JSON.
3. Your server can forward to Discord, create a Jira ticket, etc.

## Rate Limiting

- 1 report per 10 seconds per session to prevent spam.

## Offline

- Reports are always saved to IndexedDB.
- Webhook POST may fail offline; report is still stored locally.
- Use Bug Reports Viewer to export when back online.
