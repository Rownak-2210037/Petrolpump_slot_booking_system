export interface Booking {
  id: string;
  user: { name: string };
  station: { name: string };
  slotTime: string;
  status: string;
}
