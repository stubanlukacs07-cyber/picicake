import { useEffect } from 'react';
import { BrowserRouter, HashRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { CartProvider } from './lib/cart';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Event from './pages/Event';
import Info from './pages/Info';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CakeBuilder from './pages/CakeBuilder';
import NotFound from './pages/NotFound';

/** A public/404.html által eltárolt útvonal visszaállítása (GitHub Pages). */
/**
 * Lokális, egyfájlos build (vagy file:// megnyitás) esetén hash alapú útvonalak,
 * hogy webszerver nélkül is működjön minden oldal. Éles buildben normál URL-ek.
 */
const IS_LOCAL_FILE =
  import.meta.env.VITE_LOCAL === '1' || import.meta.env.VITE_HASH === '1' ||
  (typeof window !== 'undefined' && window.location.protocol === 'file:');

const Router = IS_LOCAL_FILE ? HashRouter : BrowserRouter;

function SpaRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const target = sessionStorage.getItem('spa-redirect');
    if (target) {
      sessionStorage.removeItem('spa-redirect');
      if (target !== '/' && target !== window.location.pathname) navigate(target, { replace: true });
    }
  }, [navigate]);
  return null;
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

/** A jelenlegi oldal /product-details/product/:slug útvonalának átirányítása. */
function LegacyProduct() {
  const { slug } = useParams();
  return <Navigate to={`/termek/${slug}`} replace />;
}

export default function App() {
  return (
    <Router>
      <CartProvider>
        <a className="skip" href="#main">Ugrás a tartalomra</a>
        <SpaRedirect />
        <ScrollToTop />
        <Header />
        <main id="main">
          <Routes>
            <Route path="/" element={<Navigate to="/kezdolap" replace />} />
            <Route path="/kezdolap" element={<Home />} />
            <Route path="/termekek" element={<Products />} />
            <Route path="/termekek/:category" element={<Products />} />
            <Route path="/termek/:slug" element={<ProductDetail />} />
            <Route path="/rendezveny" element={<Event />} />
            <Route path="/torta-tervezo" element={<CakeBuilder />} />
            <Route path="/informaciok" element={<Info />} />
            <Route path="/kapcsolat" element={<Contact />} />
            <Route path="/kosar" element={<Cart />} />
            <Route path="/penztar" element={<Checkout />} />

            {/* A mostani GHL-oldal URL-jei, hogy a meglévő linkek ne törjenek el */}
            <Route path="/tortak" element={<Navigate to="/termekek/tortak" replace />} />
            <Route path="/browniek" element={<Navigate to="/termekek/browniek" replace />} />
            <Route path="/egyeb-desszertek" element={<Navigate to="/termekek/egyeb-desszertek" replace />} />
            <Route path="/timebox-onfejleszto-termkek" element={<Navigate to="/termekek/timebox-onfejleszto-termekek" replace />} />
            <Route path="/timebox-onfejleszto-termekek" element={<Navigate to="/termekek/timebox-onfejleszto-termekek" replace />} />
            <Route path="/products-list" element={<Navigate to="/termekek" replace />} />
            <Route path="/egyedi-torta-rendeles" element={<Navigate to="/rendezveny" replace />} />
            <Route path="/informaciok-menupont" element={<Navigate to="/informaciok" replace />} />
            <Route path="/contact-us" element={<Navigate to="/kapcsolat" replace />} />
            <Route path="/product-details/product/:slug" element={<LegacyProduct />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <CartDrawer />
      </CartProvider>
    </Router>
  );
}
