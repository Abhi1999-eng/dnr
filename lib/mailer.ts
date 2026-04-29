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

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} configuration`);
  return value;
}

function getTransporter() {
  const host = requiredEnv('SMTP_HOST');
  const port = Number(process.env.SMTP_PORT || '465');
  const secure = String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';
  const user = requiredEnv('SMTP_USER');
  const pass = requiredEnv('SMTP_PASS');

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendInquiryEmail(payload: InquiryEmailPayload) {
  const transporter = getTransporter();
  const from = requiredEnv('MAIL_FROM');
  const to = requiredEnv('MAIL_TO');
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

  await transporter.sendMail({
    from,
    to,
    subject,
    replyTo: payload.email || undefined,
    text,
    html,
  });
}
