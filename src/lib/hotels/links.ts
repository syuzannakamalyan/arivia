// Hotel search links on partner sites. Booking happens there; partner deep links
// with Arivia's affiliate id can replace these once Arivia joins the programmes.

export type HotelSearch = { destination: string; checkIn: string; checkOut: string; guests: number };

export function bookingComUrl({ destination, checkIn, checkOut, guests }: HotelSearch) {
  const params = new URLSearchParams({
    ss: destination,
    checkin: checkIn,
    checkout: checkOut,
    group_adults: String(guests),
    no_rooms: "1",
  });
  return `https://www.booking.com/searchresults.html?${params}`;
}

export function googleHotelsUrl({ destination, checkIn, checkOut, guests }: HotelSearch) {
  const q = `hotels in ${destination} from ${checkIn} to ${checkOut} for ${guests} guests`;
  return `https://www.google.com/travel/search?q=${encodeURIComponent(q)}`;
}

// One hotel on the booking sites: its name plus the city finds the exact property.
export function hotelLinks(name: string, search: HotelSearch) {
  const named = { ...search, destination: `${name}, ${search.destination}` };
  return [
    { name: "Booking.com", url: bookingComUrl(named) },
    { name: "Google Hotels", url: googleHotelsUrl({ ...search, destination: `${name} ${search.destination}` }) },
  ];
}
