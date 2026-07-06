import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  products: defineTable({
    slug: v.string(),
    name: v.string(),
    brand: v.string(),
    brandSlug: v.string(),
    genericName: v.string(),
    category: v.string(),
    categorySlug: v.string(),
    conditions: v.array(v.string()),
    classification: v.union(v.literal('OTC'), v.literal('P'), v.literal('POM')),
    form: v.string(),
    strength: v.string(),
    packSize: v.string(),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    description: v.string(),
    directions: v.string(),
    warnings: v.string(),
    ingredients: v.string(),
    
    // Media (Shopify supports multiple, keeping existing for fallback)
    imageStorageId: v.optional(v.id('_storage')),
    imageUrl: v.optional(v.string()),
    media: v.optional(v.array(v.object({
      url: v.string(),
      altText: v.optional(v.string()),
      type: v.union(v.literal('image'), v.literal('video'), v.literal('3d'))
    }))),
    
    // Shopify Pricing details
    costPerItem: v.optional(v.number()),
    chargeTax: v.optional(v.boolean()),
    
    // Shopify Inventory details
    inStock: v.boolean(),
    stockQty: v.number(), // Legacy/Aggregated available
    sku: v.optional(v.string()),
    barcode: v.optional(v.string()),
    weight: v.optional(v.string()),
    trackQuantity: v.optional(v.boolean()),
    continueSellingOutOfStock: v.optional(v.boolean()),
    requiresShipping: v.optional(v.boolean()),
    hasVariants: v.optional(v.boolean()),
    
    // Shopify SEO & Channels
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    publishedChannels: v.optional(v.array(v.string())),
    status: v.optional(v.union(v.literal('active'), v.literal('draft'), v.literal('archived'))),
    
    // Flags
    isNew: v.optional(v.boolean()),
    isTrending: v.optional(v.boolean()),
    isBestSeller: v.optional(v.boolean()),
    isOffer: v.optional(v.boolean()),
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
  })
    .index('by_slug', ['slug'])
    .index('by_category', ['categorySlug'])
    .index('by_trending', ['isTrending'])
    .index('by_best_seller', ['isBestSeller'])
    .index('by_new', ['isNew'])
    .index('by_offer', ['isOffer']),

  productVariants: defineTable({
    productId: v.id('products'),
    title: v.string(),
    options: v.array(v.string()), // e.g. ["Small", "Red"]
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    costPerItem: v.optional(v.number()),
    sku: v.optional(v.string()),
    barcode: v.optional(v.string()),
    weight: v.optional(v.string()),
    inventoryItemId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  }).index('by_product', ['productId']),

  locations: defineTable({
    name: v.string(),
    address: v.string(),
    isActive: v.boolean(),
    isFulfillmentLocation: v.boolean(),
  }),

  inventoryLevels: defineTable({
    inventoryItemId: v.string(), // Maps to product or variant
    locationId: v.id('locations'),
    onHand: v.number(),
    committed: v.number(),
    available: v.number(),
  }).index('by_item', ['inventoryItemId']),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    productCount: v.number(),
    imageStorageId: v.optional(v.id('_storage')),
    imageUrl: v.optional(v.string()),
  }).index('by_slug', ['slug']),

  brands: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    productCount: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id('_storage')),
  }).index('by_slug', ['slug']),

  conditions: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    productCount: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id('_storage')),
  }).index('by_slug', ['slug']),

  deliveryZones: defineTable({
    name: v.string(),
    price: v.number(),
    isActive: v.boolean(),
  }),

  orders: defineTable({
    orderNumber: v.string(),
    customerId: v.optional(v.string()),
    customerName: v.string(),
    customerPhone: v.string(),
    customerEmail: v.string(),
    items: v.array(
      v.object({
        productId: v.string(),
        name: v.string(),
        qty: v.number(),
        price: v.number(),
      })
    ),
    subtotal: v.number(),
    deliveryFee: v.number(),
    total: v.number(),
    status: v.union(
      v.literal('placed'),
      v.literal('confirmed'),
      v.literal('packed'),
      v.literal('delivering'),
      v.literal('completed'),
      v.literal('cancelled')
    ),
    paymentMethod: v.union(v.literal('mpesa'), v.literal('card'), v.literal('cod')),
    paymentStatus: v.optional(v.union(v.literal('pending'), v.literal('paid'), v.literal('collected'), v.literal('refunded'), v.literal('partially_refunded'))),
    paymentRef: v.optional(v.string()),
    deliveryAddress: v.string(),
    // Shopify Specifics
    channel: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  })
    .index('by_order_number', ['orderNumber'])
    .index('by_customer', ['customerId'])
    .index('by_status', ['status']),

  fulfillments: defineTable({
    orderId: v.id('orders'),
    locationId: v.optional(v.id('locations')),
    status: v.union(v.literal('unfulfilled'), v.literal('fulfilled'), v.literal('partial')),
    carrier: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    trackingUrl: v.optional(v.string()),
    items: v.array(v.object({
      productId: v.string(),
      qty: v.number()
    }))
  }).index('by_order', ['orderId']),

  abandonedCheckouts: defineTable({
    customerId: v.optional(v.string()),
    customerDetails: v.optional(v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string()
    })),
    lineItems: v.array(v.object({
      productId: v.string(),
      name: v.string(),
      qty: v.number(),
      price: v.number()
    })),
    recoveryStatus: v.union(v.literal('not_sent'), v.literal('sent'), v.literal('recovered')),
    total: v.number(),
    createdAt: v.number(),
  }),

  draftOrders: defineTable({
    customerId: v.optional(v.string()),
    lineItems: v.array(
      v.object({
        productId: v.string(),
        name: v.string(),
        qty: v.number(),
        price: v.number(),
      })
    ),
    customDiscount: v.optional(v.number()),
    invoiceStatus: v.union(v.literal('open'), v.literal('paid'), v.literal('expired')),
    createdBy: v.id('staff'),
  }),

  orderEdits: defineTable({
    orderId: v.id('orders'),
    changeType: v.union(v.literal('addItem'), v.literal('removeItem'), v.literal('quantityChange')),
    diffAmount: v.number(),
    actorId: v.id('staff'),
    createdAt: v.number(),
  }).index('by_order', ['orderId']),

  riskFlags: defineTable({
    orderId: v.id('orders'),
    riskLevel: v.union(v.literal('low'), v.literal('medium'), v.literal('high')),
    reasons: v.array(v.string()),
  }).index('by_order', ['orderId']),

  adminSecurity: defineTable({
    passcodeHash: v.string(),
    failedAttempts: v.number(),
    lastFailedAt: v.optional(v.number()),
    updatedAt: v.number(),
  }),

  adminSessions: defineTable({
    staffId: v.optional(v.id('staff')),
    token: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index('by_token', ['token']),

  auditLog: defineTable({
    actorId: v.optional(v.id('staff')),
    action: v.string(),
    targetType: v.string(),
    targetId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index('by_actor', ['actorId'])
    .index('by_action', ['action'])
    .index('by_created', ['createdAt']),

  discounts: defineTable({
    code: v.string(),
    title: v.optional(v.string()),
    type: v.union(v.literal('percentage'), v.literal('fixed'), v.literal('buyXgetY'), v.literal('freeShipping')),
    value: v.number(),
    appliesTo: v.optional(v.union(v.literal('allProducts'), v.literal('specificCollections'), v.literal('specificProducts'))),
    targetIds: v.optional(v.array(v.string())),
    minimumType: v.optional(v.union(v.literal('none'), v.literal('amount'), v.literal('quantity'))),
    minimumValue: v.optional(v.number()),
    eligibility: v.optional(v.union(v.literal('everyone'), v.literal('segment'), v.literal('specificCustomers'))),
    eligibleIds: v.optional(v.array(v.string())),
    usageLimit: v.optional(v.number()),
    oncePerCustomer: v.optional(v.boolean()),
    usedCount: v.number(),
    combinesWithProductDiscounts: v.optional(v.boolean()),
    combinesWithOrderDiscounts: v.optional(v.boolean()),
    combinesWithShipping: v.optional(v.boolean()),
    startsAt: v.optional(v.number()),
    endsAt: v.optional(v.number()),
    status: v.union(v.literal('active'), v.literal('scheduled'), v.literal('expired')),
    active: v.boolean(),
  }).index('by_code', ['code']),

  inventoryLog: defineTable({
    productId: v.id('products'),
    variantId: v.optional(v.string()),
    changeAmount: v.number(),
    reason: v.string(),
    actorId: v.optional(v.id('staff')),
    createdAt: v.number(),
  }).index('by_product', ['productId']),

  customerTags: defineTable({
    customerId: v.string(),
    tag: v.string(),
  }).index('by_customer', ['customerId']),

  customerNotes: defineTable({
    customerId: v.string(),
    authorId: v.id('staff'),
    body: v.string(),
    createdAt: v.number(),
  }).index('by_customer', ['customerId']),

  customerSegments: defineTable({
    name: v.string(),
    ruleExpression: v.string(),
  }),

  // Metaobjects
  metaobjects: defineTable({
    namespace: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    fields: v.array(v.object({
      key: v.string(),
      name: v.string(),
      type: v.union(v.literal('single_line_text'), v.literal('multi_line_text'), v.literal('integer'), v.literal('json'), v.literal('boolean'), v.literal('file_reference'))
    }))
  }).index('by_namespace', ['namespace']),

  metafields: defineTable({
    ownerId: v.string(),
    namespace: v.string(),
    key: v.string(),
    value: v.any(),
    type: v.string()
  }).index('by_owner', ['ownerId']),

  staff: defineTable({
    name: v.string(),
    role: v.union(v.literal('super_admin'), v.literal('admin'), v.literal('pharmacist'), v.literal('support')),
    email: v.string(),
    phone: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.number(),
  }),

  notifications: defineTable({
    type: v.union(v.literal('new_order'), v.literal('low_stock'), v.literal('prescription_approval'), v.literal('refund_processed')),
    title: v.string(),
    message: v.string(),
    targetId: v.optional(v.string()),
    read: v.boolean(),
    createdAt: v.number(),
  }).index('by_read', ['read']),

  storeSettings: defineTable({
    key: v.string(),
    value: v.any(),
  }).index('by_key', ['key']),
});
