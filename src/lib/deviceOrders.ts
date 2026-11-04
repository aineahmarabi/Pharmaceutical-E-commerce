/** Orders this browser placed, kept on the device so a guest can follow them without an account or order number. */
const KEY = 'pc-device-orders';
const MAX = 20;
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 90;

export interface DeviceOrderRef {
  orderId: string;
  phone: string;
  at: number;
}

export function readDeviceOrders(): DeviceOrderRef[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as DeviceOrderRef[]) : [];
    const cutoff = Date.now() - MAX_AGE_MS;
    return list.filter((r) => r && typeof r.orderId === 'string' && r.at > cutoff);
  } catch {
    return [];
  }
}

export function rememberDeviceOrder(orderId: string, phone: string) {
  try {
    const rest = readDeviceOrders().filter((r) => r.orderId !== orderId);
    localStorage.setItem(KEY, JSON.stringify([{ orderId, phone, at: Date.now() }, ...rest].slice(0, MAX)));
  } catch {
    // Private browsing: the order still exists, it just will not be listed on this device.
  }
}
