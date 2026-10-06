// Contact details come from the client's planning notes.
// Confirm each one with the clinic before launch.
export const clinic = {
  name: "Family Dental Clinic",
  tagline: "Smiles for every generation",
  city: "Peshawar",
  address: "1st Floor, Al-Sayed Tower, Nasir Bagh Road, near Amal Labs, Peshawar",
  phoneDisplay: "+92 333 9202134",
  whatsapp: "923339202134",
};

export function whatsappLink(message: string) {
  return `https://wa.me/${clinic.whatsapp}?text=${encodeURIComponent(message)}`;
}
