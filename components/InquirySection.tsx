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
  theme?: 'light' | 'dark';
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
  theme = 'light',
}: InquirySectionProps) {
  const contacts = buildQuickLinks(quickLinks, fallbackPhone, fallbackEmail, fallbackWhatsapp);
  const isDark = theme === 'dark';

  return (
    <Reveal>
      <section id={id} className="container-wide scroll-mt-28 space-y-4 md:space-y-5">
        <SectionTitle eyebrow={kicker} title={heading} kicker={description} theme={theme} />

        <div className="grid items-start gap-4 lg:grid-cols-[0.42fr_0.58fr] lg:gap-6">
          <div className="space-y-5">
            <div className={`max-w-[460px] rounded-[22px] border p-3 md:p-3.5 ${isDark ? 'border-[rgba(126,211,33,0.14)] bg-[linear-gradient(180deg,rgba(23,33,43,0.96),rgba(10,16,20,0.98))] shadow-[0_18px_40px_rgba(0,0,0,0.24)]' : 'border-slate-200 bg-slate-50/70'}`}>
              <p className={isDark ? 'text-sm font-semibold uppercase tracking-[0.16em] text-[#d5f4a8]' : 'text-sm font-semibold uppercase tracking-[0.16em] text-secondary/65'}>Quick contact</p>
              <div className="mt-2.5 space-y-2">
                {contacts.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={`${item.label}-${item.href}`}
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      className={`group flex min-h-[48px] items-center justify-between rounded-2xl border px-3.5 py-2.5 transition ${isDark ? 'border-white/10 bg-white/[0.03] text-white hover:border-[#7ed321]/35 hover:bg-[#7ed321]/8' : 'border-slate-200 bg-white text-secondary hover:border-primary/35 hover:bg-primary/5'}`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-full ${isDark ? 'bg-[#7ed321]/14 text-[#7ed321]' : 'bg-primary/12 text-primary'}`}>
                          <Icon size={18} aria-hidden="true" />
                        </span>
                        <span className="text-sm font-semibold">{item.label}</span>
                      </span>
                      <ChevronRight size={16} className={isDark ? 'text-white/35 transition group-hover:text-[#7ed321]' : 'text-secondary/35 transition group-hover:text-primary'} aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={`w-full rounded-[24px] border p-4 md:p-5 lg:max-w-[560px] lg:justify-self-end ${isDark ? 'border-[rgba(126,211,33,0.14)] bg-[linear-gradient(180deg,rgba(23,33,43,0.96),rgba(10,16,20,0.98))] shadow-[0_20px_48px_rgba(0,0,0,0.28)]' : 'border-slate-200 bg-white shadow-sm'}`}>
            <div className="space-y-2">
              <h3 className={isDark ? 'text-[1.25rem] font-semibold text-white' : 'text-[1.25rem] font-semibold text-secondary'}>{formTitle}</h3>
              <p className={isDark ? 'text-sm leading-relaxed text-[#aab4bd]' : 'text-sm leading-relaxed text-secondary/70'}>We usually respond within one business day with the right product or support recommendation.</p>
            </div>

            <InquiryForm theme={theme} config={config} initialValues={{ productInterest: initialProductInterest || '' }} context={formContext} />
          </div>
        </div>
      </section>
    </Reveal>
  );
}
