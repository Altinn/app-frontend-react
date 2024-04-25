export enum PaymentStatus {
  Created = 'Created',
  Paid = 'Paid',
  Failed = 'Failed',
}

export interface PaymentResponsePayload {
  taskId: string;
  paymentProcessorId: string;
  orderDetails: OrderDetails;
  paymentDetails?: PaymentDetails;
  status: PaymentStatus;
}

export interface PaymentDetails {
  paymentId: string;
  redirectUrl: string;
  receiptUrl?: string;
  payer: Payer;
  cardDetails?: CardDetails;
}

interface CardDetails {
  maskedPan?: string;
  expiryDate?: string;
}

interface PhoneNumber {
  prefix: string | null;
  number: string | null;
}

interface Person {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: PhoneNumber;
}

interface ShippingAddress {
  name: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  country: string;
}

interface BillingAddress extends ShippingAddress {}

interface Company {
  organisationNumber?: string;
  name?: string;
}

interface Payer {
  privatePerson?: Person;
  company?: Company;
  shippingAddress?: ShippingAddress;
  billingAddress?: BillingAddress;
}

export interface OrderDetails {
  orderReference?: string;
  currency: string;
  orderLines: OrderLine[];
  totalPriceExVat: number;
  totalVat: number;
  totalPriceIncVat: number;
  receiver?: {
    name?: string;
    organisationNumber?: string;
  };
}

export interface OrderLine {
  id: string;
  name: string;
  textResourceKey: string;
  priceExVat: number;
  quantity: number;
  vatPercent: number;
  unit: string;
}
