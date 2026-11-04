export interface FaqItem {
  q: string;
  /** One or more paragraphs. */
  a: string[];
  /** Optional bullet or step list shown after the paragraphs. */
  list?: string[];
  /** Whether the list is numbered steps (true) or bullets (default). */
  steps?: boolean;
  /** Optional closing paragraph shown after the list. */
  after?: string;
  /** Optional link to a related page. */
  link?: { href: string; label: string };
}

export interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
}

export const faqGroups: FaqGroup[] = [
  {
    id: 'ordering',
    title: 'Ordering & account',
    items: [
      {
        q: 'Do I need an account to order?',
        a: [
          'No. You can check out as a guest with just your name, phone number and delivery details. Nothing about the way you order or what you pay changes if you do not have an account.',
          'An account is optional. It saves your addresses, keeps all your orders in one place so you can follow them, and lets you keep a wishlist of products you buy often.',
        ],
      },
      {
        q: 'How do I place an order?',
        a: ['Ordering takes a few minutes:'],
        steps: true,
        list: [
          'Find your product using search or the categories, and press Add. The cart opens so you can check it.',
          'If an item needs a prescription, you will see a note in the cart telling you what we need.',
          'Go to checkout and choose delivery or store pickup.',
          'Enter your name, phone number and address, then choose how you want to pay.',
          'Review the total, including any delivery fee, and place the order. You receive an order number straight away.',
        ],
        after: 'If your order includes a prescription-only medicine, a pharmacist reviews the prescription before it is dispatched.',
      },
      {
        q: 'What information do I need to give at checkout?',
        a: [
          'Your name, a phone number that will be answered on the day of delivery, and a delivery address with a clear landmark. An email address is optional but useful, because we can send your confirmation there.',
          'If you are ordering medicine for someone else, such as a child or a parent, tell us the patient’s name and age when a pharmacist asks. That helps us check the dose and the product are suitable.',
        ],
      },
      {
        q: 'Can I order for someone else?',
        a: [
          'Yes. Many customers order for a child, an elderly parent or a relative. Use the delivery address and phone number of the person who will receive the parcel.',
          'For prescription medicines, the prescription must be in the patient’s name. For any medicine, a pharmacist may ask a few questions about the patient to make sure the product is right for them.',
        ],
      },
      {
        q: 'Can I change or cancel an order after placing it?',
        a: [
          'Contact us as soon as you can on WhatsApp or by phone, with your order number. If the order has not yet been dispensed or dispatched, we can usually change the items or address, or cancel it and refund anything you have paid.',
          'Once a medicine has been dispensed it cannot be taken back, so a change may not be possible after that point. This is explained in our Returns & Refunds policy.',
        ],
        link: { href: '/returns', label: 'Returns & Refunds' },
      },
      {
        q: 'How do I track my order?',
        a: [
          'If you have an account, open Account and then Orders to see every order and where it is. If you ordered as a guest, use Track order and enter your order number together with the phone number or email you used at checkout.',
          'We also contact you if there is a delay, and the rider or courier calls before arriving.',
        ],
        link: { href: '/account/orders', label: 'Track an order' },
      },
      {
        q: 'I did not get an order confirmation. What should I do?',
        a: [
          'Check that you entered your phone number and email correctly, and look in your spam folder. If you ordered while signed in, the order will also appear under Account, then Orders.',
          'If you still cannot find it, message us on WhatsApp with your name, phone number and what you ordered, and we will confirm whether the order was received. Please do not place it again until we have checked, so you are not charged twice.',
        ],
      },
      {
        q: 'What if I entered the wrong address or phone number?',
        a: [
          'Tell us immediately on WhatsApp or by phone, with your order number. If the order has not left the pharmacy we can correct the address or number at no charge.',
          'If it is already with a rider, we will try to reach them and redirect the parcel, but we cannot always change the destination once the order is on its way.',
        ],
      },
      {
        q: 'What if a product is out of stock?',
        a: [
          'Out-of-stock products cannot be added to your cart. If you need one urgently, ask a pharmacist on WhatsApp. They can tell you when we expect more stock and suggest a suitable alternative.',
          'If an item becomes unavailable after you have placed an order, we will contact you before dispatch to offer an alternative, a partial refund or a full refund. We never substitute a medicine without asking you first.',
        ],
      },
    ],
  },
  {
    id: 'prescriptions',
    title: 'Prescriptions & medicines',
    items: [
      {
        q: 'Do I need a prescription?',
        a: [
          'Only for prescription-only medicines, which are marked POM on the product. Everything else can be bought without one.',
          'Common examples of prescription-only medicines are antibiotics, many blood pressure and diabetes medicines, and strong painkillers. If you are not sure whether a product needs a prescription, the product page and the cart both tell you.',
        ],
      },
      {
        q: 'What do OTC, P and POM mean?',
        a: ['Every medicine in Kenya falls into one of three classes, and we show it on each product:'],
        list: [
          'OTC (over the counter): no prescription needed. You can buy it freely and use it following the leaflet.',
          'P (pharmacy medicine): no prescription needed, but it is sold under the supervision of a pharmacist, who may ask you a few questions first to make sure it is suitable.',
          'POM (prescription-only medicine): can only be supplied against a valid prescription from a licensed prescriber.',
        ],
        after: 'These classes exist to keep people safe. They are set by the regulator, not by us.',
      },
      {
        q: 'How do I send my prescription?',
        a: ['Share a clear photo or scan of the prescription with our pharmacists on WhatsApp, or through the Contact page. To help us process it quickly:'],
        list: [
          'Lay the prescription flat in good light and make sure all four corners are visible.',
          'Check that the prescriber’s name and details, the date, the patient’s name, and each medicine with its strength, quantity and directions are all readable.',
          'Send your order number as well, if you have already placed an order.',
        ],
        after: 'A pharmacist reviews every prescription before the medicine is dispatched. We may ask you for the original on delivery or pickup.',
        link: { href: '/contact', label: 'Contact us' },
      },
      {
        q: 'What makes a prescription valid?',
        a: [
          'A valid prescription is issued by a licensed healthcare professional who is allowed to prescribe the medicine. It must be current, name the patient, and clearly state the medicine, its strength, the quantity and the directions for use. It should carry the prescriber’s details so that we can verify it.',
          'We may call the prescriber to confirm a prescription, which is a normal safety step. Prescriptions that are altered, unclear, expired or that do not meet these requirements cannot be accepted.',
        ],
      },
      {
        q: 'Why was my prescription order held?',
        a: [
          'Every order that contains a prescription-only medicine is checked by a pharmacist before it is dispatched. The check covers the prescription itself, the dose and quantity, and whether the medicine is suitable alongside anything else the patient is taking.',
          'If something is missing or unclear, we contact you rather than guess. The quicker you reply, the quicker the order goes out. Delivery times start once the prescription has been verified.',
        ],
      },
      {
        q: 'Can I buy antibiotics without a prescription?',
        a: [
          'No. Antibiotics are prescription-only medicines and we cannot supply them without a valid prescription. This is a legal requirement, and it also protects you.',
          'Antibiotics only work against bacterial infections, not colds or flu, and using them when they are not needed or not finishing a course helps bacteria become resistant, which makes infections harder to treat later. A doctor decides whether you need one, and which.',
        ],
      },
      {
        q: 'Can I get repeat or long-term prescriptions?',
        a: [
          'Yes, you can order your regular medicines again, but a pharmacist still checks each supply. We can only supply what the prescription allows, so you may need a fresh prescription when the quantity prescribed runs out or the prescription expires.',
          'If you take medicine every day, do not wait until the last tablet. Order a few days early so there is time for verification and delivery.',
        ],
      },
      {
        q: 'Do you accept prescriptions from any doctor or hospital?',
        a: [
          'We accept prescriptions from licensed healthcare professionals in Kenya. We review prescriptions from elsewhere case by case, and we may decline one if we cannot verify the prescriber or if the medicine cannot be supplied lawfully in Kenya.',
          'Some medicines are subject to extra legal controls. For those we may need to see the original prescription and we may not be able to supply them online at all.',
        ],
      },
      {
        q: 'Can a pharmacist advise me before I buy?',
        a: [
          'Yes. Use Ask a pharmacist on any page to chat on WhatsApp. Our pharmacists can explain how a product is used, how it should be taken, common side effects, whether it is suitable with your other medicines, and when it is better to see a doctor.',
          'They cannot diagnose a condition or replace a consultation with your doctor. For anything that feels serious or sudden, see a doctor or go to the nearest emergency facility.',
        ],
      },
      {
        q: 'Should I tell you about allergies or other medicines?',
        a: [
          'Yes, always. Tell the pharmacist about any allergies, any medicines you already take (including herbal remedies and supplements), whether you are pregnant or breastfeeding, and any long-term conditions. This helps us spot products that might not be safe for you.',
          'For children, tell us their age and weight, because doses depend on them.',
        ],
      },
      {
        q: 'Could the pharmacist suggest a different brand?',
        a: [
          'Sometimes a medicine is available as a generic with the same active ingredient at a lower price, or the brand you asked for is out of stock. A pharmacist may suggest an equivalent. We never change what you receive without asking you first, and for prescriptions we only substitute where the law and the prescriber allow it.',
        ],
      },
      {
        q: 'Are there age restrictions?',
        a: [
          'Some products are for adults only and are marked 18+. We may ask you to confirm your age, and the person receiving the order may need to show ID. We may refuse to supply a product where we are not satisfied that it is appropriate.',
          'Medicines for children are sold to the parent or guardian, who is responsible for giving them as directed.',
        ],
      },
      {
        q: 'Are your medicines genuine?',
        a: [
          'Yes. We buy from licensed manufacturers and distributors, we store products as the manufacturer directs, and our pharmacy is regulated by the Pharmacy and Poisons Board of Kenya.',
          'Every product is supplied in its original, sealed packaging with its batch number and expiry date. If you ever have doubts about a product, do not use it. Contact us with a photo of the pack and the batch number.',
        ],
      },
      {
        q: 'How do I check the expiry date and batch number?',
        a: [
          'Both are printed on the pack, usually on the box and on the blister or bottle. We check expiry dates before we dispatch, but you should check them too when your order arrives.',
          'If a product has expired, or is too close to expiry to be used as directed, contact us within 24 hours of delivery and we will replace it or refund you.',
        ],
      },
      {
        q: 'How should I store my medicines?',
        a: ['Follow the leaflet first. As a general rule:'],
        list: [
          'Keep medicines in a cool, dry place away from direct sunlight and heat. A bathroom is usually too damp.',
          'Refrigerate only if the pack says so.',
          'Keep every medicine out of the reach and sight of children.',
          'Keep tablets in their original pack so that you can still read the name, strength and expiry date.',
        ],
        after: 'Unused or expired medicines should be returned to a pharmacy for safe disposal, not thrown away with the household rubbish.',
      },
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery & pickup',
    items: [
      {
        q: 'How fast is delivery?',
        a: [
          'Orders placed before 2pm on a business day are delivered the same day within Nairobi. Orders placed after 2pm, and deliveries to other towns, usually arrive in 1 to 3 business days.',
          'These are estimates, counted from when your order is confirmed. If your order contains a prescription medicine, the time starts once the pharmacist has verified the prescription. If anything delays your order, we tell you.',
        ],
        link: { href: '/shipping', label: 'Shipping Policy' },
      },
      {
        q: 'Where do you deliver?',
        a: [
          'We deliver across Kenya. Nairobi and surrounding areas are covered by our own riders, and other towns are served through vetted courier partners.',
          'We do not currently deliver outside Kenya. Because our riders and couriers need to find you, please give a physical address with a clear landmark and a phone number that will be answered.',
        ],
      },
      {
        q: 'How much does delivery cost?',
        a: [
          'The fee depends on your delivery zone, and it is shown at checkout before you pay, so you always know the total first.',
          'If you change the items in your cart or the delivery area, the fee is recalculated automatically. We do not add hidden handling charges.',
        ],
      },
      {
        q: 'Can I collect my order from the store?',
        a: [
          'Yes. Choose store pickup at checkout. There is no delivery fee for pickup, and we will tell you when your order is ready.',
          'Bring your order number and a valid ID. If the order contains a prescription medicine, bring the original prescription too. The person collecting may be asked to confirm the patient’s name.',
        ],
      },
      {
        q: 'What happens if I am not available when the rider arrives?',
        a: [
          'The rider or courier calls the number on your order before arriving. If nobody can receive the parcel, we will arrange another time with you.',
          'Medicines should not be left unattended, so we do not leave parcels at a gate or with a neighbour unless you have agreed that with us beforehand. If we cannot reach you after reasonable attempts, the order goes back to the pharmacy, and a further delivery fee may apply.',
        ],
      },
      {
        q: 'Can I choose a delivery time?',
        a: [
          'We cannot promise a fixed time slot. Our riders and couriers call you shortly before they arrive, so keep your phone on. If you need the parcel received at a particular time, tell us on WhatsApp when you order and we will do our best to arrange it.',
        ],
      },
      {
        q: 'Can I have my order delivered to my workplace or to someone else?',
        a: [
          'Yes. Use the address and phone number of the person who will receive it. They may be asked to confirm the name on the order, and to show ID for age-restricted products or prescription medicines.',
        ],
      },
      {
        q: 'Is delivery discreet?',
        a: [
          'Yes. Orders are packed in plain, sealed packaging that does not show what is inside, and riders are not told what is in your parcel.',
        ],
      },
      {
        q: 'My order is late. What should I do?',
        a: [
          'First check the order status in your account or with Track order. Delays most often happen when a prescription needs checking, or because of traffic, weather or public holidays.',
          'If it is later than the time we gave you, message us on WhatsApp with your order number and we will find out where it is and tell you.',
        ],
      },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    items: [
      {
        q: 'How can I pay?',
        a: [
          'You can pay with M-PESA or in cash on delivery. The options available are shown at checkout, and the total you pay is the one shown before you place the order.',
        ],
      },
      {
        q: 'How do I pay with M-PESA?',
        a: [
          'Choose M-PESA at checkout and follow the on-screen instructions. Use the phone number that is registered with M-PESA, and keep your phone near you in case you are asked to confirm the payment.',
          'You will never be asked for your M-PESA PIN by us, by phone or by message. Only enter it on your own phone’s M-PESA prompt.',
        ],
      },
      {
        q: 'How does cash on delivery work?',
        a: [
          'Pay the rider in cash when you receive and check your order. Please have the amount ready, since riders may not carry change. If your order contains a prescription medicine, it is released after the pharmacist has verified your prescription, as for any other order.',
        ],
      },
      {
        q: 'Will I get a receipt?',
        a: [
          'Yes. Your order confirmation lists the items, the delivery fee and the total, and you can see past orders in your account. If you need an invoice or receipt for insurance, tell us your order number and we will provide one.',
        ],
      },
      {
        q: 'My payment failed but I was charged. What should I do?',
        a: [
          'Do not pay again. Message us on WhatsApp with your order number and the payment confirmation message (the M-PESA confirmation SMS and transaction code).',
          'We will check the payment. If the order was not created, we will either complete it for you or refund the money to the payment method you used.',
        ],
      },
      {
        q: 'Do you accept medical insurance?',
        a: [
          'We do not currently bill insurers directly. You pay for your order, and we can give you a receipt or invoice to submit to your insurer for a refund, subject to your policy. Contact us with your order number if you need one.',
        ],
      },
    ],
  },
  {
    id: 'returns',
    title: 'Returns & refunds',
    items: [
      {
        q: 'Can I return medicines?',
        a: [
          'No. For patient safety, and in line with Pharmacy and Poisons Board guidance, medicines cannot be returned or exchanged once they have left our pharmacy, even if the pack is unopened. We cannot know how a medicine has been stored once it is out of our care, so it cannot be safely resold.',
          'The exception is a mistake on our side: a wrong, damaged, expired or missing item. That is covered below.',
        ],
        link: { href: '/returns', label: 'Returns & Refunds' },
      },
      {
        q: 'What if I receive the wrong or damaged item?',
        a: [
          'Contact us within 24 hours of delivery. Tell us your order number and send a clear photo of the item and its packaging, including the batch number and expiry date if it is a medicine. We will arrange a free replacement or a refund.',
          'You do not need to send anything back unless we ask you to. If we do, we collect it and cover the cost.',
        ],
      },
      {
        q: 'I already took the wrong medicine. What should I do?',
        a: [
          'Stop taking it. If you feel unwell, or the person who took it is a child, get medical help straight away or go to the nearest emergency facility, and take the pack with you. Then contact us with the product name and batch number so that we can look into what happened and put it right.',
        ],
      },
      {
        q: 'Can I return non-medicine products?',
        a: [
          'Yes, in some cases. Wellness devices, baby care and skincare items in their original, unopened and unused condition can be returned within 7 days of delivery for a refund or an exchange.',
          'Opened or used items cannot be accepted for hygiene and safety reasons. We inspect returns when they arrive, and if an item does not meet these conditions we will tell you why.',
        ],
      },
      {
        q: 'How long do refunds take?',
        a: ['Approved refunds go back to the original payment method:'],
        list: [
          'M-PESA: usually 1 to 2 business days.',
          'Cash on delivery: we agree the refund method with you at the time.',
        ],
        after: 'The time is counted from the day we approve the refund.',
      },
      {
        q: 'What if I cancel before my order is dispatched?',
        a: [
          'You can cancel at no cost until the order has been dispensed and dispatched. Contact us as soon as possible with your order number. If you have already paid, you are refunded in full.',
        ],
      },
    ],
  },
  {
    id: 'safety',
    title: 'Safety & privacy',
    items: [
      {
        q: 'Is it safe to buy medicines online from you?',
        a: [
          'Yes. We are a licensed pharmacy regulated by the Pharmacy and Poisons Board. Every prescription medicine is checked by a pharmacist before it is dispatched, our products come from licensed suppliers, and everything is supplied in sealed, original packaging.',
          'As with any medicine, read the leaflet and follow your prescriber’s or pharmacist’s advice. Be cautious about buying medicines from any seller who does not ask for a prescription when one is required.',
        ],
      },
      {
        q: 'How can I tell a medicine is not counterfeit?',
        a: ['Our products come from licensed suppliers. As a general guide, be careful if a pack:'],
        list: [
          'has spelling mistakes, blurry printing or colours that look different from usual',
          'has no batch number, no expiry date or no manufacturer details',
          'has a seal that is broken or looks as if it was re-applied',
          'contains tablets that look different in colour, shape or marking from what you normally receive',
        ],
        after: 'If anything looks wrong, do not use it, and send us a photo with the batch number. You can also report suspected counterfeit medicines to the Pharmacy and Poisons Board.',
      },
      {
        q: 'How do I report a side effect or a problem with a medicine?',
        a: [
          'If you feel unwell after taking a medicine, stop using it and get medical help if you need it. When you are safe, tell us the product name, the batch number and what happened, so that we can follow it up.',
          'You can also report side effects and quality problems directly to the Pharmacy and Poisons Board. Reporting helps to keep other people safe.',
        ],
      },
      {
        q: 'What should I do in an emergency?',
        a: [
          'Do not use this website or a chat message. If someone has a sudden or serious condition, has taken too much of a medicine, has a severe allergic reaction, or has difficulty breathing, go to the nearest hospital or call emergency services immediately.',
        ],
      },
      {
        q: 'What happens to my personal information?',
        a: [
          'We use it to process and deliver your order, verify prescriptions, give you support and send order updates. We share it only with the people who need it to do that, such as delivery riders and payment partners, and with regulators where the law requires it. We do not sell your personal data.',
          'Our Privacy Policy explains in full what we collect, why, how long we keep it and what your rights are under the Data Protection Act, 2019.',
        ],
        link: { href: '/privacy', label: 'Privacy Policy' },
      },
      {
        q: 'Who can see my prescription?',
        a: [
          'Only our licensed pharmacists and the staff who need it to complete your order. Prescriptions are stored securely, and we keep them for as long as the law requires for pharmacy records.',
        ],
      },
      {
        q: 'Can I ask you to delete my data?',
        a: [
          'Yes. You can ask us to access, correct or delete the personal data we hold about you. If you delete your account, we remove your profile, saved addresses and wishlist. We may need to keep some order and prescription records, because pharmacy law requires it.',
          'Contact us with your request and we will reply within the time the law allows.',
        ],
      },
      {
        q: 'How do I stop receiving offers?',
        a: [
          'Use the unsubscribe link in any message we send, or contact us and we will remove you. You will still receive messages about orders you have placed, such as confirmations and delivery updates, because those are part of the service.',
        ],
      },
    ],
  },
];

export const allFaqs: FaqItem[] = faqGroups.flatMap((g) => g.items);

/** Questions shown on the homepage, in this order. */
export const homeFaqQuestions = [
  'Do I need a prescription?',
  'How fast is delivery?',
  'How can I pay?',
  'Can I return medicines?',
  'How do I track my order?',
  'Are your medicines genuine?',
];
