import { PaymentStatus } from 'src/layout/Payment/queries/types';
import type { PaymentResponsePayload } from 'src/layout/Payment/queries/types';

export const paymentResponsePayload: PaymentResponsePayload = {
  taskId: '00cd000065f03e6a75269b94dc7c38df',
  paymentProcessorId: '00cd000065f03e6a75269b94dc7c3123',
  orderDetails: {
    currency: 'NOK',
    orderLines: [
      {
        id: '0',
        name: 'A thing',
        textResourceKey: '',
        priceExVat: 50,
        quantity: 1,
        vatPercent: 25,
        unit: 'pcs',
      },
      {
        id: '1',
        name: 'Another thing',
        textResourceKey: '',
        priceExVat: 100,
        quantity: 1,
        vatPercent: 25,
        unit: 'pcs',
      },
    ],
    totalPriceExVat: 150,
    totalVat: 37.5,
    totalPriceIncVat: 187.5,
  },
  paymentDetails: {
    paymentId: '00cd000065f03e6a75269b94dc7c3321',
    redirectUrl:
      'https://test.checkout.dibspayment.eu/hostedpaymentpage/?checkoutKey=fc8ce23b003e4c20bc37000506fdb4a0&pid=00cd000065f03e6a75269b94dc7c38df',
    receiptUrl: 'https://test.checkout.dibspayment.eu/receipt/?paymentId=00cd000065f03e6a75269b94dc7c38df',
    status: PaymentStatus.Paid,
    payer: {
      privatePerson: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
        phoneNumber: {
          prefix: '+47',
          number: '12345678',
        },
      },
      company: {
        organisationNumber: '123456789',
        name: 'Example Corp',
      },
      shippingAddress: {
        name: 'John Doe',
        addressLine1: '123 Main St',
        addressLine2: 'Suite 101',
        postalCode: '12345',
        city: 'Oslo',
        country: 'Norway',
      },
      billingAddress: {
        name: 'Example Corp',
        addressLine1: '123 Main St',
        addressLine2: 'Suite 101',
        postalCode: '12345',
        city: 'Oslo',
        country: 'Norway',
      },
    },
  },
};
