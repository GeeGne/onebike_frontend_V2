// HOOKS
import React, {useEffect, useState, useRef, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';

// SCSS
import '/src/styles/components/pages/admin/ContentManagementTable.scss';

// COMPONENTS
import AddProductWindow from '/src/components/pages/admin/AddProductWindow';
import DisplayWebImg from '/src/components/DisplayWebImg';
import DisplayImg from '/src/components/DisplayImg';
import Alert from '/src/components/Alert';
import ProgressActivity from '/src/components/ProgressActivity';

// HOOKS
import useFetchUserData from '/src/hooks/useFetchUserData';
import useFetchProductsData from '/src/hooks/useFetchProductsData';

// API
import updateProduct from '/src/api/products/updateProduct';
import deleteProduct from '/src/api/products/deleteProduct';
import getAllProducts from '/src/api/products/getAllProducts';
import checkAuthAndGetProfile from '/src/api/users/checkAuthAndGetProfile';

// STORE
import { useDataStore } from '/src/store/store';

// FIREBASE
import { db } from '/src/firebase/fireStore';
import { getDoc, doc, collection, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { storage } from '/src/firebase/storage';
import { ref, uploadBytes } from "firebase/storage";

// JSON
import menu from '/src/data/menu.json';
import brands from '/src/data/brands.json';

// UTILS
import calculateDiscountPercantage from '/src/utils/calculateDiscountPercantage';
import formatNumberWithCommas from '/src/utils/formatNumberWithCommas';

// REDUCERS
import deleteWindowReducer from '/src/reducers/deleteWindowReducer';

function ContentManagementTable ({darkMode, lan}) {

  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: getAllProducts
  })

  const { data: user } = useQuery({
    queryKey: ['user', 'auth', 'profile', 'orders'],
    queryFn: checkAuthAndGetProfile
  });
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onMutate: () => {
      setActivity(true);
    },
    onSettled: () => {
      setActivity(false);
      setNewAlert(Math.random());
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      styleWhenDeletProduct(data.index);
      setAlertText(en ? 'Success! product is deleted' : 'تم حذف المنتج بنجاح!')
    },
    onError: () => {
      setAlertText(en ? 'Error deleting product' : 'حصل خطأ في حذف المنتج')
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onMutate: () => {
      setActivity(true);
    },
    onSettled: () => {
      setActivity(false);
      setNewAlert(Math.random());
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      clearInputsAndCloseTab(data.index);
      setAlertText(en ? 'Success! changes has been saved to the product' : 'تم حفظ التغييرات على المنتج بنجاح!')
    },
    onError: () => {
      setAlertText(en ? 'Error updaing product' : 'حصل خطأ في تعديل المنتج')
    }
  });

  // const { user, userData, products, setRefreshProducts } = useDataStore();
  const [ typeItmArray, setTypeItmArray ] = useState([]);
  const [ deleteWindow, dispatch ] = useReducer(deleteWindowReducer, {
    toggle: '',
    productId: '',
    index: '',
  });
  const [ newAlert, setNewAlert ] = useState(0);
  const [ alertText, setAlertText ] = useState(null);
  const [ activity, setActivity ] = useState(false);
  const [ toggleAddProductWindow, setToggleAddProductWindow ] = useState('');

  const handleToggleAddProductWindow = data => setToggleAddProductWindow(data);
  const refreshTimerId = useRef(null);
  const itemELRefs = useRef([]);
  const itemInfoELRefs = useRef([]);
  const itemEditELRefs = useRef([]);

  const titleEnInptELRefs = useRef([]);
  const titleArInptELRefs = useRef([]);
  const priceInptELRefs = useRef([]);
  const discountInptELRefs = useRef([]);
  const imgInptELRefs = useRef([]);

  const itemStateContELRefs = useRef([]);
  const itemStateInptELRefs = useRef([]);

  const categoryContELRefs = useRef([]);
  const categoryInptELRefs = useRef([]);

  const brandContELRefs = useRef([]);
  const brandInptELRefs = useRef([]);
  
  const typeContELRefs = useRef([]);
  const typeLstELRefs = useRef([]);
  const typeInptELRefs = useRef([]);

  const overflowTimerId = useRef(null);
  const en = lan === 'en';
  const navigate = useNavigate();
  const getProduct = productId => products.find(item => String(item.id) === productId);

  const addTypeItmtHTML = i => {
    const isTypeItmSelected = typeItmArray.some(item => Number(item.index) === i);

    if (isTypeItmSelected) {
      let array = [];

      const getTheKey = typeItmArray.filter(list => i === list.index)[0];
      const getTheCategory = menu.filter(list => list.key === getTheKey.key)[0];
      const getTypes = getTheCategory.secondaryList.forEach(list => list.thirdList.forEach(list => array = [...array, list]));

      return array.map((item, index) => 
        <li className="cm__lst__itm__edit-cont__type-cont__lst__itm" key={index} data-index={i} data-action="type_option_is_clicked" data-key={item.key} onClick={handleClick}>{item[lan]}</li>
      ) 

    } else {
      return <li className="cm__lst__itm__edit-cont__type-cont__lst__itm">{en ? 'Please Select a Category' : 'الرجاء اختيار صنف'}</li> 
    }
  }

  const renderLoadingState = (textContent, boolean) => {
    if (activity) {
      return <ProgressActivity darkMode={darkMode} invert={boolean} />
    } else {
      return textContent;
    }
  }

  const getColorForState = state => {
    switch (state) {
      case 'available':
        return ' green';
      case 'out-of-stock':
        return ' yellow';
      case 'hidden':
        return  ' red';
      default:
        console.error('Error: unknown state: ', state);
        return '';
    }
  }
  const getProductImgURL = id => `${import.meta.env.VITE_BACKEND_URI}/uploads/images/products/${id}/front_default.webp`;

  const clearInputsAndCloseTab = index => {
    const findElement = ref => ref.filter(el => Number(el.dataset.index) === Number(index))[0];
    const isElementClicked = el => el.classList.contains('clicked');
    const totalHeight = el => el.scrollHeight;

    findElement(titleEnInptELRefs.current).value = '';
    findElement(titleArInptELRefs.current).value = '';
    findElement(priceInptELRefs.current).value = '';
    findElement(discountInptELRefs.current).value = '';
    findElement(categoryInptELRefs.current).value = '';
    findElement(typeInptELRefs.current).value = '';
    findElement(itemStateInptELRefs.current).value = '';
    findElement(brandInptELRefs.current).value = '';
    findElement(imgInptELRefs.current).value = '';

    findElement(itemELRefs.current).classList.toggle('clicked');
    if (isElementClicked( findElement(itemELRefs.current) )) {
      findElement(itemELRefs.current).style.maxHeight = String( totalHeight(findElement(itemELRefs.current)) ) + 'px';
      clearTimeout(overflowTimerId.current);
      overflowTimerId.current = setTimeout(() => findElement(itemELRefs.current).style.overflow = 'visible', 250);
    } else {
      clearTimeout(overflowTimerId.current);
      findElement(itemELRefs.current).style.maxHeight = String( totalHeight(findElement(itemInfoELRefs.current)) ) + 'px';
      findElement(itemELRefs.current).style.overflow = 'hidden';
    }
  }

  const styleWhenDeletProduct = async index => {

    const findElement = ref => ref.find(el => el.dataset.index === index);

    findElement(itemELRefs.current).style.opacity= '0';
    setTimeout(() => findElement(itemELRefs.current).style.opacity= '1', 500)
  }
  
  useEffect(() => {
    const setItemHeights = () => {
      itemELRefs.current.forEach((el, i) => {
        el.style.maxHeight = String(itemInfoELRefs.current[i].scrollHeight) + 'px';
        el.style.overflow = 'hidden';
      });  
    }

    if (products) setItemHeights();
  }, []);

  const handleClick = e => {
    const { action, index, key, productId } = e.currentTarget.dataset;

    const findElement = ref => ref.find(el => Number(el.dataset.index) === Number(index));
    const isELClicked = el => el.classList.contains('clicked');
    const totalHeight = el => el.scrollHeight;
    const getProduct = () => products.find(item => String(item.id) === productId);
    const getTextContent = el => el.textContent;

    switch(action) {
      case 'edit_button_is_clicked':
        findElement(itemELRefs.current).classList.toggle('clicked');

        if (isELClicked(findElement(itemELRefs.current))) {
          findElement(itemELRefs.current).style.maxHeight = String( totalHeight(findElement(itemELRefs.current)) ) + 'px';
          clearTimeout(overflowTimerId.current);
          overflowTimerId.current = setTimeout(() => findElement(itemELRefs.current).style.overflow = 'visible', 250);
        } else {
          clearTimeout(overflowTimerId.current);
          findElement(itemELRefs.current).style.maxHeight = String( totalHeight(findElement(itemInfoELRefs.current)) ) + 'px';
          findElement(itemELRefs.current).style.overflow = 'hidden';
        }
        break;
      case 'delete_button_is_clicked':
        dispatch({type: action, productId, index});
        break;
      case 'add_product_button_is_clicked':
        setToggleAddProductWindow(' show');
        break;
      case 'itemState_option_is_clicked':
        findElement(itemStateInptELRefs.current).value = getTextContent(e.currentTarget);
        findElement(itemStateInptELRefs.current).dataset.key = key;
        break;
      case 'category_option_is_clicked':
        findElement(categoryInptELRefs.current).value = getTextContent(e.currentTarget);
        findElement(categoryInptELRefs.current).dataset.key = key;
        setTypeItmArray(prevArr => [...prevArr.filter(item => item.index !== Number(index)), {index: Number(index), key}]);
        findElement(typeInptELRefs.current).value = '';
        break;
      case 'type_option_is_clicked':
        findElement(typeInptELRefs.current).value = getTextContent(e.currentTarget);
        findElement(typeInptELRefs.current).dataset.key = key;
        break;
      case 'brand_option_is_clicked':
        findElement(brandInptELRefs.current).value = getTextContent(e.currentTarget);
        findElement(brandInptELRefs.current).dataset.key = key;
        break;
      case 'save_button_is_clicked':
        const productData = {
          id: Number(productId),
          title_en: findElement(titleEnInptELRefs.current).value || getProduct().title_en,
          title_ar: findElement(titleArInptELRefs.current).value || getProduct().title_ar,
          category: findElement(categoryInptELRefs.current).dataset.key || getProduct().category,
          type: findElement(typeInptELRefs.current).dataset.key || getProduct().type,
          face: 'front',
          color: 'default',
          state: findElement(itemStateInptELRefs.current).dataset.key || getProduct().state,
          brand: findElement(brandInptELRefs.current).dataset.key === 'none' 
            ? '' 
            : findElement(brandInptELRefs.current).dataset.key || getProduct().brand || '',
          price: Number(findElement(priceInptELRefs.current).value) || getProduct().price,
          discount: findElement(discountInptELRefs.current).value.includes('%') 
            ? findElement(discountInptELRefs.current).value
            : Number(findElement(discountInptELRefs.current).value) || getProduct().discount,
        }
        const img = findElement(imgInptELRefs.current).files[0] || false;
        updateProductMutation.mutate({ productData, img, index });
        break;
      case 'window_wrapper_is_clicked':
        e.stopPropagation()
        break;
      case 'window_background_is_clicked':
      case 'cancel_window_button_is_clicked':
        dispatch({type: action})
        break;
      case 'delete_window_button_is_clicked':
        dispatch({type: action});
        deleteProductMutation.mutate({productId, index});
        break;
      
      default:
        console.error('Error: unknown action: ', action);
    }
  }

  const handleFocus = e => {
    const {type, index} = e.currentTarget.dataset;
    const getEL = el => el.find(el => Number(el.dataset.index) === Number(index));

    switch (type) {
      case 'item_state_input':
        getEL(itemStateContELRefs.current).classList.add('focus');
        break;
      case 'category_input':
        getEL(categoryContELRefs.current).classList.add('focus');
        break;
      case 'type_input':
        getEL(typeContELRefs.current).classList.add('focus');
        break;
      case 'brand_input':
        getEL(brandContELRefs.current).classList.add('focus');
        break;
      default:
        console.error('Error: unknown type: ', type)
    }
  }

  const handleBlur = e => {
    const {type, index} = e.currentTarget.dataset;
    const getEL = el => el.filter(el => Number(el.dataset.index) === Number(index))[0];

    switch (type) {
      case 'item_state_input':
        setTimeout(() => getEL(itemStateContELRefs.current).classList.remove('focus'), 100);
        break;
      case 'category_input':
        setTimeout(() => getEL(categoryContELRefs.current).classList.remove('focus'), 100);
        break;
      case 'type_input':
        setTimeout(() => getEL(typeContELRefs.current).classList.remove('focus'), 100);
        break;
      case 'brand_input':
        setTimeout(() => getEL(brandContELRefs.current).classList.remove('focus'), 100);
        break;
      default:
        console.error('Error: unknown type: ', type)
    }    
  }

  // console.log('user', user);
  // console.log('userData', userData);
  // console.log('itemELRefs', itemELRefs.current);
  // console.log('products', products);
  // console.log('typeItmArray', typeItmArray);
  // console.log('deleteWindow', deleteWindow);

  return (
    <section className="cm">
      <AddProductWindow toggle={toggleAddProductWindow} toggleData={handleToggleAddProductWindow} darkMode={darkMode} lan={lan} />
      <div className={`cm__delete-window${deleteWindow.toggle}`} data-action="window_background_is_clicked" onClick={handleClick}>
        <div className="cm__delete-window__wrapper" data-action="window_wrapper_is_clicked" onClick={e => e.stopPropagation()}>
          <h2 className="cm__delete-window__wrapper__title">{en ? 'User confirmation Needed' : 'مطلوب تأكيد المستخدم'}</h2>
          <span className="cm__delete-window__wrapper__description">{`${en ? 'Delete' : 'مسح'} "${deleteWindow.productId && getProduct(deleteWindow.productId)[en ? 'title_en' : 'title_ar']}" ${en ? '?' : '؟'}`}</span>
          <button className="cm__delete-window__wrapper__cancel-btn" data-action="cancel_window_button_is_clicked" onClick={handleClick}>{en ? 'Cancel' : 'الغاء'}</button>
          <button className="cm__delete-window__wrapper__delete-btn" data-product-id={deleteWindow.productId} data-index={deleteWindow.index} data-action="delete_window_button_is_clicked" onClick={handleClick}>{renderLoadingState(en ? 'Delete' : 'مسح', false)}</button>          
        </div>
      </div>
      <div className="cm__header-row">
        <button className="cm__header-row__addProduct-btn" aria-label="Add a Product to Products" data-action="add_product_button_is_clicked" onClick={handleClick} />
        <span className="cm__header-row__spn">{en ? 'Name' : 'الاسم'}</span>
        <span className="cm__header-row__spn">{en ? 'ID' : 'رمز'}</span>
        <span className="cm__header-row__spn">{en ? 'price' : 'السعر'}</span>
      </div>
      <ul className="cm__lst">
        <Alert alertText={alertText} newAlert={newAlert} />
        {products?.map((item, i) => 
        <li className="cm__lst__itm" key={i} data-index={i} ref={el => itemELRefs.current[i] = el}>
          <div className="cm__lst__itm__info-cont" data-index={i} ref={el => itemInfoELRefs.current[i] = el}>
            <div className="cm__lst__itm__info-cont__name-cont">
              <div className={`cm__lst__itm__info-cont__name-cont__state${getColorForState(item.state)}`} />
              <DisplayWebImg className="cm__lst__itm__info-cont__name-cont__img" src={getProductImgURL(item.id)} alt={item[en ? 'title_en' : 'title_ar']} loading="lazy" refresh={products} />
              {/* <DisplayImg className="cm__lst__itm__info-cont__name-cont__img" src={getProductImgURL(item.id)} alt={item[en ? 'title_en' : 'title_ar']} loading="lazy" /> */}
              <span className="cm__lst__itm__info-cont__name-cont__title">{en ? item.title_en : item.title_ar}</span>
            </div>
            <div className="cm__lst__itm__info-cont__id-cont">
              <span className="cm__lst__itm__info-cont__id-cont__id">{item.id}</span>
            </div>
            <div className="cm__lst__itm__info-cont__price-cont">
              <span className="cm__lst__itm__info-cont__price-cont__price">{formatNumberWithCommas(item.price)}</span>{' - '}
              <span className="cm__lst__itm__info-cont__price-cont__discount" data-index={i}>{item.discount ? calculateDiscountPercantage(item.price, item.discount) : '--'}</span>
            </div>
            <div className="cm__lst__itm__info-cont__toggles-cont">
              <button className="cm__lst__itm__info-cont__toggles-cont__delete-btn" aria-label="Delete Item" data-action="delete_button_is_clicked" data-index={i} data-product-id={item.id} onClick={handleClick} />
              <button className="cm__lst__itm__info-cont__toggles-cont__edit-btn" aria-label="Edit Item" data-action="edit_button_is_clicked" data-index={i} onClick={handleClick} />
            </div> 
          </div>
          <div className="cm__lst__itm__edit-cont" data-index={i} ref={el => itemEditELRefs.current[i] = el}>
            <div className="cm__lst__itm__edit-cont__priceTitle-cont">
              <span className="cm__lst__itm__edit-cont__priceTitle-cont__price-spn">{en ? 'Price' : 'السعر'}</span>
              <span className="cm__lst__itm__edit-cont__priceTitle-cont__priceVal-spn">{formatNumberWithCommas(item.price)}</span>{' / '}
              <span className="cm__lst__itm__edit-cont__priceTitle-cont__discountVal-spn">{item.discount ? calculateDiscountPercantage(item.price, item.discount) : '--'}</span>
            </div>
            <div className="cm__lst__itm__edit-cont__categoryTitle-cont">
              <span className="cm__lst__itm__edit-cont__categoryTitle-cont__category-spn">{en ? 'Category' : 'التصنيف'}</span>
              <span className="cm__lst__itm__edit-cont__categoryTitle-cont__categoryVal-spn">{item.category}</span>{' / '}
              <span className="cm__lst__itm__edit-cont__categoryTitle-cont__typeVal-spn">{item.type}</span>
            </div>
            <div className="cm__lst__itm__edit-cont__stateBrandTitle-cont">
              <span className="cm__lst__itm__edit-cont__stateBrandTitle-cont__stateBrand-spn">{en ? 'State & Brand' : 'الحاله & الماركه'}</span>
              <span className="cm__lst__itm__edit-cont__stateBrandTitle-cont__stateVal-spn">{item.state}</span>{' / '}
              <span className="cm__lst__itm__edit-cont__stateBrandTitle-cont__brandVal-spn">{item.brand || '--'}</span>
            </div>
            <div className="cm__lst__itm__edit-cont__nameTitle-cont">
              <span className="cm__lst__itm__edit-cont__nameTitle-cont__name-spn">{en ? 'Name' : 'الاسم'}</span>
              <span className="cm__lst__itm__edit-cont__nameTitle-cont__enVal-spn">{item.title_en}</span>{' / '}
              <span className="cm__lst__itm__edit-cont__nameTitle-cont__arVal-spn">{item.title_ar}</span>
            </div>
            <input className="cm__lst__itm__edit-cont__nameEn-inpt" name="titleEn" data-index={i} placeholder={en ? "name in english" : "الاسم بلانجليزي"} ref={el => titleEnInptELRefs.current[i] = el} />
            <input className="cm__lst__itm__edit-cont__nameAr-inpt" name="titleAr" data-index={i} placeholder={en ? "name in arabic" : "الاسم بلعربي"} ref={el => titleArInptELRefs.current[i] = el} />
            <input className="cm__lst__itm__edit-cont__price-inpt" name="price" data-index={i} placeholder={en ? "price" : "السعر"} ref={el => priceInptELRefs.current[i] = el} />
            <input className="cm__lst__itm__edit-cont__img-inpt" name="img" type="file" data-index={i} placeholder={en ? "discount" : "التخفيض"} ref={el => imgInptELRefs.current[i] = el} />
            <input className="cm__lst__itm__edit-cont__discount-inpt" name="discount" data-index={i} placeholder={en ? "discount" : "التخفيض"} ref={el => discountInptELRefs.current[i] = el} />
            <div className="cm__lst__itm__edit-cont__itemState-cont" ref={el => itemStateContELRefs.current[i] = el} data-index={i}>
              <input className="cm__lst__itm__edit-cont__itemState-cont__inpt" name="state" placeholder={en ? "Item State" : "حاله المنتج"} data-type="item_state_input" data-index={i} readOnly onFocus={handleFocus} onBlur={handleBlur} ref={el => itemStateInptELRefs.current[i] = el} />
              <ul className="cm__lst__itm__edit-cont__itemState-cont__lst">
                <li className="cm__lst__itm__edit-cont__itemState-cont__lst__itm" data-index={i} data-action="itemState_option_is_clicked" data-key="available" onClick={handleClick}>{en ? 'Availabe' : 'متاح'}</li>
                <li className="cm__lst__itm__edit-cont__itemState-cont__lst__itm" data-index={i} data-action="itemState_option_is_clicked" data-key="out-of-stock" onClick={handleClick}>{en ? 'Out of stock' : 'غير متوفر'}</li>
                <li className="cm__lst__itm__edit-cont__itemState-cont__lst__itm" data-index={i} data-action="itemState_option_is_clicked" data-key="hidden" onClick={handleClick}>{en ? 'Hidden' : 'مخفي'}</li>
              </ul>
            </div>
            <div className="cm__lst__itm__edit-cont__category-cont" ref={el => categoryContELRefs.current[i] = el} data-index={i}>
              <input className="cm__lst__itm__edit-cont__category-cont__inpt" name="category" placeholder={en ? "Gategory" : "صنف"} data-type="category_input" data-index={i} readOnly onFocus={handleFocus} onBlur={handleBlur} ref={el => categoryInptELRefs.current[i] = el} />
              <ul className="cm__lst__itm__edit-cont__category-cont__lst">
              {menu.map(item => 
                <li className="cm__lst__itm__edit-cont__category-cont__lst__itm" key={item.id} data-index={i} data-action="category_option_is_clicked" data-key={item.key} onClick={handleClick}>{item[lan]}</li>
              )}
              </ul>
            </div>
            <div className="cm__lst__itm__edit-cont__brand-cont" ref={el => brandContELRefs.current[i] = el} data-index={i}>
              <input className="cm__lst__itm__edit-cont__brand-cont__inpt" name="brand" placeholder={en ? "Brand" : "ماركه"} data-type="brand_input" data-index={i} readOnly onFocus={handleFocus} onBlur={handleBlur} ref={el => brandInptELRefs.current[i] = el} />
              <ul className="cm__lst__itm__edit-cont__brand-cont__lst">
              <li className="cm__lst__itm__edit-cont__brand-cont__lst__itm" data-index={i} data-action="brand_option_is_clicked" data-key="none" onClick={handleClick}>{en ? 'none' : 'لايوجد'}</li>
              {brands.map(item => 
                <li className="cm__lst__itm__edit-cont__brand-cont__lst__itm" key={item.id} data-index={i} data-action="brand_option_is_clicked" data-key={item.key} onClick={handleClick}>{item.brand}</li>
              )}
              </ul>
            </div>
            <div className="cm__lst__itm__edit-cont__type-cont" ref={el => typeContELRefs.current[i] = el} data-index={i}>
              <input className="cm__lst__itm__edit-cont__type-cont__inpt" name="type" placeholder={en ? "Type" : "نوع"} data-type="type_input" data-index={i} readOnly onFocus={handleFocus} onBlur={handleBlur} ref={el => typeInptELRefs.current[i] = el} />
              <ul className="cm__lst__itm__edit-cont__type-cont__lst" data-index={i} ref={el => typeLstELRefs.current[i] = el}>
                {addTypeItmtHTML(i)}
              </ul>
            </div>
            <button className="cm__lst__itm__edit-cont__save-btn" data-index={i} data-action="save_button_is_clicked" data-product-id={item.id} onClick={handleClick}>{renderLoadingState(en ? 'Save' : 'حفظ', true)}</button>
          </div>
        </li>
        )}
      </ul>
    </section>
  )
}


export default ContentManagementTable;

