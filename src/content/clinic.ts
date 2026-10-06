// Contact details come from the client's planning notes.
// Confirm each one with the clinic before launch, then set `confirmed`.
export const clinic = {
  name: "Family Dental Clinic",
  tagline: "Smiles for every generation",
  city: "Peshawar",
  address: "1st Floor, Al-Sayed Tower, Nasir Bagh Road, near Amal Labs, Peshawar",
  phoneDisplay: "+92 333 9202134",
  whatsapp: "923339202134",
  // True once the clinic has confirmed the address and phone number above.
  confirmed: false,
  // Not known yet. The contact page shows opening hours once this has entries.
  hours: [] as { days: string; time: string }[],
  // The address the site will live at, like "https://example.com", with no slash at the end. Not known
  // yet. While it is empty, robots.txt asks search engines to stay away.
  url: "",
};

// Sitemap, share links and the like need a full address. Until the real one is known they get this one,
// which works nowhere but on this machine.
export const siteUrl = clinic.url || "http://localhost:3000";

export function whatsappLink(message: string) {
  return `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const bookingLink = whatsappLink(`Hello ${clinic.name}, I would like to book an appointment.`);
export const phoneLink = `tel:${clinic.phoneDisplay.replace(/\s/g, "")}`;

// Opens Google Maps on a search for the address above, so it is only as right as that address.
export const directionsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${clinic.name}, ${clinic.address}`,
)}`;
