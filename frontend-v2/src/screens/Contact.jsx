import { Bidi, Screen, Section } from "../ui";
import { Icon } from "../icons";
import { useI18n } from "../i18n";
import { BUSINESS, whatsappUrl } from "../business";

// Who runs the service and how to reach a person — people won't upload an
// ID card to a site that doesn't say who's behind it.
export function ContactCard() {
  const { t } = useI18n();

  return (
    <Section icon="users" title={t("contact.title")}>
      <p className="contact-about"><Bidi text={t("contact.about")} /></p>
      {BUSINESS.osekNumber && <small><Bidi text={t("contact.number", { value: BUSINESS.osekNumber })} /></small>}
      <div className="contact-actions">
        <a className="btn primary small with-icon" href={whatsappUrl(t("contact.waText"))} target="_blank" rel="noreferrer">
          <Icon name="chat" size={18} />{t("contact.whatsapp")}
        </a>
        <a className="btn secondary small with-icon" href={`tel:+${BUSINESS.phoneIntl}`}>
          <Icon name="phone" size={18} /><bdi>{BUSINESS.phone}</bdi>
        </a>
        <a className="btn secondary small with-icon" href={`mailto:${BUSINESS.email}`}>
          <Icon name="mail" size={18} /><bdi>{BUSINESS.email}</bdi>
        </a>
      </div>
    </Section>
  );
}

// One line under a request: questions go to WhatsApp.
export function ContactLine() {
  const { t } = useI18n();
  return (
    <a className="form-link contact-line" href={whatsappUrl(t("contact.waText"))} target="_blank" rel="noreferrer">
      <Icon name="chat" size={16} />{t("contact.question")}
    </a>
  );
}

export default function Contact() {
  const { t } = useI18n();
  return (
    <Screen back="/" title={t("contact.link")}>
      <ContactCard />
    </Screen>
  );
}
