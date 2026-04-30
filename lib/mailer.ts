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

const SMTP_CONFIG = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  user: 'dnrenquiry@gmail.com',
  pass: 'aiso ytph bhoe mcwm',
  from: 'dnrenquiry@gmail.com',
  to: 'abhishekchaubey1999@gmail.com',
} as const;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: SMTP_CONFIG.host,
  port: SMTP_CONFIG.port,
  secure: SMTP_CONFIG.secure,
  auth: {
    user: SMTP_CONFIG.user,
    pass: SMTP_CONFIG.pass,
  },
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendInquiryEmail(payload: InquiryEmailPayload) {
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
    from: SMTP_CONFIG.from,
    to: SMTP_CONFIG.to,
    replyTo: payload.email || null,
  });

  await transporter.verify();

  const info = await transporter.sendMail({
    from: SMTP_CONFIG.from,
    to: SMTP_CONFIG.to,
    envelope: {
      from: SMTP_CONFIG.from,
      to: [SMTP_CONFIG.to],
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
