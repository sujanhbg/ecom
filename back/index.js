require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const { sequelize } = require('./models');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/users', require('./routes/users'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/permissions', require('./routes/permissions'));
app.use('/api/marketing', require('./routes/marketing'));
app.use('/api/storefront', require('./routes/storefront'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/faqs', require('./routes/faqs'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/menus', require('./routes/menus'));

app.get('/', (req, res) => res.json({ message: 'Sumon E-Commerce API' }));

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: true }).then(async () => {
  // Ensure default pages exist
  try {
    const { Page } = require('./models');
    await Page.findOrCreate({
      where: { key: 'about' },
      defaults: {
        title: 'About Us',
        content: `<h3>Our Story</h3><p>We are a leading provider of premium wholesale packaging and B2B products across Bangladesh. Founded with a commitment to quality, we support retailers and businesses of all sizes with top-notch products and excellent customer service.</p><h3>Why Choose Us?</h3><ul><li>Fast and secure delivery nationwide</li><li>Best pricing for bulk orders</li><li>Dedicated support team</li></ul>`
      }
    });
    await Page.findOrCreate({
      where: { key: 'contact' },
      defaults: {
        title: 'Contact Us',
        content: `<p>Have questions about bulk ordering, customizing items, or shipping? Feel free to reach out to us! Our support team is here to help.</p><p><strong>Address:</strong> 363/1 Elephant Road, Dhaka-1205. Near Eastern Mollika Shopping Complex</p><p><strong>Phone:</strong> +88-01567865139</p><p><strong>Email:</strong> support@demostore.com</p>`
      }
    });
    await Page.findOrCreate({
      where: { key: 'delivery_rules' },
      defaults: {
        title: 'Delivery Rules',
        content: `<h3>Shipping Rates</h3><ul><li>Inside Dhaka City: 70 BDT</li><li>Outside Dhaka City (Suburbs & Districts): 130 BDT</li></ul><h3>Delivery Timeframes</h3><p>Orders are typically processed within 24 hours. Delivery inside Dhaka takes 2-3 business days. Delivery outside Dhaka takes 3-5 business days.</p><h3>Cash on Delivery</h3><p>We provide Cash on Delivery (COD) services all over Bangladesh. You can check the package condition before completing the payment.</p>`
      }
    });
    console.log('Seeded default pages successfully');

    // Seed default settings
    const { Setting, Menu } = require('./models');
    await Setting.findOrCreate({
      where: { key: 'siteTitle' },
      defaults: { value: 'Demo Store — Shop Online B2B Wholesale' }
    });
    await Setting.findOrCreate({
      where: { key: 'metaDescription' },
      defaults: { value: 'Your Trusted Wholesale and B2B Business Partner. Providing the best packaging and retail products across Bangladesh.' }
    });
    await Setting.findOrCreate({
      where: { key: 'metaKeywords' },
      defaults: { value: 'B2B, wholesale, packaging, e-commerce, boxes, tissue bags, weight machine, Bangladesh' }
    });

    // Seed default menus
    const defaultMenus = [
      { name: 'Home', url: '/', type: 'top', sortOrder: 1 },
      { name: 'All Products', url: '/products', type: 'top', sortOrder: 2 },
      { name: 'About us', url: '/about', type: 'top', sortOrder: 3 },
      { name: 'Contact us', url: '/contact', type: 'top', sortOrder: 4 },
      { name: 'Delivery Rules', url: '/delivery_rules', type: 'top', sortOrder: 5 },
      { name: 'FAQs', url: '/faqs', type: 'top', sortOrder: 6 },
      
      { name: 'About Us', url: '/about', type: 'footer', sortOrder: 1 },
      { name: 'Delivery Rules', url: '/delivery_rules', type: 'footer', sortOrder: 2 },
      { name: 'FAQs', url: '/faqs', type: 'footer', sortOrder: 3 },
      { name: 'Contact Us', url: '/contact', type: 'footer', sortOrder: 4 }
    ];

    const menuCount = await Menu.count();
    if (menuCount === 0) {
      await Menu.bulkCreate(defaultMenus);
      console.log('Seeded default menu links successfully');
    }
  } catch (err) {
    console.error('Failed to seed default database:', err);
  }

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error('DB Error:', err));
