/**
 * Cloudflare Pages Function: POST /api/bugreports
 * Stores bug reports in D1. Screenshot and log content are stripped to stay under D1 limits.
 */
interface Env {
  DB: D1Database;
}

interface BugReport {
  id: string;
  createdAt: string;
  title: string;
  description: string;
  reproSteps?: string;
  category: string;
  severity: string;
  reproRate: string;
  buildVersion?: string;
  gameVersion?: string;
  currentScene?: string;
  platform?: string;
  playerContact?: string;
  [key: string]: unknown;
}

function stripLargeFields(report: BugReport): Omit<BugReport, 'screenshotDataBase64' | 'logContent'> & { hasScreenshot?: boolean; hasLogs?: boolean } {
  const { screenshotDataBase64, logContent, ...rest } = report;
  return {
    ...rest,
    hasScreenshot: !!screenshotDataBase64,
    hasLogs: !!logContent,
  };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const report = (await context.request.json()) as BugReport;
    if (!report?.id || !report?.title || !report?.description) {
      return new Response(JSON.stringify({ error: 'Missing required fields: id, title, description' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stored = stripLargeFields(report);
    const reportJson = JSON.stringify(stored);

    await context.env.DB.prepare(
      `INSERT INTO bug_reports (id, created_at, title, description, category, severity, repro_rate, build_version, current_scene, platform, player_contact, report_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        report.id,
        report.createdAt ?? new Date().toISOString(),
        report.title,
        report.description,
        report.category ?? 'Other',
        report.severity ?? 'Medium',
        report.reproRate ?? 'Sometimes',
        report.buildVersion ?? '',
        report.currentScene ?? '',
        report.platform ?? '',
        report.playerContact ?? null,
        reportJson
      )
      .run();

    return new Response(JSON.stringify({ ok: true, id: report.id }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('[bugreports]', err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'Failed to store report',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
