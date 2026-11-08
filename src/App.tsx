import { useState, useEffect } from "react";
import {
  ShoppingCart,
  X,
  Menu,
  Star,
  Tag,
  Plus,
  Minus,
  Trash2,
  Filter,
} from "lucide-react";
import { contentfulClient } from "./contentful";

// --- DEFINICIÓN DE TIPOS ---
interface Product {
  id: string;
  name: string;
  category: string;
  gender: "Mujer" | "Hombre" | "Unisex";
  price: number;
  oldPrice?: number;
  badge?: string;
  image: string;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

// --- DATOS DE PRODUCTOS DE RESPALDO (Por si falla Contentful) ---
const FALLBACK_FEATURED: Product[] = [
  {
    id: "f1",
    name: "Combo: Crema Perfumada + Fragancia",
    category: "Fragancias",
    gender: "Mujer",
    price: 14990,
    oldPrice: 26320,
    badge: "¡Súper Combo!",
    image:
      "https://images.unsplash.com/photo-1616949755610-8c9bac08f977?auto=format&fit=crop&w=500&q=80",
    description:
      "1 crema suavizante perfumada + 1 fragancia alternativa de 30 ml.",
  },
  {
    id: "f2",
    name: "Body Splash Cherry On Top",
    category: "Cuidado Corporal",
    gender: "Mujer",
    price: 6490,
    oldPrice: 10500,
    badge: "Súper Precio",
    image:
      "https://images.unsplash.com/photo-1615397323674-d4fbb1c7a522?auto=format&fit=crop&w=500&q=80",
    description:
      "Aroma cherry irresistible con notas frutales jugosas y fondo cálido. 74 ml.",
  },
];

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Eau de Parfum Orígenes 1",
    category: "Fragancias",
    gender: "Unisex",
    price: 19990,
    oldPrice: 32200,
    badge: "Lanzamiento",
    image:
      "https://images.unsplash.com/photo-1594913785160-2646fc0894be?auto=format&fit=crop&w=500&q=80",
    description:
      "60ml. Composición rica y sofisticada, frescura especiada con fondo ambarado profundo.",
  },
  {
    id: "p2",
    name: "Máscara para pestañas Cherry On Top",
    category: "Maquillaje",
    gender: "Mujer",
    price: 7490,
    oldPrice: 12460,
    image:
      "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=500&q=80",
    description:
      "A prueba de agua. Realza la mirada con un tono profundo y sofisticado. 3,5 g.",
  },
  {
    id: "p3",
    name: "Crema Corporal con Lavanda y Romero",
    category: "Cuidado Corporal",
    gender: "Unisex",
    price: 9000,
    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=500&q=80",
    description:
      "100g. Fórmula nutritiva que restaura la elasticidad y calma tensiones.",
  },
];

// Opciones de los filtros corregidas
const CATEGORIES: string[] = [
  "Todos",
  "Fragancias",
  "Cuidado Facial",
  "Cuidado Corporal",
  "Maquillaje",
  "Aromaterapia",
  "Hogar",
];
const GENDERS: string[] = ["Todos", "Mujer", "Hombre", "Unisex"];

