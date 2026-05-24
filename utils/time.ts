export function isWithinWindow(slotTimeIso: string, windowMinutes = 10) {
  const slot = new Date(slotTimeIso);
  const now = new Date();
  const expiry = new Date(slot.getTime() + windowMinutes * 60 * 1000);
  return now >= slot && now <= expiry;
}
