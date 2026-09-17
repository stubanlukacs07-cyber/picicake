import { Link } from 'react-router-dom';
import type { Product } from '../data/products';
import { formatFt } from '../lib/format';
import { useCart } from '../lib/cart';
import { Burst, Img } from './Bits';

const BADGE: Record<string, string> = { new: 'Új', seasonal: 'Szezonális' };

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const configurable = Boolean(product.options?.length);
  const sale = product.comparePrice && product.comparePrice > product.price;
  const discount = sale ? Math.round((1 - product.price / product.comparePrice!) * 100) : 0;
  const bestseller = product.badges?.includes('bestseller');
  const hover = product.images[1];

  return (
    <article className="card">
      <div className="card__media">
        <Link to={`/termek/${product.slug}`} aria-label={product.name} style={{ display: 'block', height: '100%' }}>
          <Img src={product.images[0]} alt={product.name} className="card__img card__img--a" />
          {/* Második fotó: ráhúzáskor átvált rá. */}
          {hover && <Img src={hover} alt="" className="card__img card__img--b" />}
        </Link>

        {bestseller && <Burst label="Best seller" />}

        <div className="badges">
          {product.badges?.filter((b) => b !== 'bestseller').map((b) => (
            <span key={b} className={`badge${b === 'new' ? ' badge--new' : ' badge--season'}`}>{BADGE[b]}</span>
          ))}
          {sale && <span className="badge badge--sale">−{discount}%</span>}
        </div>

        {configurable ? (
          <Link to={`/termek/${product.slug}`} className="card__quick">Válassz opciót</Link>
        ) : (
          <button type="button" className="card__quick" onClick={() => add(product, [])}>Add a kosaradhoz</button>
        )}
      </div>

      <div className="card__body">
        <h3 className="card__title"><Link to={`/termek/${product.slug}`}>{product.name}</Link></h3>
        <p className="card__short">{product.short}</p>
        <div className="card__price">
          <span>{configurable ? `${formatFt(product.price)}-tól` : formatFt(product.price)}</span>
          {sale && <del>{formatFt(product.comparePrice!)}</del>}
        </div>
        {product.stock !== undefined && product.stock <= 10 && (
          <span className="card__stock">Már csak {product.stock} db</span>
        )}
      </div>
    </article>
  );
}