export default function CheslieApp() {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [activeGender, setActiveGender] = useState<string>("Todos");
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Estados para Contentful
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Efecto para obtener productos desde Contentful
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await contentfulClient.getEntries({
          content_type: "product",
        });

        if (response.items.length > 0) {
          const contentfulProducts: Product[] = response.items.map(
            (item: any) => {
              const fields = item.fields;

              // Lógica para extraer la URL de la imagen de Contentful
              let imageUrl =
                "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=500&q=80";

              if (
                fields.image &&
                fields.image.fields &&
                fields.image.fields.file &&
                fields.image.fields.file.url
              ) {
                imageUrl = fields.image.fields.file.url.startsWith("//")
                  ? `https:${fields.image.fields.file.url}`
                  : fields.image.fields.file.url;
              }

              return {
                id: item.sys.id,
                name: fields.name || "Sin nombre",
                price: fields.price || 0,
                oldPrice: fields.oldPrice || undefined,
                category: fields.category || "Fragancias", // Asignamos Fragancias por defecto si viene vacío
                gender: fields.gender || "Unisex",
                badge: fields.badge || undefined,
                description: fields.description || "",
                image: imageUrl,
              };
            },
          );

          setProducts(contentfulProducts);
          const featured = contentfulProducts.filter((p) => p.badge);
          setFeaturedProducts(
            featured.length > 0 ? featured : contentfulProducts.slice(0, 4),
          );
        } else {
          setProducts(FALLBACK_PRODUCTS);
          setFeaturedProducts(FALLBACK_FEATURED);
        }
      } catch (error) {
        console.error("Error obteniendo productos de Contentful:", error);
        setProducts(FALLBACK_PRODUCTS);
        setFeaturedProducts(FALLBACK_FEATURED);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const SCROLLING_PRODUCTS = [
    ...featuredProducts,
    ...featuredProducts,
    ...featuredProducts,
  ];

  const filteredProducts = products.filter((p) => {
    const matchCategory =
      activeCategory === "Todos" || p.category === activeCategory;
    const matchGender = activeGender === "Todos" || p.gender === activeGender;
    return matchCategory && matchGender;
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQ = item.quantity + delta;
          return newQ > 0 ? { ...item, quantity: newQ } : item;
        }
        return item;
      }),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleWhatsAppOrder = () => {
    const phoneNumber = "549XXXXXXXXXX";
    let message =
      "¡Hola Cheslie Millanel! Quisiera realizar el siguiente pedido:\n\n";
    cart.forEach((item) => {
      message += `- ${item.quantity}x ${item.name} (${formatPrice(item.price)})\n`;
    });
    message += `\n*Total estimado: ${formatPrice(cartTotal)}*`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(price);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C7A982] border-t-[#4F5927] rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-serif text-[#4F5927] font-bold">
            Cargando catálogo...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F5] font-sans text-gray-800 overflow-x-hidden">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-320px * ${featuredProducts.length} - 24px * ${featuredProducts.length})); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full bg-[#4F5927] text-[#C7A982] z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-[#3f4720] rounded-md transition-colors"
              >
                <Menu size={24} />
              </button>
            </div>

            <div className="flex-1 flex justify-center sm:justify-start items-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#C7A982] shadow-sm bg-white shrink-0">
                <img
                  src="/IMG_7253.jpeg"
                  alt="Cheslie Logo"
                  className="w-full h-full object-cover scale-110"
                />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-serif tracking-wider font-bold whitespace-nowrap">
                Cheslie <span className="font-light">Millanel</span>
              </h1>
            </div>

            <div className="hidden sm:flex items-center space-x-8">
              <a
                href="#destacados"
                className="hover:text-white transition-colors font-semibold tracking-wide"
              >
                Destacados
              </a>
              <a
                href="#catalogo"
                className="hover:text-white transition-colors font-semibold tracking-wide"
              >
                Catálogo
              </a>
            </div>

            <div className="flex items-center ml-4">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-[#3f4720] rounded-full transition-colors"
              >
                <ShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#C7A982] text-[#4F5927] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="sm:hidden bg-[#4F5927] border-t border-[#3f4720]">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="#destacados"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-md hover:bg-[#3f4720]"
              >
                Destacados
              </a>
              <a
                href="#catalogo"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 rounded-md hover:bg-[#3f4720]"
              >
                Catálogo
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION CON HOJAS */}
      <header className="relative pt-20 pb-16 md:pt-32 md:pb-24 bg-[#C7A982] overflow-hidden flex items-center justify-center min-h-[60vh]">
        {/* Decoración botánica izquierda (Estilo Minimalista, más grande y centrada) */}
        <div className="absolute left-[-20px] md:left-[15%] bottom-0 opacity-40 pointer-events-none w-40 md:w-64 text-[#4F5927] z-0">
          <svg
            viewBox="0 0 100 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full transform scale-110"
          >
            {/* Tallo principal recto/ligeramente curvo */}
            <path d="M50,200 C48,150 48,100 40,50" />

            {/* Flor inferior izquierda */}
            <path d="M48,140 C35,130 25,120 20,110" />
            <path d="M20,110 C18,105 20,100 22,100 C25,100 25,105 20,110" />
            <path d="M20,110 C15,108 12,105 14,102 C16,99 18,105 20,110" />
            <path d="M20,110 C22,105 25,100 28,102 C30,105 25,108 20,110" />
            {/* Hojita en el tallo de la flor */}
            <path d="M35,130 C30,135 28,140 32,138 C35,135 35,130 35,130" />

            {/* Flor superior izquierda */}
            <path d="M45,90 C35,80 25,70 15,50" />
            <path d="M15,50 C12,45 15,40 18,40 C22,40 20,45 15,50" />
            <path d="M15,50 C10,48 5,45 8,40 C10,38 12,45 15,50" />
            <path d="M15,50 C18,45 22,40 25,42 C28,45 20,48 15,50" />

            {/* Flor principal superior */}
            <path d="M40,50 C38,45 38,35 40,30 C42,35 45,45 40,50" />
            <path d="M40,50 C35,45 30,35 32,30 C35,35 38,45 40,50" />
            <path d="M40,50 C45,45 50,35 48,30 C45,35 42,45 40,50" />
            {/* Hojitas en el tallo principal */}
            <path d="M42,70 C48,72 52,68 50,65 C48,62 42,70 42,70" />
            <path d="M46,120 C52,122 55,118 53,115 C50,112 46,120 46,120" />
          </svg>
        </div>

        {/* Decoración botánica derecha (Estilo Minimalista, más grande y centrada) */}
        <div className="absolute right-[-20px] md:right-[15%] bottom-0 opacity-40 pointer-events-none w-40 md:w-64 text-[#4F5927] z-0">
          <svg
            viewBox="0 0 100 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-full h-full transform scale-110"
          >
            {/* Tallo principal curvo */}
            <path d="M40,200 C45,150 55,100 60,30" />

            {/* Rama inferior derecha con hojas */}
            <path d="M45,160 C55,150 65,140 75,120" />
            <path d="M60,145 C65,150 70,148 72,143 C70,140 60,145 60,145" />
            <path d="M65,135 C70,138 75,135 77,130 C75,125 65,135 65,135" />
            <path d="M75,120 C80,122 85,118 87,113 C85,108 75,120 75,120" />

            {/* Rama central derecha con hojas */}
            <path d="M52,110 C65,100 75,90 85,70" />
            <path d="M65,98 C70,105 75,102 77,97 C75,92 65,98 65,98" />
            <path d="M72,88 C78,92 82,90 84,85 C80,82 72,88 72,88" />
            <path d="M85,70 C90,75 95,72 97,67 C95,62 85,70 85,70" />

            {/* Hojas en el tallo principal */}
            <path d="M58,55 C65,60 70,55 72,50 C68,45 58,55 58,55" />
            <path d="M50,135 C42,130 38,135 36,140 C40,145 50,135 50,135" />
            <path d="M56,75 C48,70 42,75 40,80 C45,85 56,75 56,75" />

            {/* Punta del tallo */}
            <path d="M60,30 C65,35 70,30 72,25 C68,20 60,30 60,30" />
            <path d="M60,30 C55,25 50,30 48,35 C52,40 60,30 60,30" />
          </svg>
        </div>

        {/* Contenido Central */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-[#4F5927] font-bold mb-4 leading-tight">
            Descubrí tu esencia, <br /> viví en equilibrio
          </h2>
          <p className="text-lg text-[#4F5927] max-w-2xl opacity-90 mb-8 font-medium">
            Cosmética consciente y aromaterapia diseñada para armonizar tu
            cuerpo y mente. Experimentá la colección exclusiva de Cheslie
            Millanel.
          </p>
          <a
            href="#destacados"
            className="bg-[#4F5927] text-[#C7A982] px-8 py-3 rounded-full font-bold hover:bg-[#3f4720] transition-transform hover:scale-105 shadow-xl"
          >
            Ver Ofertas
          </a>
        </div>
      </header>

      {/* OFERTAS Y DESTACADOS */}
      <section id="destacados" className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="flex items-center justify-center space-x-3">
            <Star className="text-[#C7A982]" size={28} />
            <h3 className="text-3xl font-serif text-[#4F5927] font-bold text-center">
              Ofertas & Destacados
            </h3>
            <Star className="text-[#C7A982]" size={28} />
          </div>
        </div>

        <div className="flex overflow-hidden relative w-full">
          <div className="flex gap-6 w-max animate-scroll">
            {SCROLLING_PRODUCTS.map((product, index) => (
              <div
                key={`${product.id}-${index}`}
                className="w-[320px] bg-[#F9F8F5] border border-[#C7A982]/30 rounded-lg overflow-hidden group hover:shadow-xl transition-shadow relative flex flex-col shrink-0"
              >
                {product.badge && (
                  <div className="absolute top-3 left-3 bg-[#4F5927] text-[#C7A982] text-xs font-bold px-3 py-1 rounded-full z-10 flex items-center shadow-md">
                    <Tag size={12} className="mr-1" />
                    {product.badge}
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 text-[#4F5927] text-[10px] font-bold px-2 py-1 rounded-md z-10 shadow-sm uppercase tracking-wider">
                  {product.gender}
                </div>

                <div className="h-64 overflow-hidden relative bg-white flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <p className="text-xs text-[#C7A982] font-bold uppercase tracking-wider mb-1">
                    {product.category}
                  </p>
                  <h4 className="text-lg font-bold text-[#4F5927] mb-2 leading-tight">
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
                    {product.description}
                  </p>
                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      {product.oldPrice && (
                        <p className="text-sm text-gray-400 line-through mb-1">
                          {formatPrice(product.oldPrice)}
                        </p>
                      )}
                      <p className="text-xl font-bold text-[#4F5927]">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-[#C7A982] text-[#4F5927] w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#b59972] transition-colors shadow-md"
                      aria-label="Agregar al carrito"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN CATÁLOGO CON BARRA LATERAL */}
      <section id="catalogo" className="py-16 bg-[#F9F8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-serif text-[#4F5927] font-bold text-center mb-10">
            Catálogo Completo
          </h3>

          <div className="lg:hidden mb-6 flex justify-center">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 bg-[#4F5927] text-[#C7A982] px-6 py-2 rounded-full font-semibold shadow-md"
            >
              <Filter size={18} />{" "}
              {showMobileFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* SIDEBAR */}
            <aside
              className={`lg:w-1/4 ${showMobileFilters ? "block" : "hidden lg:block"}`}
            >
              <div className="sticky top-28 bg-white p-6 rounded-xl border border-[#C7A982]/20 shadow-sm">
                <h4 className="text-xl font-serif text-[#4F5927] font-bold mb-4 border-b border-gray-100 pb-2">
                  Categorías
                </h4>
                <ul className="space-y-2 mb-8">
                  {CATEGORIES.map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => setActiveCategory(cat)}
                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          activeCategory === cat
                            ? "bg-[#4F5927] text-[#C7A982]"
                            : "text-gray-600 hover:bg-[#F9F8F5] hover:text-[#4F5927]"
                        }`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="lg:w-3/4">
              <div className="flex flex-wrap gap-2 mb-8">
                {GENDERS.map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setActiveGender(gender)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors border ${
                      activeGender === gender
                        ? "bg-[#C7A982] text-[#4F5927] border-[#C7A982]"
                        : "bg-white text-gray-500 border-gray-200 hover:border-[#C7A982] hover:text-[#4F5927]"
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg overflow-hidden group hover:shadow-lg transition-shadow border border-gray-100 flex flex-col relative"
                  >
                    <div className="absolute top-3 right-3 bg-white/90 text-[#4F5927] text-[10px] font-bold px-2 py-1 rounded-md z-10 shadow-sm uppercase tracking-wider">
                      {product.gender}
                    </div>
                    {product.badge && (
                      <div className="absolute top-3 left-3 bg-[#4F5927] text-[#C7A982] text-[10px] font-bold px-2 py-1 rounded-md z-10 shadow-sm uppercase tracking-wider">
                        {product.badge}
                      </div>
                    )}

                    <div className="h-64 overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <p className="text-xs text-[#C7A982] font-bold uppercase tracking-wider mb-1">
                        {product.category}
                      </p>
                      <h4 className="text-md font-bold text-[#4F5927] mb-2 leading-tight">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-500 mb-4 flex-grow line-clamp-3">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                        <div>
                          {product.oldPrice && (
                            <p className="text-xs text-gray-400 line-through">
                              {formatPrice(product.oldPrice)}
                            </p>
                          )}
                          <p className="text-lg font-bold text-[#4F5927]">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          className="text-sm font-bold text-[#C7A982] hover:text-[#4F5927] transition-colors flex items-center gap-1"
                        >
                          <Plus size={16} /> AGREGAR
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500 text-lg">
                    No hay productos que coincidan con estos filtros.
                  </p>
                  <button
                    onClick={() => {
                      setActiveCategory("Todos");
                      setActiveGender("Todos");
                    }}
                    className="mt-4 text-[#4F5927] font-bold underline hover:text-[#C7A982]"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#4F5927] text-[#C7A982] py-12 border-t-4 border-[#C7A982]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">
            Cheslie Millanel
          </h2>
          <p className="mb-6 opacity-80 max-w-md mx-auto">
            Tu espacio de bienestar, belleza y aromaterapia. Encontrá tu
            equilibrio todos los días.
          </p>
          <div className="border-t border-[#C7A982]/30 pt-6 mt-6">
            <p className="text-sm opacity-70">
              &copy; {new Date().getFullYear()} Cheslie Millanel. Todos los
              derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* CARRITO LATERAL */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsCartOpen(false)}
          ></div>

          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md w-full bg-white shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-4 sm:p-6 bg-[#4F5927] text-[#C7A982]">
                <h2 className="text-xl font-bold font-serif flex items-center">
                  <ShoppingCart className="mr-2" /> Tu Carrito
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F9F8F5]">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <ShoppingCart size={48} className="mb-4 opacity-30" />
                    <p className="text-lg">Tu carrito está vacío</p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-4 text-[#4F5927] font-bold underline"
                    >
                      Seguir comprando
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {cart.map((item) => (
                      <li
                        key={item.id}
                        className="flex bg-white p-3 rounded-lg shadow-sm border border-gray-100 relative"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-md"
                        />
                        <div className="ml-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-[#4F5927] line-clamp-2 pr-6">
                              {item.name}
                            </h4>
                            <p className="text-[#C7A982] font-bold mt-1">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-gray-200 rounded-md">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="p-1 text-gray-500 hover:bg-gray-100"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="px-3 text-sm font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="p-1 text-gray-500 hover:bg-gray-100"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="absolute top-2 right-2 text-red-300 hover:text-red-500 p-1 bg-white rounded-full shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 sm:p-6 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-between text-lg font-bold text-[#4F5927] mb-4">
                    <span>Total</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <button
                    onClick={handleWhatsAppOrder}
                    className="w-full bg-[#4F5927] text-[#C7A982] py-4 rounded-lg font-bold text-lg hover:bg-[#3f4720] transition-colors shadow-lg"
                  >
                    Hacer pedido por WhatsApp
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
