import nodemailer from 'nodemailer';

type InquiryEmailPayload = {
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  productInterest?: string;
  message?: string;
  pageUrl?: string;
  pageType?: string;
  productTitle?: string;
  productUrl?: string;
  submittedAt: string;
};

type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  to: string;
};

function env(name: string) {
  return String(process.env[name] || '').trim();
}

/**
 * Reads SMTP settings from the environment.
 *
 * These were previously hardcoded here, which put a live mailbox password in the
 * source tree. Credentials now come from the environment only, and a missing one
 * raises a named error instead of failing later inside the SMTP handshake.
 */
function getMailConfig(): MailConfig {
  const user = env('SMTP_USER');
  const pass = env('SMTP_PASS');
  const to = env('MAIL_TO');

  const missing = [
    !user && 'SMTP_USER',
    !pass && 'SMTP_PASS',
    !to && 'MAIL_TO',
  ].filter(Boolean);

  if (missing.length) {
    throw new Error(`Inquiry email is not configured: missing ${missing.join(', ')}.`);
  }

  const port = Number(env('SMTP_PORT') || 465);

  return {
    host: env('SMTP_HOST') || 'smtp.gmail.com',
    port: Number.isFinite(port) ? port : 465,
    // Implicit TLS on 465; STARTTLS on 587 and anything else.
    secure: env('SMTP_SECURE') ? env('SMTP_SECURE').toLowerCase() === 'true' : port === 465,
    user,
    pass,
    from: env('MAIL_FROM') || user,
    to,
  };
}

let cachedTransporter: nodemailer.Transporter | null = null;
let cachedKey = '';

/**
 * Built on first use rather than at import time, so a build or a request that
 * never sends mail does not need SMTP credentials present.
 */
function getTransporter(config: MailConfig) {
  const key = `${config.host}:${config.port}:${config.secure}:${config.user}`;
  if (cachedTransporter && cachedKey === key) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });
  cachedKey = key;
  return cachedTransporter;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Splits a comma or semicolon separated recipient list into individual addresses. */
export function recipientList(value: string) {
  return String(value || '')
    .split(/[,;]/)
    .map((address) => address.trim())
    .filter(Boolean);
}

export async function sendInquiryEmail(payload: InquiryEmailPayload) {
  const mailConfig = getMailConfig();
  const transporter = getTransporter(mailConfig);
  const subject = payload.productTitle
    ? `New DNR Product Inquiry - ${payload.productTitle}`
    : 'New DNR Website Inquiry';

  const rows = [
    ['Name', payload.name],
    ['Company', payload.company || '—'],
    ['Phone', payload.phone || '—'],
    ['Email', payload.email || '—'],
    ['Product Interest', payload.productInterest || '—'],
    ['Page URL', payload.pageUrl || '—'],
    ['Page Type', payload.pageType || '—'],
    ['Product Title', payload.productTitle || '—'],
    ['Product URL', payload.productUrl || '—'],
    ['Submitted At', payload.submittedAt],
  ];

  const text = [
    subject,
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Message:',
    payload.message?.trim() || '—',
  ].join('\n');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#0f172a">
      <h2 style="margin:0 0 16px;font-size:24px;">${escapeHtml(subject)}</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <td style="padding:10px 12px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:600;width:180px;">${escapeHtml(label)}</td>
                <td style="padding:10px 12px;border:1px solid #e2e8f0;">${escapeHtml(String(value || '—'))}</td>
              </tr>`
          )
          .join('')}
      </table>
      <div style="padding:16px;border:1px solid #e2e8f0;border-radius:16px;background:#ffffff;">
        <p style="margin:0 0 8px;font-weight:600;">Message</p>
        <p style="margin:0;white-space:pre-wrap;line-height:1.6;">${escapeHtml(payload.message?.trim() || '—')}</p>
      </div>
    </div>`;

  console.log('[inquiry] preparing email', {
    subject,
    from: mailConfig.from,
    to: mailConfig.to,
    replyTo: payload.email || null,
  });

  await transporter.verify();

  const info = await transporter.sendMail({
    from: mailConfig.from,
    to: mailConfig.to,
    envelope: {
      from: mailConfig.from,
      // MAIL_TO may list several addresses; the envelope needs them as separate
      // recipients, not one comma-joined string.
      to: recipientList(mailConfig.to),
    },
    subject,
    replyTo: payload.email || undefined,
    text,
    html,
  });

  console.log('[inquiry] email sent', {
    messageId: info.messageId,
    accepted: info.accepted,
    rejected: info.rejected,
    response: info.response,
  });
}
