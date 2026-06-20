require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sequelize, User, Role, Permission, RolePermission, Category, Product, Supplier,
  Order, OrderItem, CourierService, Transaction, Promotion, Newsletter, Campaign } = require('../models');
const bcrypt = require('bcryptjs');

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Roles
    const roles = await Role.bulkCreate([
      { name: 'SuperAdmin', description: 'Full system access' },
      { name: 'Admin', description: 'Administrative access' },
      { name: 'Staff', description: 'Limited staff access' },
      { name: 'Client', description: 'Customer access' }
    ]);

    // Permissions
    const modules = ['dashboard','products','categories','orders','users','staff','suppliers','transactions','marketing','permissions'];
    const actions = ['create','read','update','delete','manage'];
    const perms = [];
    for (const m of modules) {
      for (const a of actions) {
        perms.push({ module: m, action: a, description: `${a} ${m}` });
      }
    }
    const permissions = await Permission.bulkCreate(perms);

    // Assign all perms to SuperAdmin
    const saPerms = permissions.map(p => ({ roleId: roles[0].id, permissionId: p.id }));
    await RolePermission.bulkCreate(saPerms);

    // Users (password pre-hashed since hooks run on create)
    const users = await User.bulkCreate([
      { name: 'Sumon Admin', email: 'admin@sumon.com', password: 'admin123', role: 'superadmin', status: 'active', phone: '01700000001' },
      { name: 'Rahim Manager', email: 'rahim@sumon.com', password: 'staff123', role: 'admin', status: 'active', phone: '01700000002' },
      { name: 'Karim Staff', email: 'karim@sumon.com', password: 'staff123', role: 'staff', status: 'active', phone: '01700000003' },
      { name: 'Ayesha Client', email: 'ayesha@email.com', password: 'client123', role: 'client', status: 'active', phone: '01800000001', address: '12 Gulshan Ave', city: 'Dhaka', country: 'Bangladesh' },
      { name: 'Fatima Khan', email: 'fatima@email.com', password: 'client123', role: 'client', status: 'active', phone: '01800000002', address: '45 Dhanmondi Rd', city: 'Dhaka', country: 'Bangladesh' },
      { name: 'Rashid Ahmed', email: 'rashid@email.com', password: 'client123', role: 'client', status: 'active', phone: '01800000003', address: '78 Mirpur Rd', city: 'Dhaka', country: 'Bangladesh' },
      { name: 'Nusrat Jahan', email: 'nusrat@email.com', password: 'client123', role: 'client', status: 'active', phone: '01800000004', address: '23 CDA Ave', city: 'Chittagong', country: 'Bangladesh' },
      { name: 'Hasan Ali', email: 'hasan@email.com', password: 'client123', role: 'client', status: 'active', phone: '01800000005', address: '56 Banani Rd', city: 'Dhaka', country: 'Bangladesh' }
    ], { individualHooks: true });

    // Suppliers
    const suppliers = await Supplier.bulkCreate([
      { name: 'TechVision Ltd', email: 'info@techvision.com', phone: '01900000001', company: 'TechVision Ltd', address: '100 Tech Park', city: 'Dhaka', country: 'Bangladesh', status: 'active' },
      { name: 'FashionHub BD', email: 'sales@fashionhub.com', phone: '01900000002', company: 'FashionHub BD', address: '200 Fashion St', city: 'Dhaka', country: 'Bangladesh', status: 'active' },
      { name: 'HomeGoods Co', email: 'order@homegoods.com', phone: '01900000003', company: 'HomeGoods Co', address: '300 Home Ave', city: 'Chittagong', country: 'Bangladesh', status: 'active' },
      { name: 'SportZone BD', email: 'info@sportzone.com', phone: '01900000004', company: 'SportZone BD', address: '400 Sport Lane', city: 'Dhaka', country: 'Bangladesh', status: 'active' },
      { name: 'GreenLife Organics', email: 'hello@greenlife.com', phone: '01900000005', company: 'GreenLife Organics', address: '500 Green Rd', city: 'Sylhet', country: 'Bangladesh', status: 'active' }
    ]);

    // Categories
    const electronics = await Category.create({ name: 'Electronics', slug: 'electronics', status: 'active', sortOrder: 1 });
    const fashion = await Category.create({ name: 'Fashion', slug: 'fashion', status: 'active', sortOrder: 2 });
    const home = await Category.create({ name: 'Home & Living', slug: 'home-living', status: 'active', sortOrder: 3 });
    const sports = await Category.create({ name: 'Sports', slug: 'sports', status: 'active', sortOrder: 4 });
    const grocery = await Category.create({ name: 'Grocery', slug: 'grocery', status: 'active', sortOrder: 5 });

    // Sub-categories
    const phones = await Category.create({ name: 'Smartphones', slug: 'smartphones', parentId: electronics.id, status: 'active' });
    const laptops = await Category.create({ name: 'Laptops', slug: 'laptops', parentId: electronics.id, status: 'active' });
    const accessories = await Category.create({ name: 'Accessories', slug: 'accessories', parentId: electronics.id, status: 'active' });
    const menFashion = await Category.create({ name: "Men's Wear", slug: 'mens-wear', parentId: fashion.id, status: 'active' });
    const womenFashion = await Category.create({ name: "Women's Wear", slug: 'womens-wear', parentId: fashion.id, status: 'active' });
    const kitchen = await Category.create({ name: 'Kitchen', slug: 'kitchen', parentId: home.id, status: 'active' });
    const furniture = await Category.create({ name: 'Furniture', slug: 'furniture', parentId: home.id, status: 'active' });

    // Products (20+)
    const products = await Product.bulkCreate([
      { name: 'iPhone 15 Pro', slug: 'iphone-15-pro', sku: 'SKU-001', price: 129999, costPrice: 110000, comparePrice: 139999, stock: 25, categoryId: phones.id, supplierId: suppliers[0].id, status: 'active', featured: true, description: 'Latest Apple iPhone with A17 Pro chip', unit: 'pcs' },
      { name: 'Samsung Galaxy S24', slug: 'samsung-galaxy-s24', sku: 'SKU-002', price: 99999, costPrice: 82000, comparePrice: 109999, stock: 30, categoryId: phones.id, supplierId: suppliers[0].id, status: 'active', featured: true, description: 'Samsung flagship with Galaxy AI', unit: 'pcs' },
      { name: 'Google Pixel 8 Pro', slug: 'google-pixel-8-pro', sku: 'SKU-002b', price: 95000, costPrice: 78000, stock: 20, categoryId: phones.id, supplierId: suppliers[0].id, status: 'active', description: 'Google flagship phone with pure Android', unit: 'pcs' },
      { name: 'OnePlus 12', slug: 'oneplus-12', sku: 'SKU-002c', price: 80000, costPrice: 65000, stock: 15, categoryId: phones.id, supplierId: suppliers[0].id, status: 'active', description: 'Smooth performance with Snapdragon 8 Gen 3', unit: 'pcs' },
      { name: 'Xiaomi 14 Ultra', slug: 'xiaomi-14-ultra', sku: 'SKU-002d', price: 115000, costPrice: 95000, stock: 10, categoryId: phones.id, supplierId: suppliers[0].id, status: 'active', description: 'Professional Leica optics camera phone', unit: 'pcs' },
      
      { name: 'MacBook Air M3', slug: 'macbook-air-m3', sku: 'SKU-003', price: 149999, costPrice: 125000, stock: 15, categoryId: laptops.id, supplierId: suppliers[0].id, status: 'active', featured: true, description: 'Thin and light with M3 chip', unit: 'pcs' },
      { name: 'Dell XPS 15', slug: 'dell-xps-15', sku: 'SKU-004', price: 134999, costPrice: 115000, stock: 10, categoryId: laptops.id, supplierId: suppliers[0].id, status: 'active', description: 'Premium Windows laptop', unit: 'pcs' },
      { name: 'HP Spectre x360', slug: 'hp-spectre-x360', sku: 'SKU-004b', price: 140000, costPrice: 120000, stock: 8, categoryId: laptops.id, supplierId: suppliers[0].id, status: 'active', description: '2-in-1 convertible touchscreen laptop', unit: 'pcs' },
      { name: 'Lenovo ThinkPad X1 Carbon', slug: 'lenovo-thinkpad-x1', sku: 'SKU-004c', price: 165000, costPrice: 145000, stock: 12, categoryId: laptops.id, supplierId: suppliers[0].id, status: 'active', description: 'Ultimate business laptop with carbon-fiber weave', unit: 'pcs' },
      { name: 'Asus ROG Zephyrus G14', slug: 'asus-rog-zephyrus-g14', sku: 'SKU-004d', price: 185000, costPrice: 160000, stock: 5, categoryId: laptops.id, supplierId: suppliers[0].id, status: 'active', description: 'Powerful compact gaming laptop', unit: 'pcs' },
      
      { name: 'Wireless Earbuds Pro', slug: 'wireless-earbuds-pro', sku: 'SKU-005', price: 5999, costPrice: 3500, stock: 100, categoryId: electronics.id, supplierId: suppliers[0].id, status: 'active', description: 'Active noise cancellation earbuds', unit: 'pcs' },
      { name: 'Smart Watch Pro', slug: 'smart-watch-pro', sku: 'SKU-020', price: 8999, costPrice: 5500, comparePrice: 10999, stock: 35, categoryId: electronics.id, supplierId: suppliers[0].id, status: 'active', featured: true, description: 'AMOLED display smartwatch with health tracking', unit: 'pcs' },
      { name: 'Bluetooth Speaker', slug: 'bluetooth-speaker', sku: 'SKU-021', price: 2999, costPrice: 1500, stock: 55, categoryId: electronics.id, supplierId: suppliers[0].id, status: 'active', description: 'Portable waterproof bluetooth speaker', unit: 'pcs' },
      { name: 'Anker Power Bank 20k', slug: 'anker-power-bank-20k', sku: 'SKU-021b', price: 4500, costPrice: 2800, stock: 80, categoryId: electronics.id, supplierId: suppliers[0].id, status: 'active', description: 'High-speed charging portable power bank', unit: 'pcs' },
      { name: 'HDMI Cable 4K 3m', slug: 'hdmi-cable-4k-3m', sku: 'SKU-021c', price: 800, costPrice: 400, stock: 200, categoryId: electronics.id, supplierId: suppliers[0].id, status: 'active', description: 'High-speed gold-plated HDMI cable', unit: 'pcs' },
      
      { name: 'USB-C Hub Multiport', slug: 'usb-c-hub-multiport', sku: 'SKU-acc1', price: 3500, costPrice: 2000, stock: 110, categoryId: accessories.id, supplierId: suppliers[0].id, status: 'active', description: '8-in-1 aluminum USB-C hub', unit: 'pcs' },
      { name: 'Mechanical Keyboard RGB', slug: 'mechanical-keyboard-rgb', sku: 'SKU-acc2', price: 7500, costPrice: 4500, stock: 45, categoryId: accessories.id, supplierId: suppliers[0].id, status: 'active', description: 'Tactile mechanical switch gaming keyboard', unit: 'pcs' },
      { name: 'Gaming Mouse Wireless', slug: 'gaming-mouse-wireless', sku: 'SKU-acc3', price: 4500, costPrice: 2800, stock: 65, categoryId: accessories.id, supplierId: suppliers[0].id, status: 'active', description: 'Ultra-lightweight wireless optical mouse', unit: 'pcs' },
      { name: 'Laptop Stand Ergonomic', slug: 'laptop-stand-ergonomic', sku: 'SKU-acc4', price: 2500, costPrice: 1200, stock: 90, categoryId: accessories.id, supplierId: suppliers[0].id, status: 'active', description: 'Adjustable aluminum riser stand', unit: 'pcs' },
      { name: 'Dual-Monitor Arm Mount', slug: 'dual-monitor-arm', sku: 'SKU-acc5', price: 8500, costPrice: 5000, stock: 25, categoryId: accessories.id, supplierId: suppliers[0].id, status: 'active', description: 'Heavy-duty gas spring monitor desk mount', unit: 'pcs' },

      { name: 'Premium Cotton Polo Shirt', slug: 'cotton-polo-shirt', sku: 'SKU-006', price: 1999, costPrice: 800, stock: 200, categoryId: menFashion.id, supplierId: suppliers[1].id, status: 'active', description: 'Comfortable cotton polo in multiple colors', unit: 'pcs' },
      { name: 'Slim Fit Jeans', slug: 'slim-fit-jeans', sku: 'SKU-007', price: 2499, costPrice: 1200, stock: 150, categoryId: menFashion.id, supplierId: suppliers[1].id, status: 'active', description: 'Stretchable slim fit denim jeans', unit: 'pcs' },
      { name: 'Leather Wallet', slug: 'leather-wallet', sku: 'SKU-010', price: 1499, costPrice: 600, stock: 120, categoryId: menFashion.id, supplierId: suppliers[1].id, status: 'active', description: 'Genuine leather bi-fold wallet', unit: 'pcs' },
      { name: 'Casual Linen Shirt', slug: 'casual-linen-shirt', sku: 'SKU-men4', price: 2200, costPrice: 1000, stock: 80, categoryId: menFashion.id, supplierId: suppliers[1].id, status: 'active', description: 'Breathable linen shirt for hot days', unit: 'pcs' },
      { name: 'Chino Pants Regular', slug: 'chino-pants-regular', sku: 'SKU-men5', price: 1800, costPrice: 900, stock: 100, categoryId: menFashion.id, supplierId: suppliers[1].id, status: 'active', description: 'Classic cotton chino pants', unit: 'pcs' },

      { name: 'Designer Saree Collection', slug: 'designer-saree', sku: 'SKU-008', price: 4999, costPrice: 2500, stock: 75, categoryId: womenFashion.id, supplierId: suppliers[1].id, status: 'active', featured: true, description: 'Handcrafted designer saree', unit: 'pcs' },
      { name: 'Kurti Set Premium', slug: 'kurti-set-premium', sku: 'SKU-009', price: 2999, costPrice: 1500, stock: 90, categoryId: womenFashion.id, supplierId: suppliers[1].id, status: 'active', description: 'Elegant kurti set with dupatta', unit: 'pcs' },
      { name: 'Cotton Salwar Kameez', slug: 'cotton-salwar-kameez', sku: 'SKU-women3', price: 3500, costPrice: 1800, stock: 60, categoryId: womenFashion.id, supplierId: suppliers[1].id, status: 'active', description: 'Comfortable casual cotton wear', unit: 'pcs' },
      { name: 'Georgette Party Gown', slug: 'georgette-party-gown', sku: 'SKU-women4', price: 6500, costPrice: 3800, stock: 30, categoryId: womenFashion.id, supplierId: suppliers[1].id, status: 'active', description: 'Flowy georgette floor-length gown', unit: 'pcs' },
      { name: 'Floral Summer Dress', slug: 'floral-summer-dress', sku: 'SKU-women5', price: 2400, costPrice: 1100, stock: 75, categoryId: womenFashion.id, supplierId: suppliers[1].id, status: 'active', description: 'Lightweight flowery print mini-dress', unit: 'pcs' },

      { name: 'Non-stick Cookware Set', slug: 'nonstick-cookware', sku: 'SKU-011', price: 3999, costPrice: 2200, stock: 40, categoryId: home.id, supplierId: suppliers[2].id, status: 'active', description: '7-piece non-stick cookware set', unit: 'set' },
      { name: 'Memory Foam Pillow', slug: 'memory-foam-pillow', sku: 'SKU-012', price: 1299, costPrice: 600, stock: 80, categoryId: home.id, supplierId: suppliers[2].id, status: 'active', description: 'Ergonomic memory foam pillow', unit: 'pcs' },
      { name: 'LED Desk Lamp', slug: 'led-desk-lamp', sku: 'SKU-013', price: 1799, costPrice: 900, stock: 60, categoryId: home.id, supplierId: suppliers[2].id, status: 'active', description: 'Adjustable LED desk lamp with USB port', unit: 'pcs' },
      { name: 'Cotton Bed Sheet Set', slug: 'cotton-bed-sheet', sku: 'SKU-022', price: 2499, costPrice: 1200, stock: 70, categoryId: home.id, supplierId: suppliers[2].id, status: 'active', description: 'King size 100% cotton bed sheet set', unit: 'set' },
      { name: 'Ultrasonic Humidifier', slug: 'ultrasonic-humidifier', sku: 'SKU-home5', price: 3200, costPrice: 1600, stock: 50, categoryId: home.id, supplierId: suppliers[2].id, status: 'active', description: 'Quiet cool-mist air humidifier for bedroom', unit: 'pcs' },

      { name: 'Electric Kettle 1.8L', slug: 'electric-kettle-18l', sku: 'SKU-kit1', price: 1800, costPrice: 900, stock: 150, categoryId: kitchen.id, supplierId: suppliers[2].id, status: 'active', description: 'Fast boiling auto-shutoff electric kettle', unit: 'pcs' },
      { name: 'Air Fryer 4.5L', slug: 'air-fryer-45l', sku: 'SKU-kit2', price: 8500, costPrice: 5000, stock: 35, categoryId: kitchen.id, supplierId: suppliers[2].id, status: 'active', description: 'Healthy oil-free touch-panel air fryer', unit: 'pcs' },
      { name: 'Blender & Smoothie Maker', slug: 'blender-smoothie', sku: 'SKU-kit3', price: 4200, costPrice: 2200, stock: 60, categoryId: kitchen.id, supplierId: suppliers[2].id, status: 'active', description: 'Multi-speed high-power blender jar', unit: 'pcs' },
      { name: 'Knife Block Set 6pcs', slug: 'knife-block-set', sku: 'SKU-kit4', price: 3800, costPrice: 2000, stock: 40, categoryId: kitchen.id, supplierId: suppliers[2].id, status: 'active', description: 'Premium stainless steel knives with wooden block', unit: 'set' },
      { name: 'Stainless Steel Trash Can', slug: 'ss-trash-can', sku: 'SKU-kit5', price: 2200, costPrice: 1100, stock: 80, categoryId: kitchen.id, supplierId: suppliers[2].id, status: 'active', description: 'Foot pedal soft-close kitchen dustbin', unit: 'pcs' },

      { name: 'Ergonomic Office Chair', slug: 'ergonomic-office-chair', sku: 'SKU-fur1', price: 12500, costPrice: 8000, stock: 20, categoryId: furniture.id, supplierId: suppliers[2].id, status: 'active', description: 'Mesh desk chair with adjustable lumbar support', unit: 'pcs' },
      { name: 'Solid Wood Study Desk', slug: 'solid-wood-study-desk', sku: 'SKU-fur2', price: 18000, costPrice: 11000, stock: 15, categoryId: furniture.id, supplierId: suppliers[2].id, status: 'active', description: 'Sturdy reading writing table with drawer storage', unit: 'pcs' },
      { name: 'Foldable Sofa Bed', slug: 'foldable-sofa-bed', sku: 'SKU-fur3', price: 25000, costPrice: 16000, stock: 8, categoryId: furniture.id, supplierId: suppliers[2].id, status: 'active', description: 'Multi-functional living room convertible sofa couch', unit: 'pcs' },
      { name: 'Modern Bookshelf', slug: 'modern-bookshelf', sku: 'SKU-fur4', price: 9500, costPrice: 5500, stock: 30, categoryId: furniture.id, supplierId: suppliers[2].id, status: 'active', description: '5-shelf display rack storage organizer', unit: 'pcs' },
      { name: 'Bedside Nightstand', slug: 'bedside-nightstand', sku: 'SKU-fur5', price: 4500, costPrice: 2500, stock: 50, categoryId: furniture.id, supplierId: suppliers[2].id, status: 'active', description: 'Mini wooden nightstand table with drawer', unit: 'pcs' },

      { name: 'Yoga Mat Premium', slug: 'yoga-mat-premium', sku: 'SKU-014', price: 1999, costPrice: 800, stock: 50, categoryId: sports.id, supplierId: suppliers[3].id, status: 'active', description: '6mm thick non-slip yoga mat', unit: 'pcs' },
      { name: 'Running Shoes Air Max', slug: 'running-shoes-air', sku: 'SKU-015', price: 5499, costPrice: 3200, stock: 45, categoryId: sports.id, supplierId: suppliers[3].id, status: 'active', featured: true, description: 'Lightweight running shoes with air cushion', unit: 'pair' },
      { name: 'Dumbbell Set 20kg', slug: 'dumbbell-set-20kg', sku: 'SKU-016', price: 3499, costPrice: 2000, stock: 30, categoryId: sports.id, supplierId: suppliers[3].id, status: 'active', description: 'Adjustable dumbbell set up to 20kg', unit: 'set' },
      { name: 'Badminton Racket Pair', slug: 'badminton-racket-pair', sku: 'SKU-spo4', price: 2500, costPrice: 1200, stock: 70, categoryId: sports.id, supplierId: suppliers[3].id, status: 'active', description: 'Carbon fiber lightweight rackets with cover', unit: 'set' },
      { name: 'Waterproof Camping Tent', slug: 'waterproof-camping-tent', sku: 'SKU-spo5', price: 6500, costPrice: 3500, stock: 20, categoryId: sports.id, supplierId: suppliers[3].id, status: 'active', description: '4-person outdoor dome camping tent', unit: 'pcs' },

      { name: 'Organic Honey 500g', slug: 'organic-honey', sku: 'SKU-017', price: 699, costPrice: 350, stock: 200, categoryId: grocery.id, supplierId: suppliers[4].id, status: 'active', description: 'Pure organic honey from Sundarbans', unit: 'bottle' },
      { name: 'Green Tea Box', slug: 'green-tea-box', sku: 'SKU-018', price: 399, costPrice: 180, stock: 300, categoryId: grocery.id, supplierId: suppliers[4].id, status: 'active', description: '25 bags premium green tea', unit: 'box' },
      { name: 'Basmati Rice 5kg', slug: 'basmati-rice-5kg', sku: 'SKU-019', price: 899, costPrice: 550, stock: 150, categoryId: grocery.id, supplierId: suppliers[4].id, status: 'active', description: 'Premium aged basmati rice', unit: 'pack' },
      { name: 'Extra Virgin Olive Oil 1L', slug: 'olive-oil-1l', sku: 'SKU-gro4', price: 1400, costPrice: 950, stock: 90, categoryId: grocery.id, supplierId: suppliers[4].id, status: 'active', description: 'Cold pressed extra virgin olive oil', unit: 'bottle' },
      { name: 'Premium Cashew Nuts 500g', slug: 'cashew-nuts-500g', sku: 'SKU-gro5', price: 850, costPrice: 500, stock: 120, categoryId: grocery.id, supplierId: suppliers[4].id, status: 'active', description: 'Roasted and salted crunchy cashews', unit: 'pack' }
    ]);

    // Courier Services
    const couriers = await CourierService.bulkCreate([
      { name: 'Pathao Courier', code: 'PATHAO', trackingUrl: 'https://pathao.com/track/', contactPhone: '09678100800', baseCost: 60, perKgCost: 15, estimatedDays: '2-3', status: 'active' },
      { name: 'Steadfast Courier', code: 'STEADFAST', trackingUrl: 'https://steadfast.com.bd/track/', contactPhone: '09678200200', baseCost: 70, perKgCost: 20, estimatedDays: '2-4', status: 'active' },
      { name: 'RedX', code: 'REDX', trackingUrl: 'https://redx.com.bd/track/', contactPhone: '09678300300', baseCost: 80, perKgCost: 18, estimatedDays: '1-3', status: 'active' },
      { name: 'Sundarban Courier', code: 'SUNDARBAN', trackingUrl: 'https://sundarban.com/track/', contactPhone: '09678400400', baseCost: 50, perKgCost: 12, estimatedDays: '3-5', status: 'active' },
      { name: 'SA Paribahan', code: 'SAP', trackingUrl: 'https://saparibahan.com/track/', contactPhone: '09678500500', baseCost: 55, perKgCost: 14, estimatedDays: '2-4', status: 'active' }
    ]);

    // Orders
    const orders = await Order.bulkCreate([
      { orderNumber: 'ORD-2026001', userId: users[3].id, status: 'delivered', paymentStatus: 'paid', paymentMethod: 'bKash', subtotal: 131998, shippingCost: 60, total: 132058, courierId: couriers[0].id, trackingNumber: 'PTH001234', shippingAddress: '12 Gulshan Ave, Dhaka', deliveredAt: new Date('2026-05-05') },
      { orderNumber: 'ORD-2026002', userId: users[4].id, status: 'shipped', paymentStatus: 'paid', paymentMethod: 'Nagad', subtotal: 4999, shippingCost: 70, total: 5069, courierId: couriers[1].id, trackingNumber: 'STD005678', shippingAddress: '45 Dhanmondi Rd, Dhaka', shippedAt: new Date('2026-05-10') },
      { orderNumber: 'ORD-2026003', userId: users[5].id, status: 'processing', paymentStatus: 'paid', paymentMethod: 'COD', subtotal: 8998, shippingCost: 80, total: 9078, courierId: couriers[2].id, shippingAddress: '78 Mirpur Rd, Dhaka' },
      { orderNumber: 'ORD-2026004', userId: users[6].id, status: 'pending', paymentStatus: 'unpaid', paymentMethod: 'COD', subtotal: 5499, shippingCost: 50, total: 5549, courierId: couriers[3].id, shippingAddress: '23 CDA Ave, Chittagong' },
      { orderNumber: 'ORD-2026005', userId: users[7].id, status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'bKash', subtotal: 12498, shippingCost: 55, total: 12553, courierId: couriers[4].id, shippingAddress: '56 Banani Rd, Dhaka' }
    ]);

    // Order Items
    await OrderItem.bulkCreate([
      { orderId: orders[0].id, productId: products[0].id, productName: 'iPhone 15 Pro', price: 129999, quantity: 1, total: 129999 },
      { orderId: orders[0].id, productId: products[5].id, productName: 'Premium Cotton Polo Shirt', price: 1999, quantity: 1, total: 1999 },
      { orderId: orders[1].id, productId: products[7].id, productName: 'Designer Saree Collection', price: 4999, quantity: 1, total: 4999 },
      { orderId: orders[2].id, productId: products[13].id, productName: 'Yoga Mat Premium', price: 1999, quantity: 1, total: 1999 },
      { orderId: orders[2].id, productId: products[4].id, productName: 'Wireless Earbuds Pro', price: 5999, quantity: 1, total: 5999 },
      { orderId: orders[2].id, productId: products[17].id, productName: 'Green Tea Box', price: 399, quantity: 2, total: 1000 },
      { orderId: orders[3].id, productId: products[14].id, productName: 'Running Shoes Air Max', price: 5499, quantity: 1, total: 5499 },
      { orderId: orders[4].id, productId: products[19].id, productName: 'Smart Watch Pro', price: 8999, quantity: 1, total: 8999 },
      { orderId: orders[4].id, productId: products[15].id, productName: 'Dumbbell Set 20kg', price: 3499, quantity: 1, total: 3499 }
    ]);

    // Transactions
    await Transaction.bulkCreate([
      { type: 'income', category: 'Sales', amount: 132058, description: 'Order ORD-2026001 payment', orderId: orders[0].id, date: '2026-05-01', status: 'completed' },
      { type: 'income', category: 'Sales', amount: 5069, description: 'Order ORD-2026002 payment', orderId: orders[1].id, date: '2026-05-03', status: 'completed' },
      { type: 'income', category: 'Sales', amount: 9078, description: 'Order ORD-2026003 payment', orderId: orders[2].id, date: '2026-05-05', status: 'completed' },
      { type: 'income', category: 'Sales', amount: 12553, description: 'Order ORD-2026005 payment', orderId: orders[4].id, date: '2026-05-08', status: 'completed' },
      { type: 'expense', category: 'Inventory', amount: 50000, description: 'Stock purchase - Electronics', date: '2026-05-01', status: 'completed' },
      { type: 'expense', category: 'Inventory', amount: 25000, description: 'Stock purchase - Fashion', date: '2026-05-02', status: 'completed' },
      { type: 'expense', category: 'Operations', amount: 15000, description: 'Monthly office rent', date: '2026-05-01', status: 'completed' },
      { type: 'expense', category: 'Marketing', amount: 8000, description: 'Facebook ads campaign', date: '2026-05-05', status: 'completed' },
      { type: 'expense', category: 'Logistics', amount: 3500, description: 'Courier charges - April', date: '2026-05-01', status: 'completed' },
      { type: 'income', category: 'Other', amount: 5000, description: 'Affiliate commission received', date: '2026-05-07', status: 'completed' }
    ]);

    // Promotions
    await Promotion.bulkCreate([
      { title: 'Summer Sale 2026', code: 'SUMMER20', type: 'percentage', value: 20, minOrderAmount: 2000, maxUses: 100, usedCount: 12, startDate: '2026-05-01', endDate: '2026-06-30', status: 'active', description: '20% off on orders over 2000 BDT' },
      { title: 'Free Shipping Week', code: 'FREESHIP', type: 'free_shipping', value: 0, minOrderAmount: 1000, maxUses: 500, usedCount: 45, startDate: '2026-05-10', endDate: '2026-05-17', status: 'active', description: 'Free shipping on orders over 1000 BDT' },
      { title: 'New User Discount', code: 'WELCOME500', type: 'fixed', value: 500, minOrderAmount: 3000, maxUses: 1000, usedCount: 89, startDate: '2026-01-01', endDate: '2026-12-31', status: 'active', description: '500 BDT off for new users' }
    ]);

    // Newsletter subscribers
    await Newsletter.bulkCreate([
      { email: 'subscriber1@email.com', name: 'Anika Rahman', status: 'subscribed' },
      { email: 'subscriber2@email.com', name: 'Tanvir Hossain', status: 'subscribed' },
      { email: 'subscriber3@email.com', name: 'Mitu Akter', status: 'subscribed' },
      { email: 'subscriber4@email.com', name: 'Shakib Al', status: 'subscribed' },
      { email: 'subscriber5@email.com', name: 'Riya Das', status: 'unsubscribed' }
    ]);

    // Campaigns
    await Campaign.bulkCreate([
      { title: 'Summer Collection Launch', subject: 'New Summer Collection is Here!', content: '<h1>Summer Collection 2026</h1><p>Check out our latest arrivals.</p>', status: 'sent', sentAt: '2026-05-01', recipientCount: 150 },
      { title: 'Eid Special Offers', subject: 'Exclusive Eid Discounts Inside!', content: '<h1>Eid Mubarak!</h1><p>Special discounts up to 50% off.</p>', status: 'draft', recipientCount: 0 }
    ]);

    console.log('Seed completed successfully!');
    console.log('Admin login: admin@sumon.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
