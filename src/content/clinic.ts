// Contact details come from the client's planning notes.
// Confirm each one with the clinic before launch.
export const clinic = {
  name: "Family Dental Clinic",
  tagline: "Smiles for every generation",
  city: "Peshawar",
  address: "1st Floor, Al-Sayed Tower, Nasir Bagh Road, near Amal Labs, Peshawar",
  phoneDisplay: "+92 333 9202134",
  whatsapp: "923339202134",
  // Not known yet. The contact page shows opening hours once this has entries.
  hours: [] as { days: string; time: string }[],
};

export function whatsappLink(message: string) {
  return `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const bookingLink = whatsappLink(`Hello ${clinic.name}, I would like to book an appointment.`);
export const phoneLink = `tel:${clinic.phoneDisplay.replace(/\s/g, "")}`;

// Opens Google Maps on a search for the address above, so it is only as right as that address.
export const directionsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${clinic.name}, ${clinic.address}`,
)}`;
