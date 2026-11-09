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
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import * as contentful from "contentful";

// Configuración de Contentful
const client = contentful.createClient({
  space: import.meta.env.VITE_CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
});

// Interfaz para los productos
interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  description: string;
  category: string;
  gender: string;
  badge?: string;
  imageUrl: string;
}

// Estructura de categorías tipo Acordeón
const MENU_CATEGORIES = [
  { label: "Todos", value: "Todos" },
  {
    label: "Fragancias",
    sub: [
      { label: "Hombre", value: "Fragancias Hombre" },
      { label: "Mujer", value: "Fragancias Mujer" },
      { label: "Sin Género", value: "Fragancias Sin Género" },
    ],
  },
  { label: "Niños", value: "Niños" },
  { label: "Maquillaje", value: "Maquillaje" },
  { label: "Aromas", value: "Aromas" },
  {
    label: "Hogar",
    sub: [
      { label: "Aromas para el hogar", value: "Aromas para el hogar" },
      { label: "Utensilios", value: "Hogar - Utensilios" },
      { label: "Accesorios", value: "Hogar - Accesorios" },
    ],
  },
  { label: "Suplementos", value: "Suplementos" },
];

export default function CheslieApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(
    [],
  );

  // Estado para el menú acordeón
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (catLabel: string) => {
    setExpandedCategories((prev) =>
      prev.includes(catLabel)
        ? prev.filter((c) => c !== catLabel)
        : [...prev, catLabel],
    );
  };

  // Carga de productos desde Contentful
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await client.getEntries({ content_type: "product" });
        const formattedProducts = response.items.map((item: any) => {
          const imageAsset = item.fields.image as any;
          return {
            id: item.sys.id,
            name: item.fields.name,
            price: item.fields.price,
            oldPrice: item.fields.oldPrice,
            description: item.fields.description,
            category: item.fields.category || "Fragancias",
            gender: item.fields.gender || "Unisex",
            badge: item.fields.badge,
            imageUrl: imageAsset?.fields?.file?.url
              ? `https:${imageAsset.fields.file.url}`
              : "/placeholder.jpg",
          };
        });
        setProducts(formattedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Lógica del carrito
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === id) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const sendWhatsAppOrder = () => {
    const phoneNumber = "549XXXXXXXXXX"; // Reemplaza con tu número
    let message =
      "Hola Cheslie Millanel, quiero hacer el siguiente pedido:%0A%0A";
    cart.forEach((item) => {
      message += `- ${item.quantity}x ${item.product.name} ($${item.product.price})%0A`;
    });
    message += `%0ATotal: $${cartTotal}`;
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  // Filtrado de productos
  const filteredProducts = products.filter(
    (p) => activeCategory === "Todos" || p.category === activeCategory,
  );

  // Productos destacados (con badge) o los primeros 4 por defecto
  let featuredProducts = products.filter((p) => p.badge);
  if (featuredProducts.length === 0 && products.length > 0) {
    featuredProducts = products.slice(0, 4);
  }
  // Para el carrusel infinito
  const carouselItems = [
    ...featuredProducts,
    ...featuredProducts,
    ...featuredProducts,
  ];

  return (
    <div className="min-h-screen bg-[#F9F8F5] font-sans overflow-x-hidden text-gray-800">
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

            <div className="flex items-center">
              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2 hover:bg-[#3f4720] rounded-full transition-colors relative"
              >
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-[#C7A982] text-[#4F5927] text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 bg-[#d0bfa8] overflow-hidden border-b-8 border-[#4F5927]">
        {/* Hojas decorativas SVG (Fondo) */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <svg
            className="absolute left-0 bottom-0 w-64 h-64 transform -translate-x-1/4 translate-y-1/4"
            viewBox="0 0 100 100"
          >
            <path
              d="M50,100 C50,50 10,60 10,20 C30,40 50,30 50,0 C50,30 70,40 90,20 C90,60 50,50 50,100 Z"
              fill="#4F5927"
            />
          </svg>
          <svg
            className="absolute right-0 top-0 w-80 h-80 transform translate-x-1/4 -translate-y-1/4"
            viewBox="0 0 100 100"
          >
            <path
              d="M50,100 C50,50 10,60 10,20 C30,40 50,30 50,0 C50,30 70,40 90,20 C90,60 50,50 50,100 Z"
              fill="#4F5927"
            />
          </svg>
        </div>

        {/* CONTENIDO DE TEXTO */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center mt-8 sm:mt-0">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#4F5927] font-bold mb-4 sm:mb-6 leading-tight max-w-[90%]">
            Descubrí tu esencia, <br className="hidden sm:block" /> viví en
            equilibrio
          </h2>
          <p className="text-base sm:text-lg text-[#4F5927] max-w-xl opacity-90 mb-8 sm:mb-10 font-medium px-4">
            Cosmética consciente y aromaterapia diseñada para armonizar tu
            cuerpo y mente. Experimentá la colección exclusiva de Cheslie
            Millanel.
          </p>
          <a
            href="#destacados"
            className="bg-[#4F5927] text-[#C7A982] px-6 sm:px-8 py-3 rounded-full font-bold hover:bg-[#3f4720] transition-transform hover:scale-105 shadow-xl text-sm sm:text-base"
          >
            Ver Ofertas
          </a>
        </div>
      </header>

      {/* DESTACADOS */}
      <section id="destacados" className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
          <h3 className="text-2xl md:text-3xl font-serif text-[#4F5927] font-bold flex items-center justify-center gap-3">
            <Star className="text-[#C7A982]" size={28} /> Ofertas & Destacados{" "}
            <Star className="text-[#C7A982]" size={28} />
          </h3>
        </div>

        {/* Carrusel infinito */}
        <div className="relative w-full overflow-hidden">
          <div className="flex animate-scroll hover:animation-pause gap-6 px-4">
            {carouselItems.map((product, idx) => (
              <div
                key={`${product.id}-${idx}`}
                className="flex-none w-72 bg-[#F9F8F5] rounded-xl overflow-hidden shadow-md border border-[#C7A982]/20 group"
              >
                <div className="relative h-64 overflow-hidden bg-gray-200">
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-[#4F5927] text-[#C7A982] text-xs font-bold px-3 py-1 rounded-full z-10 shadow-sm flex items-center gap-1">
                      <Tag size={12} /> {product.badge}
                    </span>
                  )}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <span className="text-[10px] font-bold text-[#4F5927] uppercase tracking-wider mb-1 block">
                    {product.category}
                  </span>
                  <h4 className="font-bold text-gray-800 text-lg mb-1 truncate">
                    {product.name}
                  </h4>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-xl font-black text-[#4F5927]">
                      ${product.price.toLocaleString("es-AR")}
                    </span>
                    {product.oldPrice && (
                      <span className="text-sm text-gray-400 line-through mb-0.5">
                        ${product.oldPrice.toLocaleString("es-AR")}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-[#C7A982] hover:bg-[#b59871] text-[#4F5927] font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={18} /> Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATÁLOGO */}
      <section
        id="catalogo"
        className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <h3 className="text-3xl font-serif text-[#4F5927] font-bold mb-10 text-center">
          Nuestro Catálogo
        </h3>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Botón Filtros Móvil */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full bg-white border border-[#C7A982] text-[#4F5927] font-bold py-3 rounded-xl flex justify-center items-center gap-2 shadow-sm"
            >
              <Filter size={20} />{" "}
              {showMobileFilters ? "Ocultar Categorías" : "Mostrar Categorías"}
            </button>
          </div>

          {/* SIDEBAR ACORDEÓN */}
          <aside
            className={`lg:w-1/4 ${showMobileFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="sticky top-28 bg-white p-6 rounded-xl border border-[#C7A982]/20 shadow-sm">
              <h4 className="text-xl font-serif text-[#4F5927] font-bold mb-4 border-b border-gray-100 pb-2">
                Categorías
              </h4>
              <ul className="space-y-2 mb-8">
                {MENU_CATEGORIES.map((category) => (
                  <li key={category.label} className="flex flex-col">
                    {category.sub ? (
                      <>
                        <button
                          onClick={() => toggleCategory(category.label)}
                          className="flex justify-between items-center w-full text-left px-4 py-2 rounded-lg text-sm font-bold text-gray-700 hover:bg-[#F9F8F5] hover:text-[#4F5927] transition-colors"
                        >
                          {category.label}
                          {expandedCategories.includes(category.label) ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </button>

                        {/* Submenú desplegable */}
                        {expandedCategories.includes(category.label) && (
                          <ul className="ml-4 mt-1 space-y-1 border-l-2 border-[#C7A982]/30 pl-2">
                            {category.sub.map((subCat) => (
                              <li key={subCat.value}>
                                <button
                                  onClick={() =>
                                    setActiveCategory(subCat.value)
                                  }
                                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                    activeCategory === subCat.value
                                      ? "bg-[#4F5927] text-[#C7A982]"
                                      : "text-gray-600 hover:bg-[#F9F8F5] hover:text-[#4F5927]"
                                  }`}
                                >
                                  {subCat.label}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() =>
                          setActiveCategory(category.value as string)
                        }
                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          activeCategory === category.value
                            ? "bg-[#4F5927] text-[#C7A982]"
                            : "text-gray-600 hover:bg-[#F9F8F5] hover:text-[#4F5927]"
                        }`}
                      >
                        {category.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* GRID DE PRODUCTOS */}
          <div className="lg:w-3/4">
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-500 font-medium">
                Mostrando{" "}
                <span className="font-bold text-[#4F5927]">
                  {filteredProducts.length}
                </span>{" "}
                productos
              </p>
              {activeCategory !== "Todos" && (
                <span className="bg-[#e4d8c6] text-[#4F5927] px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                  {activeCategory}
                </span>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-xl text-center border border-gray-100 shadow-sm">
                <p className="text-gray-500 text-lg">
                  No hay productos en esta categoría por el momento.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-[#C7A982]/20 flex flex-col h-full group"
                  >
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                      {product.badge && (
                        <span className="absolute top-3 left-3 bg-[#4F5927] text-[#C7A982] text-xs font-bold px-3 py-1 rounded-full z-10 shadow-sm">
                          {product.badge}
                        </span>
                      )}
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-[#4F5927] uppercase tracking-wider">
                          {product.category}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                          {product.gender}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-800 text-lg leading-tight mb-2 flex-1">
                        {product.name}
                      </h4>
                      <div className="flex items-end gap-2 mb-4 mt-auto">
                        <span className="text-2xl font-black text-[#4F5927]">
                          ${product.price.toLocaleString("es-AR")}
                        </span>
                        {product.oldPrice && (
                          <span className="text-sm text-gray-400 line-through mb-1">
                            ${product.oldPrice.toLocaleString("es-AR")}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full bg-[#C7A982] hover:bg-[#b59871] text-[#4F5927] font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Plus size={18} /> Agregar al carrito
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#4F5927] text-[#C7A982] py-12 border-t-4 border-[#C7A982]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">
            Cheslie Millanel
          </h2>
          <p className="opacity-80 mb-6 max-w-md mx-auto">
            Cosmética consciente y bienestar para tu día a día.
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-[#C7A982] text-[#4F5927] flex items-center justify-center hover:bg-white transition-colors"
            >
              Ig
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-[#C7A982] text-[#4F5927] flex items-center justify-center hover:bg-white transition-colors"
            >
              Fb
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-[#C7A982] text-[#4F5927] flex items-center justify-center hover:bg-white transition-colors"
            >
              Wa
            </a>
          </div>
          <p className="text-sm opacity-60">
            © {new Date().getFullYear()} Cheslie Millanel. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>

      {/* CART OVERLAY */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#F9F8F5]">
              <h2 className="text-2xl font-serif text-[#4F5927] font-bold flex items-center gap-2">
                <ShoppingCart className="text-[#C7A982]" /> Tu Carrito
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-gray-400 hover:text-gray-800 transition-colors p-1"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                  <p>Tu carrito está vacío.</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 text-[#4F5927] font-bold underline"
                  >
                    Volver al catálogo
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 border-b border-gray-100 pb-4"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 leading-tight mb-1">
                        {item.product.name}
                      </h4>
                      <p className="text-[#4F5927] font-bold">
                        ${item.product.price.toLocaleString("es-AR")}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center bg-gray-100 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="p-1 hover:bg-gray-200 rounded-l-lg text-gray-600"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-semibold text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="p-1 hover:bg-gray-200 rounded-r-lg text-gray-600"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-400 hover:text-red-600 text-sm flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-[#F9F8F5] border-t border-[#C7A982]/30">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-600 font-bold">Total:</span>
                  <span className="text-3xl font-black text-[#4F5927]">
                    ${cartTotal.toLocaleString("es-AR")}
                  </span>
                </div>
                <button
                  onClick={sendWhatsAppOrder}
                  className="w-full bg-[#4F5927] hover:bg-[#3f4720] text-[#C7A982] font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex justify-center items-center gap-2 text-lg"
                >
                  Enviar pedido por WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-250px * 5)); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
