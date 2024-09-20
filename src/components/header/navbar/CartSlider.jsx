// HOOKS
import React, {useState, useEffect, useRef, useContext, useReducer} from 'react';
import {useNavigate} from 'react-router-dom';

// COMPONETNS
import DisplayWebImg from '/src/components/DisplayWebImg';

// SCSS
import '/src/styles/components/header/navbar/CartSlider.scss';

// STORES
import {useCartStore, useOrderStore, useDataStore} from '/src/store/store';

// REDUCERS
import cartReducer from '/src/reducers/cartReducer';

// DATA
// import products from '/src/data/products';

// UTILS
import formatNumberWithCommas from '/src/utils/formatNumberWithCommas';

// ICONS
import closeIcon from '/assets/img/icons/close.svg';
import cartIcon from '/assets/img/icons/shopping_cart.svg';

// ICONS - DARKMODE
import closeIconDarkMode from '/assets/img/icons/close_darkMode.svg';
import cartIconDarkMode from '/assets/img/icons/shopping_cart_darkMode.svg';

function CartSlider ({darkMode, lan}) {

  const {
    cart, 
    toggle: cartToggle, 
    setToggle: setCartToggle, 
    addProductToCart, 
    removeProductFromCart,
  } = useCartStore();
  const setHeadToCheckouts = useOrderStore(state => state.setHeadToCheckouts);
  const headToCheckouts = useOrderStore(state => state.headToCheckouts);
  const { user, products } = useDataStore();
  const cartContainerElement = useRef(null);  
  const sliderElement = useRef(null);
  const cartProductsELS = useRef([]);
  const isInitialMount = useRef(true);

  const navigate = useNavigate();
  const cartEmpty = cart.length === 0;
  const en = lan === 'en';

  let totalPrice = 0;
  cart.forEach(list => (totalPrice += list.quantityPrice));
  const getProductImgURL = product => `/assets/img/products/${product.id}/main.webp`;
  const getProduct = id => products.filter(product => product.id === id)[0];

  useEffect(() => {
    const containerStyle = cartContainerElement.current.style;
    const sliderStyle = sliderElement.current.style;

    switch (cartToggle) {
      case true:
        document.body.style.overflow = 'hidden hidden';
        containerStyle.visibility= 'visible';
        containerStyle.backgroundColor= 'var(--cartSlider-background-color)'
        sliderStyle.transform = 'translateX(0)';
        break;
      case false:
        document.body.style.overflow = 'hidden auto';
        sliderStyle.transform = `translateX(${en ? '' : '-'}30em)`;
        containerStyle.backgroundColor= 'hsla(0, 0%, 0%, 0)';
        setTimeout(() => containerStyle.visibility = 'hidden', 500);
        break;
      default:
        console.error('Error: cartToggle isn\'t a boolean')
    }
  }, [cartToggle, lan])

  const handleClick = e => {
    const {type, productId} = e.target.dataset;
    const getElement = (els, id) => els.filter(el => el.dataset.productId === id)[0];
    const styleProductWhenRemoved = productId => getElement(cartProductsELS.current, productId).style.opacity = '0';

    switch(type) {
      case 'remove_from_cart':
        styleProductWhenRemoved(productId);
        setTimeout(() => removeProductFromCart(getProduct(productId)), 250);
        break;
      case 'increase_amount_by_one':
        addProductToCart(getProduct(productId), 1);
        break;
      case 'decrease_amount_by_one':
        addProductToCart(getProduct(productId), -1);
        break;
      case 'exit_slider':
        setCartToggle(false);
        break;
      case 'nav_to_checkouts':
        setTimeout(() => window.scroll({top: 0, behavior: 'smooth'}), 500);
        setCartToggle(false);
        if (user) {
          navigate('/checkouts');
        } else {
          setHeadToCheckouts(true);
          navigate('/account/login');  
        }
        break;
      case 'nav_to_cart':
        setTimeout(() => window.scroll({top: 0, behavior: 'smooth'}), 500);
        setCartToggle(false);
        navigate('/cart');
        break;
      default:
        console.log('Unknown type: ' + type)
    }
  }

  const addRef = (type, el, i) => {
    const updateElements = (currentArray, el) => currentArray.length < cart.length ? [...currentArray, el] : currentArray;
    
    switch (type) {
      case 'cartProductsELS':
        i === 0 && (cartProductsELS.current = []);
        cartProductsELS.current = updateElements(cartProductsELS.current, el)
        break;
      default:
        console.log('unknown type:' + type);
    }
  }

  return (
    <div className="cartSlider" data-type="exit_slider" onClick={handleClick} ref={cartContainerElement}>
      <div className={`cartSlider__slider${cartEmpty ? ' empty' : ''}`} onClick={e => e.stopPropagation()} ref={sliderElement}>
        <div className="cartSlider__slider__empty">
          <img className="cartSlider__slider__empty__cart" src={darkMode ? cartIconDarkMode : cartIcon}/>
          <div className="cartSlider__slider__empty__note">{en ? 'Your Cart Is Empty' : 'سله التسوق فارغه'}</div>
          <button className="cartSlider__slider__empty__btn" data-type="exit_slider" onClick={handleClick}>{en ? 'Back to shopping' : 'العوده للتسوق'}</button>
        </div>
        <section className="cartSlider__slider__top">
          <div className="cartSlider__slider__top__cart">{en ? 'Cart' : 'السله'}</div>
          <div className="cartSlider__slider__top__quantity">{cart.length}</div>
          <img className="cartSlider__slider__top__exit" data-type="exit_slider" onClick={handleClick} src={darkMode ? closeIconDarkMode : closeIcon} role="button" tabIndex="0"/>
        </section>
        <ul className="cartSlider__slider__products">
          {cart.map((list, i) =>
          <li className="cartSlider__slider__products__product" key={list.id} data-product-id={list.product.id} ref={el => addRef('cartProductsELS', el, i)}>
            <DisplayWebImg className="cartSlider__slider__products__product__image" src={getProductImgURL(list.product)} alt={list.product.title[lan]} loading={i <= 3 ? "eager" : "lazy"} fetchpriority={i <= 3 ? "high" : ""} />
            <a className="cartSlider__slider__products__product__title">{list.product.title[lan]}</a>
            <div className="cartSlider__slider__products__product__price">{en ? 'S.P' : 'ل.س'} {formatNumberWithCommas(list.quantityPrice)}</div>
            <div className="cartSlider__slider__products__product__toggles">
              <button className="cartSlider__slider__products__product__toggles__delete" data-type="remove_from_cart" data-product-id={list.id} onClick={handleClick} /> 
              <button className="cartSlider__slider__products__product__toggles__increment" data-type="increase_amount_by_one" data-product-id={list.id} onClick={handleClick}/>
              <div className="cartSlider__slider__products__product__toggles__value">{list.quantity}</div>
              <button className="cartSlider__slider__products__product__toggles__decrement" data-type="decrease_amount_by_one" data-product-id={list.id} onClick={handleClick}/>
            </div>
          </li>
          )}
        </ul>
        <section className="cartSlider__slider__bottom">
          <div className="cartSlider__slider__bottom__total">{en ? 'Total' : 'اجمالي'} <span>{en ? 'S.P' : 'ل.س'} {formatNumberWithCommas(totalPrice)}</span></div>
          <div className="cartSlider__slider__bottom__shipment">{en ? 'Shipment fee calculated at Checkout' : 'تكاليف الشحن ستضاف عند الدفع'}</div>
          <button className="cartSlider__slider__bottom__view-cart" data-type="nav_to_cart" onClick={handleClick}>{en ? 'View cart' : 'عرض السله'}</button>
          <button className="cartSlider__slider__bottom__checkout" data-type="nav_to_checkouts" onClick={handleClick}>{en ? 'Checkout' : 'الدفع'}</button>
        </section>
      </div>
    </div>
  )
}

export default CartSlider;