// Who runs MoveMate, shown in the contact block, the legal pages and the
// power of attorney. Fill in osekNumber once it's at hand — everything that
// shows it picks it up from here (and hides it while it's empty).

export const BUSINESS = {
  name: "MoveMate",
  // Registered as an exempt dealer (עוסק פטור).
  osekNumber: "",
  phone: "050-642-5151",
  // E.164 digits for tel: and wa.me links.
  phoneIntl: "972506425151",
  email: "2donutchannel@gmail.com"
};

export const whatsappUrl = text =>
  `https://wa.me/${BUSINESS.phoneIntl}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
