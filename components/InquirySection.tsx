import { Mail, MessageCircle, PhoneCall } from 'lucide-react';
import { InquiryForm } from './InquiryForm';

type InquiryFormConfig = {
  fields?: Partial<Record<'name' | 'company' | 'phone' | 'email' | 'productInterest' | 'message', boolean>>;
  labels?: Partial<Record<'name' | 'company' | 'phone' | 'email' | 'productInterest' | 'message' | 'submit', string>>;
  heading?: string;
  description?: string;
};

type QuickLink = {
  label: string;
  value?: string;
  type?: 'phone' | 'email' | 'whatsapp' | 'custom';
  href?: string;
};

type InquirySectionProps = {
  id?: string;
  kicker?: string;
  heading: string;
  description: string;
  formTitle?: string;
  config?: InquiryFormConfig;
  initialProductInterest?: string;
  quickLinks?: QuickLink[];
  fallbackPhone?: string;
  fallbackEmail?: string;
  fallbackWhatsapp?: string;
};

function normalizeWhatsappNumber(value?: string) {
  return String(value || '').replace(/[^0-9]/g, '');
}

function buildQuickLinks(quickLinks: QuickLink[] | undefined, fallbackPhone?: string, fallbackEmail?: string, fallbackWhatsapp?: string) {
  if (quickLinks?.length) {
    return quickLinks.map((item) => {
      const href =
        item.href ||
        (item.type === 'phone'
          ? `tel:${item.value}`
          : item.type === 'email'
            ? `mailto:${item.value}`
            : item.type === 'whatsapp'
              ? `https://wa.me/${normalizeWhatsappNumber(item.value)}`
              : item.value || '#contact');

      const icon = item.type === 'email' ? Mail : item.type === 'whatsapp' ? MessageCircle : PhoneCall;
      return { label: item.label, href, icon, external: item.type === 'whatsapp' || String(item.href || '').startsWith('http') };
    });
  }

  return [
    fallbackPhone
      ? { label: 'Call Sales', href: `tel:${fallbackPhone}`, icon: PhoneCall, external: false }
      : null,
    fallbackWhatsapp
      ? { label: 'WhatsApp Support', href: `https://wa.me/${normalizeWhatsappNumber(fallbackWhatsapp)}`, icon: MessageCircle, external: true }
      : null,
    fallbackEmail
      ? { label: 'Email DNR', href: `mailto:${fallbackEmail}`, icon: Mail, external: false }
      : null,
  ].filter(Boolean) as { label: string; href: string; icon: typeof PhoneCall; external: boolean }[];
}

export function InquirySection({
  id,
  kicker = 'Inquiry',
  heading,
  description,
  formTitle = 'Share your requirement',
  config,
  initialProductInterest,
  quickLinks,
  fallbackPhone,
  fallbackEmail,
  fallbackWhatsapp,
}: InquirySectionProps) {
  const contacts = buildQuickLinks(quickLinks, fallbackPhone, fallbackEmail, fallbackWhatsapp);

  return (
    <section id={id} className="scroll-mt-28 rounded-[32px] border border-slate-200 bg-white px-5 py-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] md:px-8 md:py-8">
      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,0.82fr)_minmax(460px,0.98fr)] md:gap-8">
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="pill inline-flex">{kicker}</p>
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold text-secondary md:text-[2.05rem]">{heading}</h2>
              <p className="max-w-lg text-[1.02rem] leading-relaxed text-secondary/78">{description}</p>
            </div>
          </div>

          <div className="max-w-xl rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,rgba(248,250,252,0.94))] p-4 shadow-sm md:p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary/70">Quick contact</p>
            <div className="mt-4 grid gap-2.5">
              {contacts.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={`${item.label}-${item.href}`}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className="group flex min-h-12 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-secondary transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,rgba(248,250,252,0.96))] p-4 shadow-sm md:max-w-[620px] md:justify-self-end md:p-5">
          <div className="mb-4 space-y-1.5">
            <h3 className="text-[1.1rem] font-semibold text-secondary">{formTitle}</h3>
            <p className="text-sm leading-relaxed text-secondary/70">We usually respond within one business day with the right product or support recommendation.</p>
          </div>
          <InquiryForm config={config} initialValues={{ productInterest: initialProductInterest || '' }} />
        </div>
      </div>
    </section>
  );
}
