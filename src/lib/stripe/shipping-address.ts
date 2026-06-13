export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  zip: string;
  city: string;
  phone: string;
}

export function encodeShippingAddress(addr: ShippingAddress): Record<string, string> {
  const compact = JSON.stringify({
    fn: addr.firstName.trim(),
    ln: addr.lastName.trim(),
    a: addr.address.trim(),
    z: addr.zip.trim(),
    c: addr.city.trim(),
    p: addr.phone.trim(),
  });
  if (compact.length > 500) {
    throw new Error("Adresse trop longue pour la session de paiement");
  }
  return { ship_addr: compact };
}

export function decodeShippingAddress(metadata: Record<string, string> | null | undefined): ShippingAddress | null {
  const raw = metadata?.ship_addr;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as {
      fn?: string;
      ln?: string;
      a?: string;
      z?: string;
      c?: string;
      p?: string;
    };
    if (!parsed.fn || !parsed.ln || !parsed.a || !parsed.z || !parsed.c || !parsed.p) return null;
    return {
      firstName: parsed.fn,
      lastName: parsed.ln,
      address: parsed.a,
      zip: parsed.z,
      city: parsed.c,
      phone: parsed.p,
    };
  } catch {
    return null;
  }
}

export function shippingAddressToJson(addr: ShippingAddress): Record<string, string> {
  return {
    firstName: addr.firstName,
    lastName: addr.lastName,
    address: addr.address,
    zip: addr.zip,
    city: addr.city,
    phone: addr.phone,
  };
}
