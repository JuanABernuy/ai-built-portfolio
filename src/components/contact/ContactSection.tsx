import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, Download, CheckCircle, Clock, MapPin, Copy, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { MagneticButton } from '../common/MagneticButton';

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.88a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66c0-.92-.74-1.66-1.66-1.66Z"/>
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

type FormState = { name: string; email: string; subject: string; message: string; website: string };
type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

const clean = (v: string) => v.replace(/^TODO:\s*/i, '').trim();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ContactSection: React.FC = () => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>({ name: '', email: '', subject: '', message: '', website: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [madridTime, setMadridTime] = useState('');

  const L =
    lang === 'es'
      ? {
          direct: 'Contacto directo',
          copy: 'Copiar email',
          copied: 'Email copiado al portapapeles',
          copyFail: 'No se pudo copiar el email',
          reqName: 'Introduce tu nombre.',
          reqEmail: 'Introduce un email válido.',
          reqMsg: 'El mensaje debe tener al menos 10 caracteres.',
          time: 'Hora en Madrid',
          sentToast: 'Mensaje preparado. Se abrirá tu cliente de correo.',
          optional: 'opcional',
        }
      : {
          direct: 'Direct contact',
          copy: 'Copy email',
          copied: 'Email copied to clipboard',
          copyFail: 'Could not copy the email',
          reqName: 'Please enter your name.',
          reqEmail: 'Please enter a valid email address.',
          reqMsg: 'Your message should be at least 10 characters.',
          time: 'Madrid time',
          sentToast: 'Message ready. Your email client will open.',
          optional: 'optional',
        };

  useEffect(() => {
    const update = () =>
      setMadridTime(
        new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' })
      );
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  const errors: Errors = {};
  if (!form.name.trim()) errors.name = L.reqName;
  if (!EMAIL_RE.test(form.email.trim())) errors.email = L.reqEmail;
  if (form.message.trim().length < 10) errors.message = L.reqMsg;

  const emailValue = clean(t.contact.emailValue);
  const linkedinValue = clean(t.contact.linkedinValue);
  const githubValue = clean(t.contact.githubValue);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailValue);
      showToast(L.copied, 'success');
    } catch {
      showToast(L.copyFail, 'error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    // Honeypot: bots fill hidden fields
    if (form.website) return;
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(errors).length > 0) return;

    setStatus('sending');
    window.setTimeout(() => {
      const mailtoUrl = `mailto:${emailValue}?subject=${encodeURIComponent(
        `[Portfolio] ${form.subject || 'Opportunity inquiry'} - ${form.name}`
      )}&body=${encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`)}`;
      window.location.href = mailtoUrl;
      setStatus('sent');
      showToast(L.sentToast, 'success');
      window.setTimeout(() => {
        setStatus('idle');
        setForm({ name: '', email: '', subject: '', message: '', website: '' });
        setTouched({});
      }, 4000);
    }, 600);
  };

  const field = (name: 'name' | 'email' | 'message') => touched[name] && errors[name];
  const inputClass = (name: 'name' | 'email' | 'message' | 'subject') =>
    `w-full px-3.5 py-2.5 rounded-lg bg-white border text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20 ${
      name !== 'subject' && field(name as 'name' | 'email' | 'message') ? 'border-red-400' : 'border-slate-300'
    }`;

  const detailRow = 'flex items-center gap-3 text-sm text-slate-200';

  return (
    <section id="contact" className="py-14 sm:py-16 bg-[#0B2A4A] text-white">
      <div className="site-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-left space-y-2 mb-8"
        >
          <div className="text-xs font-semibold text-blue-200 tracking-wider uppercase">{t.contact.subtitle}</div>
          <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-tight leading-tight">
            {t.contact.title}
          </h2>
          <p className="text-base text-slate-300 max-w-[60ch] leading-relaxed">{t.contact.intro}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-5 space-y-6"
          >
            <h3 className="text-xs font-semibold text-blue-200 uppercase tracking-wider">{L.direct}</h3>

            <div className="space-y-4">
              <div className={detailRow}>
                <Mail className="w-4 h-4 text-blue-200 shrink-0" />
                <a href={`mailto:${emailValue}`} className="break-all hover:text-white underline-offset-4 hover:underline">
                  {emailValue}
                </a>
                <button
                  type="button"
                  onClick={copyEmail}
                  aria-label={L.copy}
                  title={L.copy}
                  className="ml-auto shrink-0 w-8 h-8 rounded-lg border border-white/20 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className={detailRow}>
                <LinkedinIcon className="w-4 h-4 text-blue-200 shrink-0" />
                <a href={linkedinValue} target="_blank" rel="noopener noreferrer" className="break-all hover:text-white underline-offset-4 hover:underline">
                  {t.contact.linkedinLabel}
                </a>
              </div>

              <div className={detailRow}>
                <GithubIcon className="w-4 h-4 text-blue-200 shrink-0" />
                <a href={githubValue} target="_blank" rel="noopener noreferrer" className="break-all hover:text-white underline-offset-4 hover:underline">
                  {t.contact.githubLabel}
                </a>
              </div>

              <div className={detailRow}>
                <MapPin className="w-4 h-4 text-blue-200 shrink-0" />
                <span>{t.contact.locationValue}</span>
              </div>

              <div className={detailRow}>
                <Clock className="w-4 h-4 text-blue-200 shrink-0" />
                <span>
                  {L.time}: <span className="font-mono text-[13px]">{madridTime}</span>
                </span>
              </div>
            </div>

            <a
              href="/cv.pdf"
              download="CV_Juan_Andres_Bernuy.pdf"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/30 hover:bg-white/10 text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{t.contact.form.downloadCv}</span>
            </a>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
            className="lg:col-span-7"
          >
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-white text-slate-900 rounded-xl p-6 sm:p-8 shadow-lg space-y-4"
            >
              {/* Honeypot (hidden from users and assistive tech) */}
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label>
                  Website
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={e => setForm({ ...form, website: e.target.value })}
                  />
                </label>
              </div>

              <div>
                <label htmlFor="cf-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.contact.form.nameLabel} *
                </label>
                <input
                  id="cf-name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  onBlur={() => setTouched(p => ({ ...p, name: true }))}
                  placeholder={t.contact.form.namePlaceholder}
                  aria-invalid={!!field('name')}
                  aria-describedby={field('name') ? 'cf-name-err' : undefined}
                  className={inputClass('name')}
                />
                {field('name') && (
                  <p id="cf-name-err" className="mt-1.5 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="cf-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.contact.form.emailLabel} *
                </label>
                <input
                  id="cf-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  onBlur={() => setTouched(p => ({ ...p, email: true }))}
                  placeholder={t.contact.form.emailPlaceholder}
                  aria-invalid={!!field('email')}
                  aria-describedby={field('email') ? 'cf-email-err' : undefined}
                  className={inputClass('email')}
                />
                {field('email') && (
                  <p id="cf-email-err" className="mt-1.5 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="cf-subject" className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.contact.form.subjectLabel} <span className="text-slate-400 font-normal">({L.optional})</span>
                </label>
                <input
                  id="cf-subject"
                  type="text"
                  value={form.subject}
                  onChange={e => setForm({ ...form, subject: e.target.value })}
                  placeholder={t.contact.form.subjectPlaceholder}
                  className={inputClass('subject')}
                />
              </div>

              <div>
                <label htmlFor="cf-message" className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t.contact.form.messageLabel} *
                </label>
                <textarea
                  id="cf-message"
                  rows={5}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  onBlur={() => setTouched(p => ({ ...p, message: true }))}
                  placeholder={t.contact.form.messagePlaceholder}
                  aria-invalid={!!field('message')}
                  aria-describedby={field('message') ? 'cf-message-err' : undefined}
                  className={`${inputClass('message')} resize-y`}
                />
                {field('message') && (
                  <p id="cf-message-err" className="mt-1.5 text-xs text-red-600">{errors.message}</p>
                )}
              </div>

              <MagneticButton
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-3 px-6 rounded-lg bg-[#0B2A4A] hover:bg-[#133D69] disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.contact.form.sending}</span>
                  </>
                ) : status === 'sent' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>{t.contact.form.successMsg}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t.contact.form.submitButton}</span>
                  </>
                )}
              </MagneticButton>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
