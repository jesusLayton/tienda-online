require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const bcrypt = require('bcryptjs');
const { sequelize, User, Category, Product, Order, OrderItem } = require('../src/models');

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const categoriesData = [
  {
    name: 'Electrónica',
    description: 'Smartphones, laptops, tablets, auriculares y más dispositivos electrónicos',
    image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
  },
  {
    name: 'Ropa',
    description: 'Moda para hombre, mujer y niños. Ropa casual, deportiva y formal',
    image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
  },
  {
    name: 'Hogar',
    description: 'Muebles, decoración, utensilios de cocina y todo para tu hogar',
    image_url: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400',
  },
  {
    name: 'Deportes',
    description: 'Equipamiento deportivo, ropa técnica y accesorios para fitness y aventura',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  },
  {
    name: 'Libros',
    description: 'Literatura, ciencia ficción, técnicos, infantiles y todo tipo de lectura',
    image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
  },
];

const getProductsData = (categories) => {
  const catMap = {};
  categories.forEach((c) => { catMap[c.name] = c.id; });

  return [
    // Electrónica (4 products)
    {
      name: 'Smartphone Samsung Galaxy A54',
      description: 'Teléfono inteligente con pantalla AMOLED de 6.4 pulgadas, cámara triple de 50MP y batería de 5000mAh. Perfecto para el uso diario.',
      price: 449.99,
      stock: 35,
      image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',
      category_id: catMap['Electrónica'],
      is_active: true,
    },
    {
      name: 'Laptop HP Pavilion 15',
      description: 'Portátil con procesador Intel Core i5 de 12ª generación, 16GB RAM, SSD de 512GB y pantalla Full HD de 15.6 pulgadas.',
      price: 749.99,
      stock: 20,
      image_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
      category_id: catMap['Electrónica'],
      is_active: true,
    },
    {
      name: 'Auriculares Sony WH-1000XM5',
      description: 'Auriculares inalámbricos con cancelación de ruido líder en la industria, hasta 30 horas de batería y sonido de alta resolución.',
      price: 299.99,
      stock: 50,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      category_id: catMap['Electrónica'],
      is_active: true,
    },
    {
      name: 'Tablet iPad 10ª Generación',
      description: 'iPad con chip A14 Bionic, pantalla Liquid Retina de 10.9 pulgadas, compatible con Apple Pencil y Magic Keyboard.',
      price: 549.99,
      stock: 25,
      image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
      category_id: catMap['Electrónica'],
      is_active: true,
    },
    // Ropa (4 products)
    {
      name: 'Camiseta Básica Algodón Orgánico',
      description: 'Camiseta de manga corta confeccionada en algodón 100% orgánico. Disponible en múltiples colores. Corte regular y cómodo.',
      price: 24.99,
      stock: 150,
      image_url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400',
      category_id: catMap['Ropa'],
      is_active: true,
    },
    {
      name: 'Jeans Slim Fit Azul Oscuro',
      description: 'Pantalón vaquero de corte slim fit en denim stretch. Cómodo, duradero y perfecto para cualquier ocasión casual.',
      price: 59.99,
      stock: 80,
      image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      category_id: catMap['Ropa'],
      is_active: true,
    },
    {
      name: 'Vestido Floral de Verano',
      description: 'Vestido midi con estampado floral, tirantes ajustables y cintura elástica. Perfecto para días cálidos y ocasiones casuales.',
      price: 44.99,
      stock: 60,
      image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
      category_id: catMap['Ropa'],
      is_active: true,
    },
    {
      name: 'Chaqueta Impermeable Outdoor',
      description: 'Chaqueta técnica impermeable con membrana Gore-Tex, sellado de costuras y capucha ajustable. Ideal para senderismo y actividades al aire libre.',
      price: 129.99,
      stock: 40,
      image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
      category_id: catMap['Ropa'],
      is_active: true,
    },
    // Hogar (4 products)
    {
      name: 'Juego de Sábanas Microfibra 200 Hilos',
      description: 'Set completo de sábanas en microfibra suave al tacto. Incluye funda nórdica, sábana bajera y 2 fundas de almohada. Disponible en varias tallas.',
      price: 39.99,
      stock: 100,
      image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
      category_id: catMap['Hogar'],
      is_active: true,
    },
    {
      name: 'Sartén Antiadherente Cerámica 28cm',
      description: 'Sartén de cerámica libre de PFOA con mango ergonómico de silicona. Apta para todo tipo de cocinas incluyendo inducción.',
      price: 34.99,
      stock: 70,
      image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      category_id: catMap['Hogar'],
      is_active: true,
    },
    {
      name: 'Lámpara de Mesa LED Regulable',
      description: 'Lámpara de escritorio LED con 5 niveles de brillo y 3 temperaturas de color. Puerto USB de carga integrado y base antideslizante.',
      price: 49.99,
      stock: 45,
      image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400',
      category_id: catMap['Hogar'],
      is_active: true,
    },
    {
      name: 'Organizador de Escritorio Bambú',
      description: 'Organizador de escritorio fabricado en bambú sostenible con 6 compartimentos para bolígrafos, notas y accesorios de oficina.',
      price: 27.99,
      stock: 90,
      image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      category_id: catMap['Hogar'],
      is_active: true,
    },
    // Deportes (4 products)
    {
      name: 'Zapatillas Running Nike Air Pegasus',
      description: 'Zapatillas de running con amortiguación Air y suela de goma duradera. Diseñadas para largas distancias con comodidad y estabilidad.',
      price: 109.99,
      stock: 55,
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      category_id: catMap['Deportes'],
      is_active: true,
    },
    {
      name: 'Esterilla de Yoga Premium 6mm',
      description: 'Mat de yoga de 6mm de grosor en material ecológico TPE. Superficie antideslizante en ambos lados, incluye correa de transporte.',
      price: 42.99,
      stock: 85,
      image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
      category_id: catMap['Deportes'],
      is_active: true,
    },
    {
      name: 'Mancuernas Ajustables 2-20kg',
      description: 'Par de mancuernas ajustables de 2 a 20kg con sistema de ajuste rápido por selector. Reemplaza 10 pares de pesas individuales.',
      price: 189.99,
      stock: 30,
      image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
      category_id: catMap['Deportes'],
      is_active: true,
    },
    {
      name: 'Botella Térmica Acero 750ml',
      description: 'Botella de acero inoxidable con doble pared al vacío. Mantiene bebidas frías 24h y calientes 12h. Libre de BPA, tapa de rosca hermética.',
      price: 29.99,
      stock: 120,
      image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
      category_id: catMap['Deportes'],
      is_active: true,
    },
    // Libros (4 products)
    {
      name: 'El Quijote — Miguel de Cervantes',
      description: 'Edición completa de la obra maestra de la literatura española. Incluye notas al pie, glosario y prólogo del editor. Tapa blanda.',
      price: 18.99,
      stock: 200,
      image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      category_id: catMap['Libros'],
      is_active: true,
    },
    {
      name: 'Cien Años de Soledad — Gabriel García Márquez',
      description: 'La novela cumbre del realismo mágico latinoamericano. Premio Nobel de Literatura. Edición conmemorativa con fotografías y cronología del autor.',
      price: 22.99,
      stock: 180,
      image_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
      category_id: catMap['Libros'],
      is_active: true,
    },
    {
      name: 'Aprende Python en 30 Días',
      description: 'Guía práctica para principiantes que cubre desde los fundamentos hasta proyectos reales con Python. Incluye ejercicios, soluciones y acceso a recursos online.',
      price: 34.99,
      stock: 75,
      image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400',
      category_id: catMap['Libros'],
      is_active: true,
    },
    {
      name: 'Hábitos Atómicos — James Clear',
      description: 'El bestseller internacional sobre cómo los pequeños cambios generan resultados extraordinarios. Traducido al español con ejemplos y estudios actualizados.',
      price: 19.99,
      stock: 250,
      image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400',
      category_id: catMap['Libros'],
      is_active: true,
    },
  ];
};

