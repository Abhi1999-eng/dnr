import { ChevronRight, Mail, MessageCircle, PhoneCall } from 'lucide-react';
import { InquiryForm } from './InquiryForm';

type InquiryFormConfig = {
  fields?: Partial<Record<'name' | 'company' | 'phone' | 'email' | 'productInterest' | 'message', boolean>>;
  labels?: Partial<Record<'name' | 'company' | 'phone' | 'email' | 'productInterest' | 'message' | 'submit', string>>;
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
  formContext?: Partial<{ pageType: string; productTitle: string; productUrl: string }>;
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
      return {
        label: item.label,
        href,
        icon,
        external: item.type === 'whatsapp' || String(item.href || '').startsWith('http'),
      };
    });
  }

  return [
    fallbackPhone ? { label: 'Call Sales', href: `tel:${fallbackPhone}`, icon: PhoneCall, external: false } : null,
    fallbackWhatsapp ? { label: 'WhatsApp Support', href: `https://wa.me/${normalizeWhatsappNumber(fallbackWhatsapp)}`, icon: MessageCircle, external: true } : null,
    fallbackEmail ? { label: 'Email DNR', href: `mailto:${fallbackEmail}`, icon: Mail, external: false } : null,
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
  formContext,
}: InquirySectionProps) {
  const contacts = buildQuickLinks(quickLinks, fallbackPhone, fallbackEmail, fallbackWhatsapp);

  return (
    <section id={id} className="mx-auto max-w-[1280px] scroll-mt-28 rounded-[34px] border border-slate-200 bg-white px-5 py-6 shadow-[0_12px_36px_rgba(15,23,42,0.06)] md:px-10 md:py-10">
      <div className="grid items-start gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:gap-10">
        <div className="space-y-6">
          <div className="space-y-4">
            <span className="pill inline-flex">{kicker}</span>
            <div className="space-y-3">
              <h2 className="text-3xl font-semibold text-secondary md:text-[2.2rem]">{heading}</h2>
              <p className="max-w-lg text-base leading-relaxed text-secondary/78">{description}</p>
            </div>
          </div>

          <div className="max-w-[460px] rounded-[28px] border border-slate-200 bg-slate-50/70 p-4 md:p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary/65">Quick contact</p>
            <div className="mt-4 space-y-2.5">
              {contacts.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={`${item.label}-${item.href}`}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className="group flex min-h-[60px] items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-secondary transition hover:border-primary/35 hover:bg-primary/5"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                        <Icon size={18} aria-hidden="true" />
                      </span>
                      <span className="text-sm font-semibold">{item.label}</span>
                    </span>
                    <ChevronRight size={16} className="text-secondary/35 transition group-hover:text-primary" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm md:p-8 lg:max-w-[620px] lg:justify-self-end">
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-secondary">{formTitle}</h3>
            <p className="text-sm leading-relaxed text-secondary/70">We usually respond within one business day with the right product or support recommendation.</p>
          </div>

          <InquiryForm config={config} initialValues={{ productInterest: initialProductInterest || '' }} context={formContext} />
        </div>
      </div>
    </section>
  );
}
