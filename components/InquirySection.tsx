import { ChevronRight, Mail, MessageCircle, PhoneCall } from 'lucide-react';
import { InquiryForm } from './InquiryForm';
import { Reveal } from './Reveal';
import { SectionTitle } from './SectionTitle';

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
    <Reveal>
      <section id={id} className="container-wide scroll-mt-28 space-y-5 md:space-y-6">
        <SectionTitle eyebrow={kicker} title={heading} kicker={description} />

        <div className="grid items-start gap-6 lg:grid-cols-[0.42fr_0.58fr] lg:gap-8">
          <div className="space-y-5">
          <div className="max-w-[460px] rounded-[24px] border border-slate-200 bg-slate-50/70 p-3.5 md:p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary/65">Quick contact</p>
            <div className="mt-3 space-y-2">
              {contacts.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={`${item.label}-${item.href}`}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className="group flex min-h-[52px] items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-secondary transition hover:border-primary/35 hover:bg-primary/5"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/12 text-primary">
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

        <div className="w-full rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm md:p-6 lg:max-w-[600px] lg:justify-self-end">
          <div className="space-y-2">
            <h3 className="text-[1.45rem] font-semibold text-secondary">{formTitle}</h3>
            <p className="text-sm leading-relaxed text-secondary/70">We usually respond within one business day with the right product or support recommendation.</p>
          </div>

          <InquiryForm config={config} initialValues={{ productInterest: initialProductInterest || '' }} context={formContext} />
        </div>
        </div>
      </section>
    </Reveal>
  );
}