const usersData = [
  {
    email: 'admin@tienda.com',
    password: 'Admin1234',
    name: 'Administrador Principal',
    role: 'admin',
  },
  {
    email: 'maria.garcia@ejemplo.com',
    password: 'Usuario1234',
    name: 'María García López',
    role: 'user',
  },
  {
    email: 'carlos.rodriguez@ejemplo.com',
    password: 'Usuario1234',
    name: 'Carlos Rodríguez Martínez',
    role: 'user',
  },
];

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos.');

    // Clear existing data in correct order
    console.log('🗑️  Limpiando datos existentes...');
    await OrderItem.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true }).catch(() =>
      OrderItem.destroy({ where: {} })
    );
    await Order.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true }).catch(() =>
      Order.destroy({ where: {} })
    );
    await Product.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true }).catch(() =>
      Product.destroy({ where: {} })
    );
    await Category.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true }).catch(() =>
      Category.destroy({ where: {} })
    );
    await User.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true }).catch(() =>
      User.destroy({ where: {} })
    );

    // Seed users
    console.log('👤 Creando usuarios...');
    const createdUsers = [];
    for (const userData of usersData) {
      const user = await User.create({
        email: userData.email,
        password_hash: userData.password, // Hook will hash it
        name: userData.name,
        role: userData.role,
      });
      createdUsers.push(user);
      console.log(`   ✓ ${userData.role === 'admin' ? 'Admin' : 'Usuario'}: ${userData.email}`);
    }

    // Seed categories
    console.log('📂 Creando categorías...');
    const createdCategories = [];
    for (const catData of categoriesData) {
      const cat = await Category.create({
        name: catData.name,
        slug: slugify(catData.name),
        description: catData.description,
        image_url: catData.image_url,
      });
      createdCategories.push(cat);
      console.log(`   ✓ Categoría: ${cat.name}`);
    }

    // Seed products
    console.log('📦 Creando productos...');
    const productsData = getProductsData(createdCategories);
    const createdProducts = [];
    for (const prodData of productsData) {
      const prod = await Product.create({
        ...prodData,
        slug: slugify(prodData.name),
      });
      createdProducts.push(prod);
      console.log(`   ✓ Producto: ${prod.name}`);
    }

    // Seed sample orders
    console.log('🛒 Creando pedidos de ejemplo...');
    const regularUsers = createdUsers.filter((u) => u.role === 'user');

    const sampleOrders = [
      {
        user: regularUsers[0],
        status: 'delivered',
        items: [
          { product: createdProducts[0], quantity: 1 }, // Smartphone
          { product: createdProducts[2], quantity: 1 }, // Auriculares
        ],
        shipping_address: {
          street: 'Calle Mayor 15, 2ºA',
          city: 'Madrid',
          state: 'Madrid',
          zip_code: '28001',
          country: 'España',
        },
      },
      {
        user: regularUsers[0],
        status: 'processing',
        items: [
          { product: createdProducts[16], quantity: 2 }, // El Quijote
          { product: createdProducts[19], quantity: 1 }, // Hábitos Atómicos
        ],
        shipping_address: {
          street: 'Avenida Diagonal 100, 5ºB',
          city: 'Barcelona',
          state: 'Cataluña',
          zip_code: '08001',
          country: 'España',
        },
      },
      {
        user: regularUsers[1],
        status: 'pending',
        items: [
          { product: createdProducts[12], quantity: 1 }, // Zapatillas
          { product: createdProducts[14], quantity: 1 }, // Mancuernas
          { product: createdProducts[15], quantity: 2 }, // Botella térmica
        ],
        shipping_address: {
          street: 'Gran Vía 50, 1ºA',
          city: 'Bilbao',
          state: 'País Vasco',
          zip_code: '48001',
          country: 'España',
        },
      },
    ];

    for (const orderData of sampleOrders) {
      let total = 0;
      const orderItemsToCreate = [];

      for (const item of orderData.items) {
        const subtotal = parseFloat(item.product.price) * item.quantity;
        total += subtotal;
        orderItemsToCreate.push({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price,
        });
      }

      const order = await Order.create({
        user_id: orderData.user.id,
        status: orderData.status,
        total: total.toFixed(2),
        shipping_address: orderData.shipping_address,
      });

      await OrderItem.bulkCreate(
        orderItemsToCreate.map((i) => ({ ...i, order_id: order.id }))
      );

      console.log(
        `   ✓ Pedido #${order.id} para ${orderData.user.name} (${orderData.status}) - €${total.toFixed(2)}`
      );
    }

    console.log('\n🎉 Seed completado exitosamente!\n');
    console.log('📋 Credenciales de acceso:');
    console.log('   Admin:   admin@tienda.com     / Admin1234');
    console.log('   Usuario: maria.garcia@ejemplo.com / Usuario1234');
    console.log('   Usuario: carlos.rodriguez@ejemplo.com / Usuario1234');
    console.log(`\n   Total productos: ${createdProducts.length}`);
    console.log(`   Total categorías: ${createdCategories.length}`);
    console.log(`   Total usuarios: ${createdUsers.length}`);
  } catch (error) {
    console.error('❌ Error durante el seed:', error.message);
    if (error.errors) {
      error.errors.forEach((e) => console.error(' -', e.message));
    }
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

run();
