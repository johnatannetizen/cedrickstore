/* =========================================================================
   CedrickStore — Datos semilla (totalmente editables)
   Estos datos se cargan en localStorage la primera vez. Desde el Panel
   Administrativo puedes crear / editar / eliminar productos, categorías, etc.
   Para reiniciar a estos valores: Admin → Ajustes → "Restablecer datos".
   ========================================================================= */
window.CEDRICK_SEED = (function () {

  /* ---- Categorías (icon = clave de ícono en core.js ICONS) ---- */
  const categories = [
    { id: 'tecnologia', name: 'Tecnología',  icon: 'chip',    color: '#2f7de1' },
    { id: 'relojes',    name: 'Relojes',     icon: 'watch',   color: '#c9a227' },
    { id: 'audio',      name: 'Audio',       icon: 'headset', color: '#9b59f6' },
    { id: 'moda',       name: 'Moda',        icon: 'shirt',   color: '#e23d44' },
    { id: 'hogar',      name: 'Hogar',       icon: 'home',    color: '#18a558' },
    { id: 'belleza',    name: 'Belleza',     icon: 'sparkle', color: '#e0529b' }
  ];

  /* ---- Marcas asociadas ---- */
  const brands = [
    { id: 'auralux',   name: 'AuraLux' },
    { id: 'nordico',   name: 'Nórdico' },
    { id: 'zentech',   name: 'ZenTech' },
    { id: 'velora',    name: 'Velora' },
    { id: 'monarch',   name: 'Monarch' },
    { id: 'pulse',     name: 'Pulse' },
    { id: 'eterna',    name: 'Eterna' },
    { id: 'lumiere',   name: 'Lumière' }
  ];

  /* ---- Cupones ---- */
  const coupons = [
    { code: 'CEDRICK10', type: 'percent', value: 10, label: '10% de descuento' },
    { code: 'PREMIUM20', type: 'percent', value: 20, label: '20% de descuento' },
    { code: 'ENVIOGRATIS', type: 'shipping', value: 0, label: 'Envío gratis' },
    { code: 'BIENVENIDO', type: 'fixed', value: 30000, label: '$30.000 de descuento' }
  ];

  /* ---- Banners / slides del home ---- */
  const banners = [
    {
      id: 'b1', eyebrow: 'Colección Signature 2026',
      title: 'Elegancia que <span>define</span> tu estilo',
      text: 'Descubre piezas premium seleccionadas a mano. Calidad excepcional, diseño atemporal y envío express a todo el país.',
      cta: 'Explorar colección', link: 'catalog.html', badge: '-40%',
      tone: 'gold', icon: 'sparkle'
    },
    {
      id: 'b2', eyebrow: 'Tecnología de vanguardia',
      title: 'Innovación en la <span>palma</span> de tu mano',
      text: 'Los gadgets más deseados del año con garantía oficial y los mejores precios. Vive la experiencia CedrickStore.',
      cta: 'Ver tecnología', link: 'catalog.html?cat=tecnologia', badge: 'NEW',
      tone: 'blue', icon: 'chip'
    },
    {
      id: 'b3', eyebrow: 'Tiempo de lujo',
      title: 'Relojes que <span>marcan</span> la diferencia',
      text: 'Acero, cuero y precisión suiza. Una selección exclusiva para quienes valoran cada segundo.',
      cta: 'Descubrir relojes', link: 'catalog.html?cat=relojes', badge: 'TOP',
      tone: 'dark', icon: 'watch'
    }
  ];

  /* ---- Testimonios ---- */
  const testimonials = [
    { name: 'Laura Martínez', role: 'Cliente verificada', rating: 5, text: 'Compré un reloj y llegó en 24 horas, impecable. El empaque es de lujo y el pedido por WhatsApp fue facilísimo. ¡Volveré a comprar!' },
    { name: 'Andrés Gómez', role: 'Cliente frecuente', rating: 5, text: 'La calidad de los productos superó mis expectativas. La atención al cliente es excelente y los precios muy competitivos.' },
    { name: 'Valentina Ríos', role: 'Cliente verificada', rating: 4, text: 'Me encanta el modo oscuro de la tienda y lo fácil que es navegar desde el celular. Encontré justo lo que buscaba.' },
    { name: 'Sebastián Cruz', role: 'Cliente nuevo', rating: 5, text: 'Pedí unos audífonos premium y el sonido es brutal. El descuento con cupón fue un plus. Recomendado 100%.' }
  ];

  /* ---- Reseñas reutilizables ---- */
  const R = (user, rating, text, days) => ({ user, rating, text, date: days });

  /* ---- Productos premium ---- */
  const products = [
    {
      id: 'p01', name: 'Auriculares Inalámbricos AuraLux Pro ANC', category: 'audio', brand: 'auralux',
      price: 489900, oldPrice: 729900, stock: 18, rating: 4.8, sold: 342, featured: true, isNew: true, bestseller: true,
      tone: '#9b59f6', desc: 'Auriculares premium con cancelación activa de ruido híbrida, 40 horas de batería y audio Hi-Res certificado. Diseño ergonómico en aluminio anodizado y carga rápida USB-C.',
      gallery: 4,
      specs: { 'Conectividad': 'Bluetooth 5.3', 'Batería': '40h (ANC on)', 'Carga': 'USB-C rápida', 'Driver': '40mm Hi-Res', 'Peso': '248 g', 'Garantía': '12 meses' },
      reviews: [ R('Carlos V.', 5, 'El mejor sonido que he escuchado en este rango de precio. La cancelación de ruido es espectacular.', '2 días'), R('María P.', 5, 'Comodísimos para usar todo el día. La batería dura una eternidad.', '1 semana'), R('Julián R.', 4, 'Excelentes, aunque el estuche podría ser más compacto.', '3 semanas') ]
    },
    {
      id: 'p02', name: 'Smartwatch ZenTech Vision 5 AMOLED', category: 'tecnologia', brand: 'zentech',
      price: 639900, oldPrice: 899900, stock: 12, rating: 4.7, sold: 287, featured: true, isNew: true, bestseller: true,
      tone: '#2f7de1', desc: 'Reloj inteligente con pantalla AMOLED de 1.85", GPS dual, monitoreo de SpO2, ECG y más de 120 modos deportivos. Resistencia al agua 5ATM y batería de 14 días.',
      gallery: 4,
      specs: { 'Pantalla': '1.85" AMOLED', 'Batería': '14 días', 'GPS': 'Dual banda', 'Resistencia': '5ATM', 'Sensores': 'SpO2 · ECG · HR', 'Garantía': '12 meses' },
      reviews: [ R('Daniel A.', 5, 'Increíble relación calidad-precio. La pantalla se ve hermosa al sol.', '4 días'), R('Sofía L.', 4, 'Muy completo, el GPS es preciso. Me hubiera gustado más correas incluidas.', '2 semanas') ]
    },
    {
      id: 'p03', name: 'Reloj Automático Monarch Heritage Acero', category: 'relojes', brand: 'monarch',
      price: 1290000, oldPrice: 1690000, stock: 6, rating: 4.9, sold: 154, featured: true, bestseller: true,
      tone: '#c9a227', desc: 'Reloj automático de movimiento mecánico con cristal de zafiro antirreflejo, caja de acero inoxidable 316L y brazalete tipo oyster. Reserva de marcha de 42 horas. Una pieza de colección.',
      gallery: 5,
      specs: { 'Movimiento': 'Automático mecánico', 'Cristal': 'Zafiro AR', 'Caja': 'Acero 316L · 41mm', 'Reserva': '42 horas', 'Resistencia': '10ATM', 'Garantía': '24 meses' },
      reviews: [ R('Ricardo M.', 5, 'Una joya. Se siente de mucha mayor gama que su precio. El peso y acabado son premium.', '1 semana'), R('Felipe T.', 5, 'Recibí muchos cumplidos. El zafiro no se raya y el automático funciona perfecto.', '1 mes') ]
    },
    {
      id: 'p04', name: 'Gafas de Sol Polarizadas Velora Aviator', category: 'moda', brand: 'velora',
      price: 219900, oldPrice: 319900, stock: 25, rating: 4.6, sold: 412, featured: false, bestseller: true,
      tone: '#e23d44', desc: 'Gafas estilo aviador con lentes polarizados UV400, montura de titanio ultraligera y estuche de cuero. Protección total contra rayos UVA/UVB con un diseño icónico y atemporal.',
      gallery: 3,
      specs: { 'Lentes': 'Polarizados UV400', 'Montura': 'Titanio', 'Protección': 'UVA/UVB 100%', 'Incluye': 'Estuche de cuero', 'Garantía': '6 meses' },
      reviews: [ R('Natalia C.', 5, 'Súper livianas y elegantes. La polarización es real, ya no me molesta el sol al conducir.', '5 días') ]
    },
    {
      id: 'p05', name: 'Altavoz Bluetooth Pulse Boom 360°', category: 'audio', brand: 'pulse',
      price: 329900, oldPrice: 449900, stock: 30, rating: 4.5, sold: 256, isNew: true,
      tone: '#9b59f6', desc: 'Altavoz portátil con sonido envolvente de 360°, 30W de potencia, resistencia IPX7 y 24 horas de reproducción. Empareja dos altavoces para sonido estéreo verdadero.',
      gallery: 3,
      specs: { 'Potencia': '30W RMS', 'Batería': '24 horas', 'Resistencia': 'IPX7', 'Conexión': 'Bluetooth 5.2', 'Garantía': '12 meses' },
      reviews: [ R('Esteban G.', 4, 'Suena muy fuerte para su tamaño. Lo llevo a la piscina sin problema.', '1 semana') ]
    },
    {
      id: 'p06', name: 'Cámara de Acción ZenTech GoMax 4K', category: 'tecnologia', brand: 'zentech',
      price: 749900, oldPrice: 999900, stock: 9, rating: 4.7, sold: 178, featured: true,
      tone: '#2f7de1', desc: 'Cámara de acción con grabación 4K60fps, estabilización electrónica de 6 ejes, sumergible hasta 10m sin carcasa y pantalla táctil frontal y trasera.',
      gallery: 4,
      specs: { 'Video': '4K @ 60fps', 'Estabilización': 'EIS 6 ejes', 'Sumergible': '10m', 'Pantallas': 'Doble táctil', 'Garantía': '12 meses' },
      reviews: [ R('Mariana V.', 5, 'La estabilización es de otro nivel. Graba videos cinematográficos.', '2 semanas') ]
    },
    {
      id: 'p07', name: 'Perfume Eterna Noir Eau de Parfum 100ml', category: 'belleza', brand: 'eterna',
      price: 289900, oldPrice: 389900, stock: 22, rating: 4.8, sold: 521, featured: true, bestseller: true,
      tone: '#e0529b', desc: 'Fragancia amaderada oriental con notas de bergamota, ámbar y sándalo. Larga duración de hasta 12 horas. Frasco de cristal tallado y empaque de lujo.',
      gallery: 3,
      specs: { 'Familia olfativa': 'Amaderada oriental', 'Volumen': '100 ml', 'Duración': 'Hasta 12h', 'Género': 'Unisex', 'Garantía': 'Producto sellado' },
      reviews: [ R('Camila S.', 5, 'El aroma es adictivo y dura todo el día. Recibo cumplidos constantemente.', '3 días'), R('Andrea M.', 5, 'Empaque de lujo, perfecto para regalo.', '2 semanas') ]
    },
    {
      id: 'p08', name: 'Mochila Antirrobo Nórdico Urban Tech', category: 'moda', brand: 'nordico',
      price: 199900, oldPrice: 279900, stock: 40, rating: 4.6, sold: 389, bestseller: true,
      tone: '#e23d44', desc: 'Mochila impermeable con compartimento acolchado para laptop de 15.6", puerto USB de carga, cierres ocultos antirrobo y diseño ergonómico transpirable.',
      gallery: 3,
      specs: { 'Capacidad': '22 L', 'Laptop': 'Hasta 15.6"', 'Material': 'Poliéster impermeable', 'Extras': 'Puerto USB', 'Garantía': '12 meses' },
      reviews: [ R('Juan D.', 5, 'Perfecta para viajar y para la oficina. Muy resistente.', '1 semana') ]
    },
    {
      id: 'p09', name: 'Lámpara Inteligente Lumière Halo RGB', category: 'hogar', brand: 'lumiere',
      price: 159900, oldPrice: 219900, stock: 35, rating: 4.4, sold: 203, isNew: true,
      tone: '#18a558', desc: 'Lámpara de mesa con 16 millones de colores, control por app y voz, modos de ambiente y temporizador. Diseño minimalista que ilumina y decora cualquier espacio.',
      gallery: 3,
      specs: { 'Colores': '16M RGB', 'Control': 'App · Voz', 'Conexión': 'WiFi 2.4GHz', 'Potencia': '9W LED', 'Garantía': '12 meses' },
      reviews: [ R('Paula R.', 4, 'Crea un ambiente increíble en mi cuarto. Fácil de configurar.', '5 días') ]
    },
    {
      id: 'p10', name: 'Teclado Mecánico ZenTech Aura RGB', category: 'tecnologia', brand: 'zentech',
      price: 269900, oldPrice: 359900, stock: 16, rating: 4.7, sold: 167,
      tone: '#2f7de1', desc: 'Teclado mecánico inalámbrico con switches hot-swap, retroiluminación RGB por tecla, estructura de aluminio y conectividad triple modo (BT/2.4G/USB-C).',
      gallery: 3,
      specs: { 'Switches': 'Hot-swap rojos', 'Iluminación': 'RGB per-key', 'Conexión': 'BT · 2.4G · USB-C', 'Layout': '75% en español', 'Garantía': '12 meses' },
      reviews: [ R('Óscar L.', 5, 'El sonido y feel de las teclas es premium. Se conecta a 3 equipos.', '1 semana') ]
    },
    {
      id: 'p11', name: 'Set de Cuidado Facial Eterna Glow', category: 'belleza', brand: 'eterna',
      price: 179900, oldPrice: 249900, stock: 28, rating: 4.6, sold: 298, isNew: true,
      tone: '#e0529b', desc: 'Rutina completa de 4 pasos con ácido hialurónico, vitamina C y niacinamida. Limpiador, sérum, hidratante y protector solar. Ingredientes veganos y cruelty-free.',
      gallery: 3,
      specs: { 'Pasos': '4 productos', 'Activos': 'Hialurónico · Vit C', 'Tipo de piel': 'Todo tipo', 'Vegano': 'Sí · Cruelty-free', 'Garantía': 'Producto sellado' },
      reviews: [ R('Daniela F.', 5, 'Mi piel cambió en dos semanas. Los productos rinden muchísimo.', '2 semanas') ]
    },
    {
      id: 'p12', name: 'Reloj Deportivo Pulse Active GPS', category: 'relojes', brand: 'pulse',
      price: 379900, oldPrice: 499900, stock: 14, rating: 4.5, sold: 221,
      tone: '#c9a227', desc: 'Reloj deportivo con GPS integrado, pulsómetro óptico, resistencia 5ATM y batería de 20 días. Ideal para running, ciclismo y natación.',
      gallery: 3,
      specs: { 'GPS': 'Integrado', 'Batería': '20 días', 'Resistencia': '5ATM', 'Modos': '90+ deportes', 'Garantía': '12 meses' },
      reviews: [ R('Tomás B.', 4, 'Perfecto para entrenar. El GPS engancha rápido.', '6 días') ]
    },
    {
      id: 'p13', name: 'Cafetera Espresso Nórdico Barista X', category: 'hogar', brand: 'nordico',
      price: 859900, oldPrice: 1190000, stock: 7, rating: 4.8, sold: 134, featured: true,
      tone: '#18a558', desc: 'Cafetera espresso semiautomática con bomba de 20 bares, vaporizador de leche profesional y molinillo integrado. Prepara café de calidad de cafetería en casa.',
      gallery: 4,
      specs: { 'Presión': '20 bares', 'Molinillo': 'Integrado', 'Vaporizador': 'Profesional', 'Depósito': '1.8 L', 'Garantía': '24 meses' },
      reviews: [ R('Lucía H.', 5, 'Hago un espresso espectacular. La espuma de leche queda perfecta.', '1 semana') ]
    },
    {
      id: 'p14', name: 'Zapatillas Urbanas Velora Cloud Run', category: 'moda', brand: 'velora',
      price: 249900, oldPrice: 339900, stock: 33, rating: 4.5, sold: 367, bestseller: true,
      tone: '#e23d44', desc: 'Zapatillas con suela de espuma de retorno energético, malla transpirable y diseño versátil para el día a día. Comodidad de nube en cada paso.',
      gallery: 3,
      specs: { 'Suela': 'Espuma energética', 'Upper': 'Malla transpirable', 'Peso': '260 g', 'Uso': 'Urbano · Casual', 'Garantía': '6 meses' },
      reviews: [ R('Mateo R.', 5, 'Comodísimas, las uso todo el día sin cansancio. Buena pinta.', '4 días') ]
    },
    {
      id: 'p15', name: 'Tablet ZenTech Pad 11 Pro 256GB', category: 'tecnologia', brand: 'zentech',
      price: 1149900, oldPrice: 1499900, stock: 8, rating: 4.7, sold: 96, featured: true, isNew: true,
      tone: '#2f7de1', desc: 'Tablet con pantalla 2.5K de 11", procesador octa-core, 8GB RAM, 256GB almacenamiento y soporte para lápiz óptico. Perfecta para trabajo y entretenimiento.',
      gallery: 4,
      specs: { 'Pantalla': '11" 2.5K 120Hz', 'RAM': '8 GB', 'Almacenamiento': '256 GB', 'Batería': '8000 mAh', 'Garantía': '12 meses' },
      reviews: [ R('Verónica P.', 5, 'Pantalla preciosa y muy fluida. El lápiz funciona genial para tomar notas.', '2 semanas') ]
    },
    {
      id: 'p16', name: 'Difusor Aromático Lumière Mist', category: 'hogar', brand: 'lumiere',
      price: 129900, oldPrice: 179900, stock: 45, rating: 4.4, sold: 312,
      tone: '#18a558', desc: 'Difusor ultrasónico de aromas con luz ambiental de 7 colores, temporizador y apagado automático. Humidifica y perfuma hasta 30m² de forma silenciosa.',
      gallery: 3,
      specs: { 'Capacidad': '300 ml', 'Cobertura': '30 m²', 'Luz': '7 colores', 'Modo': 'Ultrasónico silencioso', 'Garantía': '12 meses' },
      reviews: [ R('Sara M.', 4, 'Relaja mucho el ambiente. La luz es muy bonita de noche.', '1 semana') ]
    },
    {
      id: 'p17', name: 'Power Bank Pulse Charge 20.000 mAh', category: 'tecnologia', brand: 'pulse',
      price: 139900, oldPrice: 189900, stock: 50, rating: 4.6, sold: 445, bestseller: true,
      tone: '#2f7de1', desc: 'Batería externa de 20.000 mAh con carga rápida de 22.5W, pantalla digital de nivel, tres salidas y carga inalámbrica. Carga tu teléfono hasta 5 veces.',
      gallery: 3,
      specs: { 'Capacidad': '20.000 mAh', 'Carga rápida': '22.5W PD', 'Salidas': 'USB-C · 2x USB-A', 'Inalámbrica': '15W', 'Garantía': '12 meses' },
      reviews: [ R('Andrés Q.', 5, 'Carga rapidísimo y la pantalla de nivel es muy útil.', '3 días') ]
    },
    {
      id: 'p18', name: 'Bolso de Cuero Monarch Classic Tote', category: 'moda', brand: 'monarch',
      price: 459900, oldPrice: 629900, stock: 11, rating: 4.8, sold: 142, featured: true,
      tone: '#e23d44', desc: 'Bolso tote de cuero genuino con acabado a mano, forro interior de algodón, múltiples compartimentos y herrajes dorados. Elegancia que perdura en el tiempo.',
      gallery: 4,
      specs: { 'Material': 'Cuero genuino', 'Herrajes': 'Dorados', 'Compartimentos': '3 + bolsillos', 'Hecho': 'A mano', 'Garantía': '12 meses' },
      reviews: [ R('Isabella G.', 5, 'Calidad de cuero excelente. Es espacioso y se ve carísimo.', '1 semana') ]
    },
    {
      id: 'p19', name: 'Plancha de Cabello Eterna Keratin Pro', category: 'belleza', brand: 'eterna',
      price: 169900, oldPrice: 229900, stock: 26, rating: 4.5, sold: 276,
      tone: '#e0529b', desc: 'Plancha de cabello con placas de cerámica y keratina, control de temperatura digital hasta 230°C, calentamiento en 15 segundos y tecnología iónica anti-frizz.',
      gallery: 3,
      specs: { 'Placas': 'Cerámica + keratina', 'Temperatura': 'Hasta 230°C', 'Calentamiento': '15 seg', 'Tecnología': 'Iónica', 'Garantía': '12 meses' },
      reviews: [ R('Manuela T.', 4, 'Deja el cabello liso y brillante. Calienta muy rápido.', '5 días') ]
    },
    {
      id: 'p20', name: 'Reloj Minimalista AuraLux Slim Gold', category: 'relojes', brand: 'auralux',
      price: 329900, oldPrice: 459900, stock: 19, rating: 4.7, sold: 188, isNew: true, featured: true,
      tone: '#c9a227', desc: 'Reloj de cuarzo ultradelgado con caja chapada en oro, esfera minimalista y correa de cuero italiano. Diseño elegante para cualquier ocasión.',
      gallery: 4,
      specs: { 'Movimiento': 'Cuarzo japonés', 'Caja': 'Chapada oro · 38mm', 'Correa': 'Cuero italiano', 'Resistencia': '3ATM', 'Garantía': '12 meses' },
      reviews: [ R('Gabriel N.', 5, 'Elegante y delgadísimo. Combina con todo.', '1 semana') ]
    },
    {
      id: 'p21', name: 'Robot Aspirador Nórdico CleanBot Laser', category: 'hogar', brand: 'nordico',
      price: 989900, oldPrice: 1399900, stock: 5, rating: 4.6, sold: 87, featured: true,
      tone: '#18a558', desc: 'Robot aspirador con navegación láser LiDAR, mapeo inteligente por app, función de trapeado, succión de 4000Pa y base de autovaciado. Limpieza total sin esfuerzo.',
      gallery: 4,
      specs: { 'Succión': '4000 Pa', 'Navegación': 'LiDAR', 'Trapeado': 'Sí', 'Autonomía': '180 min', 'Garantía': '24 meses' },
      reviews: [ R('Roberto C.', 5, 'Mapea la casa perfecto y limpia solo. Una maravilla.', '2 semanas') ]
    },
    {
      id: 'p22', name: 'Audífonos In-Ear AuraLux Buds Lite', category: 'audio', brand: 'auralux',
      price: 149900, oldPrice: 209900, stock: 60, rating: 4.4, sold: 523, bestseller: true,
      tone: '#9b59f6', desc: 'Audífonos in-ear inalámbricos con cancelación de ruido ENC, 30 horas de batería con estuche, controles táctiles y resistencia al sudor IPX5.',
      gallery: 3,
      specs: { 'Batería': '30h (con estuche)', 'ENC': 'Llamadas claras', 'Resistencia': 'IPX5', 'Conexión': 'Bluetooth 5.3', 'Garantía': '12 meses' },
      reviews: [ R('Laura B.', 4, 'Muy buenos por el precio. Perfectos para entrenar.', '4 días') ]
    },
    {
      id: 'p23', name: 'Monitor ZenTech UltraView 27" 2K 165Hz', category: 'tecnologia', brand: 'zentech',
      price: 1090000, oldPrice: 1449900, stock: 6, rating: 4.8, sold: 78, featured: true, isNew: true,
      tone: '#2f7de1', desc: 'Monitor IPS de 27" resolución 2K, 165Hz de tasa de refresco, 1ms de respuesta, HDR400 y bordes ultradelgados. Ideal para gaming y trabajo creativo.',
      gallery: 3,
      specs: { 'Panel': 'IPS 27" 2K', 'Refresco': '165 Hz', 'Respuesta': '1 ms', 'HDR': 'HDR400', 'Garantía': '36 meses' },
      reviews: [ R('Cristian D.', 5, 'Imagen nítida y fluidísima. Los colores son geniales para editar.', '1 semana') ]
    },
    {
      id: 'p24', name: 'Difusor de Perfume para Auto Velora Aura', category: 'belleza', brand: 'velora',
      price: 79900, oldPrice: 119900, stock: 70, rating: 4.3, sold: 401,
      tone: '#e0529b', desc: 'Ambientador premium para auto con difusión por ventilación, esencias de larga duración y diseño en aluminio. Mantiene tu vehículo con un aroma fresco y elegante.',
      gallery: 3,
      specs: { 'Duración': 'Hasta 60 días', 'Material': 'Aluminio', 'Montaje': 'Rejilla de aire', 'Aromas': '3 esencias', 'Garantía': '6 meses' },
      reviews: [ R('Pedro A.', 4, 'Huele rico y dura bastante. Se ve elegante en el carro.', '1 semana') ]
    }
  ];

  return { categories, brands, coupons, banners, testimonials, products };
})();
