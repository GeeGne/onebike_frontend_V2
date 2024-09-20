// HOOKS
import React, {useState, useRef, useEffect} from 'react';
import {useSearchParams} from 'react-router-dom';

// COMPONENTS
import DisplayWebImg from '/src/components/DisplayWebImg';
import Alert from '/src/components/Alert';

// SCSS
import '/src/styles/components/SearchResultsPanel.scss';

// DATA
// import products from '/src/data/products.json';

// FUSE
import Fuse from 'fuse.js';

// STORE
import {useCartStore, useDataStore} from '/src/store/store';

// UTILS
import formatNumberWithCommas from '/src/utils/formatNumberWithCommas';
import calculatePrice from '/src/utils/calculatePrice';


function SearchResultsPanel ({darkMode, lan}) {

  const { products } = useDataStore();
  const { addProductToCart } = useCartStore();
  const [ newAlert, setNewAlert ] = useState(0);
  const [ alertText, setAlertText ] = useState(null); 
  const [ searchParams, setSearchParams ] = useSearchParams();
  const [ searchFor, setSearchFor ] = useState('');
  const [ searchResults, setSearchResults ] = useState([]);
  const [ toggleSearch, setToggleSearch ] = useState(false);
  const [ fuse, setFuse ] = useState(null);

  const panelEL = useRef(null);
  const searchVisTimerId = useRef(null);

  const totalResults = searchResults.length;
  const isResultsAreNone = searchResults.length === 0;
  const isProductsLoaded = products.length !== 0;
  const en = lan === "en";
  const getProductImgURL = product => `/assets/img/products/${product.id}/main.webp`;
  const getProductPrice = product => formatNumberWithCommas(calculatePrice(product.price, product.discount));
  const isProductInWishlist = product => wishlist.some(item => item.id === product.id);
  const getProduct = id => products.find(product => product.id === id);

  useEffect(() => {
    const options = {
      keys: ['title.en', 'title.ar', 'category', 'type'],
      threshold: 0.3
    };

    if (isProductsLoaded) setFuse(new Fuse(products, options));
  }, [products]);

  useEffect(() => {
    let url = new URL(window.location.href);
    const newParam = new URLSearchParams(searchParams);
    const searchVal = newParam.get('search');

    if (searchVal === '' || searchVal === null) {
      url.searchParams.delete('search');
      window.history.pushState({}, '', url);
      setToggleSearch(false);
      return;
    }

    setToggleSearch(true);
    setSearchFor(searchVal);
    window.scroll({top: 0, behavoir:'instant'});
    panelEL.current.scroll({top: 0, behavoir:'instant'});
    document.body.style.overflow = 'hidden hidden';

  }, [searchParams]);

  useEffect(() => {
    const hanldeSearchToggle = boolean => {
      const containerStyle = panelEL.current.style;

      switch (boolean) {
        case true:
          document.body.style.overflow = 'hidden hidden';
          containerStyle.visibility= 'visible';
          containerStyle.opacity= '1'
          break;
        case false:
          document.body.style.overflow = 'hidden auto';
          containerStyle.opacity= '0';
          setTimeout(() => containerStyle.visibility = 'hidden', 250);
          break;
        default:
          console.error('Error: cartToggle isn\'t a boolean') 
      } 
    }

    clearTimeout(searchVisTimerId.current);
    searchVisTimerId.current = setTimeout(() => hanldeSearchToggle(toggleSearch), 300);
  }, [toggleSearch]);

  useEffect(() => {
    const handleSearch = query => {
      if (!fuse) return;
      const results = fuse.search(query);
      setSearchResults(results.map(result => result.item).filter(item => item.state === "available"));
    }

    handleSearch(searchFor);
  }, [searchFor, fuse]);

  const handleClick = e => {
    const {action, productId} = e.currentTarget.dataset;

    switch (action) {
      case 'exit_panel':
        let url = new URL(window.location.href);
        
        url.searchParams.delete('search');
        window.history.pushState({}, '', url);
        setToggleSearch(false);
        break;
      case 'add_product_to_cart':
        const amount = 1;
        addProductToCart(getProduct(productId), amount);
        setAlertText(`${en ? '' : 'تم اضافه'} ${getProduct(productId).title[lan]} ${en ? 'is added to Cart!' : 'الى السله!'}`);
        setNewAlert(Math.random());
        break;
      default:
        console.error('Error: Unknown Type: ', action);
    }
  }

  return (
    <div className="panel" ref={panelEL}>
      <Alert alertText={alertText} newAlert={newAlert} />
      <div className="panel__content-cont">
        <span className="panel__content-cont__searchingFor-spn --shift-to-left unpause">{en ? 'Search Results for' : 'نتائج البحث عن'} '{searchFor}'</span>
        {isResultsAreNone 
        ? <div className="panel__content-cont__noResults --shift-to-left unpause">
          <p className="panel__content-cont__noResults__title">{en ? 'No results found.' : 'لم يتم العثور على نتائج.'}</p>
          <p className="panel__content-cont__noResults__description">
            {en ? 'Looks like we couldn\'t find any matches for your search.' : 'يبدو أننا لم نتمكن من العثور على أي نتائج لبحثك.'} 
          </p>
          <p className="panel__content-cont__noResults__suggestion">
            {en ? 'Here are a few things you can try:' : 'إليك بعض الأشياء التي يمكنك تجربتها:'}
          </p>
          <ul className="panel__content-cont__noResults__list">
            <li className="panel__content-cont__noResults__list__item">{en ? 'Check your spelling and try again.' : 'تحقق من الإملاء وحاول مرة أخرى.'}</li>
            <li className="panel__content-cont__noResults__list__item">{en ? 'Try using different or more general keywords.' : 'جرب استخدام كلمات رئيسية مختلفة أو أكثر عمومية.'}</li>
            <li className="panel__content-cont__noResults__list__item">{en ? 'Double-check for typos or incorrect terms.' : 'تحقق من وجود أخطاء مطبعية أو مصطلحات غير صحيحة.'}</li>
            <li className="panel__content-cont__noResults__list__item">{en ? 'Try browsing through the categories or popular items.' : 'حاول التصفح عبر الفئات أو العناصر الشائعة.'}</li>
          </ul>
          <p className="panel__content-cont__noResults__support">
            {en ? 'If you\'re still having trouble, feel free to contact our support team for assistance.' : 'إذا كنت لا تزال تواجه مشكلة، فلا تتردد في الاتصال بفريق الدعم للحصول على المساعدة.'}
          </p>
        </div>
        : <><ul className="panel__content-cont__searchResults-cont">
          <li className="panel__content-cont__searchResults-cont__foundedAmount --shift-to-left unpause">{totalResults} {en ? 'search reslults are found' : 'نتائج تم العثور من البحث'}</li>
          {searchResults.map(item => 
          <li className="panel__content-cont__searchResults-cont__result --shift-to-left unpause" key={item.id}>
            <DisplayWebImg className="panel__content-cont__searchResults-cont__result__img" src={getProductImgURL(item)} alt={item.title[lan]} loading="lazy" />
            <span className="panel__content-cont__searchResults-cont__result__title">{item.title[lan]}</span>
            <span className="panel__content-cont__searchResults-cont__result__price">{en ? 'S.P ' : 'ل.س'} {getProductPrice(item)}</span>
            <button className="panel__content-cont__searchResults-cont__result__addToCart-btn" data-action="add_product_to_cart" data-product-id={item.id} onClick={handleClick}>{en ? 'Add To Cart' : 'اضف الى السله'}</button>
          </li>
          )}
        </ul></>
        }
        <button className="panel__content-cont__searchResults-cont__exit-btn" data-action="exit_panel" onClick={handleClick}>{en ? 'EXIT' : 'خروج'}</button>
      </div>
    </div>
  )
}

export default SearchResultsPanel;