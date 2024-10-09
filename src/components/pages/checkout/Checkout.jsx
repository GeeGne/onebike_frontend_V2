// HOOKS
import React, { useState, useRef, useEffect, useContext, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';

// FIREBASE
import {db} from '/src/firebase/fireStore';
import {setDoc, updateDoc, getDoc, doc} from 'firebase/firestore';

// COMPONENTS
import OrderSummary from '/src/components/pages/checkout/OrderSummary';
import OrderCompleteLayout from '/src/components/pages/checkout/OrderCompleteLayout';
import ProgressActivity from '/src/components/ProgressActivity';
import Alert from '/src/components/Alert';

// DATA
import oneBike, {citiesAndShippingFee, emailJS} from '/src/data/one-bike.json';

// SCSS
import '/src/styles/components/pages/checkout/Checkout.scss';

// api
import checkAuthAndGetProfile from '/src/api/users/checkAuthAndGetProfile';

// STORE
import {useCartStore, useOrderStore, useDataStore} from '/src/store/store';

// REDUCERS
import orderReducer from '/src/reducers/orderReducer';

// UTILS 
import validate from '/src/utils/validate';
import Redirector from '/src/utils/Redirector';
import {CartContext} from '/src/utils/myContext.js';
import formatNumberWithCommas from '/src/utils/formatNumberWithCommas';
import getCurrentDateFormat from '/src/utils/getCurrentDateFormat';
import generateOrderProductsHTML from '/src/utils/generateOrderProductsHTML';
import formatPhoneNumber from '/src/utils/formatPhoneNumber';

// NANOID
import {nanoid} from 'nanoid';

// EMAILJS
import emailjs from '@emailjs/browser';

// ASSETS
import infoIcon from '/assets/img/icons/info.svg';
import infoDarkModeIcon from '/assets/img/icons/info_darkMode.svg';
import keyboardArrowDropDownPrimaryColor from '/assets/img/icons/keyboard_arrow_down_primaryColor.svg';
import keyboardArrowDropDownSecondaryColor from '/assets/img/icons/keyboard_arrow_down_secondaryColor.svg';
import adjustIcon from '/assets/img/icons/adjust.svg';

// ASSETS - DARK MODE
import adjustDarkModeIcon from '/assets/img/icons/adjust_darkMode.svg';

function Checkout ({darkMode, lan}) {

  const pageURL = window.location.href;
  const siteName = "ONEBIKE";
  const pageTitle = "Checkout - ONEBIKE";
  const pageDescription = "Complete your purchase at ONEBIKE. Secure and easy checkout for bicycles and bicycle parts.";
  const pageKeywords = "ONEBIKE, checkout, purchase, bicycle, bicycle parts, secure checkout, Syria";

  const en = lan === 'en';
  emailjs.init({publicKey: emailJS.publicKey});
  const navigate = useNavigate();

  const { data: user } = useQuery(['user'], checkAuthAndGetProfile);

  // const { user, setRefreshUserData } = useDataStore();
  const [ processing, setProcessing ] = useState(false);
  const [ newAlert, setNewAlert ] = useState(0);
  const [ alertText, setAlertText ] = useState(null);
  const { orderState, setOrderState } = useOrderStore(); 
  const { cart, resetCart } = useCartStore();
  const [ order, dispatch ] = useReducer(orderReducer, {
    orderId: nanoid(12),
    costumer: {
      costumerId: '',
      fullName: '',
      email: '',
      phone: ''
    },
    shippingAddress: {
      city: '',
      addressDetails: '',
      secondAddress: '',
      trackingNumber: `TRACK${nanoid(12)}`
    },
    products: [],
    orderDate: getCurrentDateFormat(),
    shippingCost: 0,
    subtotal: 0,
    total: 0,
    orderStatus: 'On schedule',
    notes: ''
  });
  const totalProducts = order.products.length;
  const [cityDelivery, setCityDelivery] = useState('');
  useEffect(() => {
    if (!isInputDefault.current) return;
    setCityDelivery(en ? 'Pick your City' : 'اختر مدينتك')
  }, [lan])
  const redirect = new Redirector(navigate);

  const orderUpdatedDateAndId = useRef(null);

  const orderSummaryTopEL = useRef(null);
  const orderSummaryTopShowEL = useRef(null);
  const orderSummaryTopShowArrowEL = useRef(null);
  const orderSummaryTopShowTextEL = useRef(null);

  const orderSummaryBottomEL = useRef(null);
  const orderSummaryBottomShowEL = useRef(null);
  const orderSummaryBottomShowArrowEL = useRef(null);
  const orderSummaryBottomShowTextEL = useRef(null);

  const cityInpContEL = useRef(null);
  const cityInpEL = useRef(null);
  const cityErrorPopupEL = useRef(null);

  const phoneSecEL = useRef(null);
  const defaultNumberRadioEL = useRef(null);
  const newNumberRadioEL = useRef(null);
  const phoneNumberConInpEL = useRef(null);
  const phoneNumberInpEL = useRef(null);
  const phoneNumberLblEL = useRef(null);
  const phoneNumberErrorPopupEL = useRef(null);
  
  const addressDetailsConInpEL = useRef(null);
  const addressDetailsInpEL = useRef(null);
  const addressDetailsLblEL = useRef(null);
  const addressDetailsErrorPopupEL = useRef(null);

  const secondAddressConInpEL = useRef(null);
  const secondAddressInpEL = useRef(null);
  const secondAddressLblEL = useRef(null);
  const secondAddressErrorPopupEL = useRef(null);

  const notesConInpEL = useRef(null);
  const notesInpEL = useRef(null);
  const notesLblEL = useRef(null);
  const notesErrorPopupEL = useRef(null);

  const isInputDefault = useRef(true);

  // console.log({orderState});
  // console.log({user, user, order});
  useEffect(() => redirect.checkout(user), [user]);
  useEffect(() => {
    dispatch({type: 'update_costumer', user})
    
    if (user?.addressDetails) {
      addressDetailsInpEL.current.focus();
      addressDetailsInpEL.current.value = user?.addressDetails;
    }

    if (user?.secondAddress) {
      secondAddressInpEL.current.focus();
      secondAddressInpEL.current.value = user?.secondAddress;
    }

    if (user?.notes) {
      notesInpEL.current.focus();
      notesInpEL.current.value = user?.notes;
    }

  }, [user]);
  useEffect(() => dispatch({type: 'update_products', cart}), [cart]);

  const deliverInfoTextContent = () => en 
    ? 'Choose your city to tailor the delivery options and provide you with the best service based on your location.' 
    : 'اختر مدينتك لتخصيص خيارات التوصيل وتوفير أفضل خدمة بناءً على موقعك.';  
  const phoneInfoTextContent = () => en 
    ? 'We use your phone number to contact you regarding your purchase. This ensures we can provide important updates, confirm order details, and address any questions or issues that may arise during the processing and delivery of your order.' 
    : 'نستخدم رقم هاتفك للتواصل معك بشأن عملية الشراء. هذا يضمن أننا يمكننا تقديم التحديثات الهامة، تأكيد تفاصيل الطلب، ومعالجة أي أسئلة أو مشكلات قد تنشأ خلال معالجة وتوصيل طلبك.';  
  const shippingInfoTextContent = () => en 
    ? 'We use your shipping address to deliver your order promptly and accurately. Please ensure that the address provided is complete and correct to avoid any delivery delays' 
    : 'نستخدم عنوان الشحن الخاص بك لتوصيل طلبك بسرعة وبدقة. يرجى التأكد من أن العنوان المقدم كامل وصحيح لتجنب أي تأخيرات في التسليم.';

  const handleClick = async e => {
    e.stopPropagation();

    const validateInputs = () => {

      const handleError = (errorMessage, popupEL, inpLblContEL) => {
        popupEL.textContent = errorMessage;
        inpLblContEL.classList.add('error');
        inpLblContEL.scrollIntoView({block: 'center', behavior: 'smooth'});
        return false;      
      }
  
      const {phone} = order.costumer;
      const {addressDetails} = order.shippingAddress;
      const {phone: regPhone, addressDetails: regAddressDetails} = validate.placeOrder;
      const isDefaultNumberChecked = defaultNumberRadioEL.current.checked;
      const isNewNumberChecked = newNumberRadioEL.current.checked;

      if (order.shippingCost === 0) return handleError(en ? 'please pick your City' : 'ارجاء قم باختيار مدينتك', cityErrorPopupEL.current, cityInpContEL.current);
      if (!isDefaultNumberChecked && !isNewNumberChecked) {
        phoneSecEL.current.classList.add('error');
        phoneSecEL.current.scrollIntoView({block: 'center', behavior: 'smooth'});
        return false;    
      }
      if (typeof(regPhone(phone, en)) === 'string' && isNewNumberChecked) {
        phoneSecEL.current.classList.add('error-noDescription');
        phoneSecEL.current.scrollIntoView({block: 'center', behavior: 'smooth'});
        return handleError(regPhone(phone, en), phoneNumberErrorPopupEL.current, phoneNumberConInpEL.current)
      };
      if (typeof(regAddressDetails(addressDetails, en)) === 'string') return handleError(regAddressDetails(addressDetails, en), addressDetailsErrorPopupEL.current, addressDetailsConInpEL.current);
  
      return true;
    }
  
    const closeAndStyleTopOrder = (orderSummaryShowHeight, mainEL, arrowEL, textEL) => {
      mainEL.style.maxHeight = String(orderSummaryShowHeight) + 'px';
      arrowEL.style.transform = 'rotate(0deg)';
      textEL.style.fontWeight = '400';
      textEL.textContent = en? 'Show order summary' : 'عرض ملخص الطلب';
    }

    const expandAndStyleTopOrder = (orderSummaryHeight, mainEL, arrowEL, textEL) => {
      mainEL.style.maxHeight = String(orderSummaryHeight) + 'px';
      arrowEL.style.transform = 'rotate(180deg)';
      textEL.style.fontWeight = '600';
      textEL.textContent = en? 'Hide order summary' : 'اخفاء ملخص الطلب';
    }

    const closeAndStyleBottomOrder = (mainEL, arrowEL, textEL) => {
      mainEL.style.maxHeight = '0';
      arrowEL.style.transform = 'rotate(0deg)';
      textEL.textContent = en? 'Show' : 'عرض';
    }

    const expandAndStyleBottomOrder = (orderSummaryHeight, mainEL, arrowEL, textEL) => {
      mainEL.style.maxHeight = String(orderSummaryHeight) + 'px';
      arrowEL.style.transform = 'rotate(180deg)';
      textEL.textContent = en? 'Hide' : 'اخفاء';
    }

    const submitData = async () => {
      orderUpdatedDateAndId.current = {...order, orderId: nanoid(12), orderDate: getCurrentDateFormat()};

      const personalData = {
        phone: order.costumer.phone,
        addressDetails: order.shippingAddress.addressDetails,
        secondAddress: order.shippingAddress.secondAddress,
        notes: order.notes,
      }

      try {
        const ordersCollectionRef = doc(db, 'users', user.uid, 'orders', orderUpdatedDateAndId.current.orderId);
        await setDoc(ordersCollectionRef, orderUpdatedDateAndId.current);

        const usertRef = doc(db, "users", user.uid);
        await updateDoc(usertRef, personalData);

        setRefreshUserData(Math.random());
        return true;
      } catch(err) {
        console.log('Error: not able to write the order data');
        return false;
      }
    }

    const sendOrderEmail = async () => {
      const productsText = generateOrderProductsHTML(orderUpdatedDateAndId.current, 'b');
      try {
        const result = await emailjs.send(
          emailJS.serviceId,
          emailJS.templateId.a,
          {
            order: JSON.stringify(orderUpdatedDateAndId.current),
            orderId: orderUpdatedDateAndId.current.orderId,
            orderDate: orderUpdatedDateAndId.current.orderDate,
            orderStatus: order.orderStatus,
            notes: order.notes,
            subtotal: formatNumberWithCommas(order.subtotal),
            shippingCost: formatNumberWithCommas(order.shippingCost),
            total: formatNumberWithCommas(order.total),
            costumerId: order.costumer.costumerId,
            fullName: order.costumer.fullName,
            email: order.costumer.email,
            phone: formatPhoneNumber(order.costumer.phone),
            city: order.shippingAddress.city,
            addressDetails: order.shippingAddress.addressDetails,
            secondAddress: order.shippingAddress.secondAddress,
            trackingNumber: order.shippingAddress.trackingNumber,
            products: productsText,
          }
        );
        console.log('Order notification email sent successfully', result.text);
      } catch (error) {
        console.error('Error sending order notification email:', error);
      }
    };

    const updateUserData = async (personalData) => {
      setActivity(true);
  
      try {
        const productRef = doc(db, "users", user.uid);
        await updateDoc(productRef, personalData);
  
        if (imgFile.current) {
          const storageRef = ref(storage, getnewUserImgURL());
          await uploadBytes(storageRef, imgFile.current);
        }
    
        setRefreshUserData(Math.random());
        setAlertText(en ? 'Success! Your Personal Data is Updated' : 'تم تحديث بياناتك الشخصية بنجاح!')
      } catch(err) {
        console.error('Error updating perosnal data: ', err);
        setAlertText(en ? 'Error updating Persoanl Data' : 'خطأ في تحديث البيانات الشخصية')
      } finally {
        setNewAlert(Math.random());
        setActivity(false);  
      }
    }
  

    const toggleExpandDataATT = (el, expand) => el.dataset.expand = String(!expand);
    const {type, shippingCost, city} = e.currentTarget.dataset;
    let isElementExpanded;       
    let orderSummaryHeight;      
    let orderSummaryShowHeight;
    let mainEL;
    let arrowEL;
    let textEL;

    switch (type) {
      case 'submit_button_is_clicked':
        try {
          setProcessing(true);

          const isProductsEmpty = order.products.length === 0;
          if (isProductsEmpty) throw new Error('empty_cart');
          
          const isValidationSuccessful = validateInputs();
          if (!isValidationSuccessful) throw new Error('validation_failed');

          const isSubmitSuccessful = await submitData();
          if (!isSubmitSuccessful) throw new Error('submit_failed');

          await sendOrderEmail();
          resetCart();
          setOrderState(true);
        } catch (err) {
          console.error('Order submission error:', err);

          switch(err.message) {
            case 'empty_cart':
              setAlertText(en ? 'Error: Your Cart is empty': 'خطأ: سلة التسوق فارغة');
              break;
            case 'validation_failed':
              setAlertText(en ? 'Error: Please check your input': 'خطأ: يرجى التحقق من المدخلات');
              break;
            case 'submit_failed':
              setAlertText(en ? 'Error: Failed to submit order' : 'خطأ: فشل في تقديم الطلب');
              break;
            default:
              setAlertText(en ? 'An unexpected error occurred' : 'حدث خطأ غير متوقع');
          }

          setNewAlert(Math.random());
        } finally {
          setProcessing(false);
        }
        break;
      case 'toggle_orderSummary':
        isElementExpanded = e.currentTarget.dataset.expand === 'false' ? false : true;
        orderSummaryShowHeight = orderSummaryTopShowEL.current.scrollHeight;
        orderSummaryHeight = orderSummaryTopEL.current.scrollHeight;
        mainEL = orderSummaryTopEL.current;
        arrowEL = orderSummaryTopShowArrowEL.current;
        textEL = orderSummaryTopShowTextEL.current;
    
        if (isElementExpanded) {
          closeAndStyleTopOrder(orderSummaryShowHeight, mainEL, arrowEL, textEL);
        } else {
          expandAndStyleTopOrder(orderSummaryHeight, mainEL, arrowEL, textEL);
        }
        toggleExpandDataATT(e.currentTarget, isElementExpanded);
        break;
      case 'toggle_bottom_orderSummary':
        isElementExpanded = e.currentTarget.dataset.expand === 'false' ? false : true;
        orderSummaryHeight = orderSummaryBottomEL.current.scrollHeight;
        mainEL = orderSummaryBottomEL.current;
        arrowEL = orderSummaryBottomShowArrowEL.current;
        textEL = orderSummaryBottomShowTextEL.current;

        if (isElementExpanded) {
          closeAndStyleBottomOrder(mainEL, arrowEL, textEL);
        } else {
          expandAndStyleBottomOrder(orderSummaryHeight, mainEL, arrowEL, textEL);
        }
        toggleExpandDataATT(e.currentTarget, isElementExpanded);
        break;  
      case 'update_shipping_fee_and_inp':
        const selectedCity = e.target.textContent;
        isInputDefault.current = false;
        setCityDelivery(selectedCity);
        dispatch({type, shippingCost: Number(shippingCost), city})
        break;
      case 'city_inp_to_focus':
        cityInpEL.current.focus();
        break;
      case 'remove_error-popup':
        cityInpEL.current.focus();
        break;
      default:
        console.error('Error: Unknown type: ' + type);
    }
  }

  const handleFocus = e => {
    const {name} = e.currentTarget;

    switch (name) {
      case 'city':
        setTimeout(() => cityInpContEL.current.classList.add('focus'), 100);
        setTimeout(() => cityInpContEL.current.classList.remove('error'), 100);
        break;
      case 'phone':
        const isValueEmpty = phoneNumberInpEL.current.value === '';
        if (isValueEmpty) phoneNumberInpEL.current.value = '+963 ';
        phoneNumberConInpEL.current.classList.add('focus');
        phoneNumberConInpEL.current.classList.remove('error');
        phoneSecEL.current.classList.remove('error-noDescription');
        break;
      case 'addressDetails':
        addressDetailsConInpEL.current.classList.add('focus');
        addressDetailsConInpEL.current.classList.remove('error');
        break;
      case 'secondAddress':
        secondAddressConInpEL.current.classList.add('focus');
        secondAddressConInpEL.current.classList.remove('error');
        break;
      case 'notes':
        notesConInpEL.current.classList.add('focus');
        notesConInpEL.current.classList.remove('error');
        break;
      default:
        console.error('Error: Unknown name: ', name);
    }
  };

  const handleBlur = e => {
    const {name} = e.currentTarget
    const isInputEmpty = e.target.value === '';

    if (!isInputEmpty && name !== 'city') return;

    switch (name) {
      case 'city':
        setTimeout(() => cityInpContEL.current.classList.remove('focus'), 100);
        break;
      case 'phone':
        phoneNumberConInpEL.current.classList.remove('focus');
        break;
      case 'addressDetails':
        addressDetailsConInpEL.current.classList.remove('focus');
        break;
      case 'secondAddress':
        secondAddressConInpEL.current.classList.remove('focus');
        break;
      case 'notes':
        notesConInpEL.current.classList.remove('focus');
        break;
      default:
        console.error('Error: Unknown type: ', type);
    }
  };

  const handleChange = e => {
    const {type} = e.currentTarget.dataset
    let {name, value} = e.currentTarget;
    let phone;

    switch (name) {
      case 'phoneOptions':
        if (type === 'default_number_is_selected') {
          phone = user?.phone;
          dispatch({type, phone});
          phoneSecEL.current.classList.remove('error');
          phoneSecEL.current.classList.remove('error-noDescription');
          phoneNumberConInpEL.current.classList.remove('error');
          phoneNumberConInpEL.current.style.maxHeight= '0px'
          setTimeout(() => {
            phoneNumberInpEL.current.style.opacity = '0';
            phoneNumberInpEL.current.style.transform = 'translateY(0.3em)';
            phoneNumberLblEL.current.style.opacity = '0';
            phoneNumberLblEL.current.style.transform = 'translateY(calc(-50% + 0.3em))';
            phoneNumberInpEL.current.value = '';
            phoneNumberConInpEL.current.classList.remove('focus');
          }, 250);
        } else if (type === 'new_number_is_selected') {
          dispatch({type: 'phone', phone: ''})
          phoneNumberConInpEL.current.style.maxHeight = phoneNumberConInpEL.current.scrollHeight +'px';
          phoneSecEL.current.classList.remove('error');
          phoneSecEL.current.classList.remove('error-noDescription');
          phoneNumberConInpEL.current.classList.remove('error');
          setTimeout(() => {
            phoneNumberInpEL.current.style.opacity = '1';
            phoneNumberInpEL.current.style.transform = 'translateY(0)';
            phoneNumberLblEL.current.style.opacity = '1';
            phoneNumberLblEL.current.style.transform = 'translateY(-50%)';
          }, 350);  
        }
        break;
      case 'phone':
      case 'addressDetails':
      case 'secondAddress':
      case 'notes':
        if (name === 'phone') {
          let phone = formatPhoneNumber(value);
          value = phone;
          phoneNumberInpEL.current.value = phone;
        }
        dispatch({type: name, [name]: value.trim()})
        break;
      default:
        console.error('Error Unknown name:', name);
    }
  }

  const handleProcessing = text => {
    switch (true) {
      case processing:
        return <ProgressActivity darkMode={darkMode} invert={true} />
      default:
        return text;
    }
  }

  const removeErrorPopup = el => el.classList.remove('error');

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageURL} />
        {/* <meta property="og:image" content="https://onebike-b622f.web.app/path/to/your/image.jpg" /> */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteName} />
      </Helmet>
      <div className="checkout">
        <Alert alertText={alertText} newAlert={newAlert} />
        <OrderCompleteLayout darkMode={darkMode} lan={lan} />
        <section className="checkout__orderSummary-sec" ref={orderSummaryTopEL}>
          <div className="checkout__orderSummary-sec__show" role="button" tabIndex="0" data-expand="false" data-type="toggle_orderSummary" onClick={handleClick} ref={orderSummaryTopShowEL}>
            <span className="checkout__orderSummary-sec__show__text" ref={orderSummaryTopShowTextEL}>{en ? 'Show order summary' : 'عرض ملخص الطلب'}</span>
            <img className="checkout__orderSummary-sec__show__arrow" src={darkMode ? keyboardArrowDropDownSecondaryColor : keyboardArrowDropDownPrimaryColor} ref={orderSummaryTopShowArrowEL} />
            <span className="checkout__orderSummary-sec__show__total">{en ? 'S.P ' : 'ل.س '}{formatNumberWithCommas(order.total + order.shippingCost)}</span>
          </div>
          <OrderSummary darkMode={darkMode} lan={lan} order={order} hidePrices={false} />
        </section>
        <section className="checkout__orderSummary-largeLayout-sec">
          <span className="checkout__orderSummary-largeLayout-sec__title">{en ? 'Order summary' : 'ملخص الطلب'}</span>
          <OrderSummary darkMode={darkMode} lan={lan} order={order} hidePrices={false} />
        </section>
        <section className="checkout__delivery-sec"> 
          <label className="checkout__delivery-sec__lbl" htmlFor="delivery">{en ? 'Deliver to' : 'الشحن الى'}</label>
          <div className="checkout__delivery-sec__info-cont">
            <img className="checkout__delivery-sec__info-cont__img" src={darkMode ? infoDarkModeIcon : infoIcon} />
            <span className="checkout__delivery-sec__info-cont__description">{deliverInfoTextContent()}</span>
          </div>
          <div className="checkout__delivery-sec__inp-cont" data-type="city_inp_to_focus" onClick={handleClick} ref={cityInpContEL}> 
            <input className="checkout__delivery-sec__inp-cont__inp" value={cityDelivery} type="text" id="delivery" readOnly name="city" data-type="city_inp" onFocus={handleFocus} onBlur={handleBlur} ref={cityInpEL}/>
            <div className="checkout__delivery-sec__inp-cont__error-popup" onClick={() => removeErrorPopup(cityInpContEL.current)} ref={cityErrorPopupEL} />
            <ul className="checkout__delivery-sec__inp-cont__lst">
              {citiesAndShippingFee.map(item => 
                <li className="checkout__delivery-sec__inp-cont__lst__itm" key={item.id} data-type="update_shipping_fee_and_inp" data-shipping-cost={item.fee} data-city={item.city.en} onClick={handleClick}>{item.city[lan]}</li>          
              )}
            </ul>
          </div>
          <div className="checkout__delivery-sec__fee-cont">
            <span className="checkout__delivery-sec__fee-cont__shipping-fee">{en ? 'Shipping fee:' : 'رسوم الشحن'}</span>
            <span className="checkout__delivery-sec__fee-cont__total">{order.shippingCost === 0 ? '--' : ((en ? 'S.P ' : 'ل.س ') + formatNumberWithCommas(order.shippingCost))}</span>
          </div>
        </section>
        <section className="checkout__phone-sec" ref={phoneSecEL}>
          <h2 className="checkout__phone-sec__h2">{en ? 'Contact Phone Number' : 'رقم الهاتف للتواصل'}</h2>
          <div className="checkout__phone-sec__info-cont">
            <img className="checkout__phone-sec__info-cont__img" src={darkMode ? infoDarkModeIcon : infoIcon} />
            <span className="checkout__phone-sec__info-cont__description">{phoneInfoTextContent()}</span>
          </div>
          <div className="checkout__phone-sec__radio-cont">
            <input className="checkout__phone-sec__radio-cont__inp" type="radio" id="existed-number" name="phoneOptions" data-type="default_number_is_selected" onChange={handleChange} ref={defaultNumberRadioEL}/>    
            <label className="checkout__phone-sec__radio-cont__lbl" htmlFor="existed-number">
              <span className="checkout__phone-sec__radio-cont__lbl__txt">{en ? 'Use the Number from your personal account' : 'استخدم رقم الهاتف من حسابك الشخصي'}</span>
              <div className="checkout__phone-sec__radio-cont__lbl__phone-popup-cont" >
                <span className="checkout__phone-sec__radio-cont__lbl__phone-popup-cont__number">{formatPhoneNumber(user?.phone)}</span>
                <img className="checkout__phone-sec__radio-cont__lbl__phone-popup-cont__img" src={darkMode ? adjustDarkModeIcon : adjustIcon} />
              </div>
            </label>
          </div>
          <div className="checkout__phone-sec__radio-cont">
            <input className="checkout__phone-sec__radio-cont__inp" type="radio" id="new-number" name="phoneOptions" data-type="new_number_is_selected" onChange={handleChange} ref={newNumberRadioEL}/>
            <label className="checkout__phone-sec__radio-cont__lbl" htmlFor="new-number">{en ? 'Use another Phone Number' : 'استخدم رقم هاتف آخر'}</label>
          </div>
          <div className="checkout__phone-sec__number-cont" ref={phoneNumberConInpEL}>
            <label className="checkout__phone-sec__number-cont__lbl" htmlFor="phone" ref={phoneNumberLblEL}>{en ? 'Phone Number' : 'رقم الهاتف'}</label>
            <input className="checkout__phone-sec__number-cont__inp" type="text" id="phone" name="phone" onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} ref={phoneNumberInpEL} />
            <div className="checkout__phone-sec__number-cont__error-popup" onClick={() => removeError(phoneNumberConInpEL.current)} ref={phoneNumberErrorPopupEL} />
          </div>
        </section>
        <section className="checkout__shipping-address-sec">
          <h2 className="checkout__shipping-address-sec__h2">{en ? 'Shipping Address' : 'عنوان الشحن'}</h2>
          <div className="checkout__shipping-address-sec__info-cont">
            <img className="checkout__shipping-address-sec__info-cont__img" src={darkMode ? infoDarkModeIcon : infoIcon} />
            <span className="checkout__shipping-address-sec__info-cont__description">{shippingInfoTextContent()}</span>
          </div>
          <div className="checkout__shipping-address-sec__lbl-inp-cont" ref={addressDetailsConInpEL}>
            <label className="checkout__shipping-address-sec__lbl-inp-cont__lbl" htmlFor="address" ref={addressDetailsLblEL}>{en ? 'Address Details' : 'تفاصيل العنوان'}</label>
            <input className="checkout__shipping-address-sec__lbl-inp-cont__inp" type="text" id="address" name="addressDetails" onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} ref={addressDetailsInpEL} />
            <div className="checkout__shipping-address-sec__lbl-inp-cont__error-popup" onClick={() => removeError(addressDetailsConInpEL.current)} ref={addressDetailsErrorPopupEL} />
          </div>
          <div className="checkout__shipping-address-sec__lbl-inp-cont" ref={secondAddressConInpEL}>
            <input className="checkout__shipping-address-sec__lbl-inp-cont__inp" type="text" id="secondAddress" name="secondAddress" onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} ref={secondAddressInpEL} />
            <label className="checkout__shipping-address-sec__lbl-inp-cont__lbl" htmlFor="secondAddress" ref={secondAddressLblEL}>{en ? 'Second Address (optional)' : 'العنوان الثاني (اختياري)'}</label>
            <div className="checkout__shipping-address-sec__lbl-inp-cont__error-popup" onClick={() => removeError(secondAddressConInpEL.current)} ref={secondAddressErrorPopupEL} />
          </div>
          <div className="checkout__shipping-address-sec__lbl-inp-cont" ref={notesConInpEL}>
            <label className="checkout__shipping-address-sec__lbl-inp-cont__lbl" htmlFor="notes" ref={notesLblEL}>{en ? 'Notes (optional)' : 'ملاحظات (اختياري)'}</label>
            <input className="checkout__shipping-address-sec__lbl-inp-cont__inp" type="text" id="notes" name="notes" onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} ref={notesInpEL} />
            <div className="checkout__shipping-address-sec__lbl-inp-cont__error-popup" onClick={() => removeError(notesConInpEL.current)} ref={notesErrorPopupEL} />
          </div>
        </section>
        <section className="checkout__orderSummary-bottom-sec">
          <div className="checkout__orderSummary-bottom-sec__show" role="button" tabIndex="0" data-expand="false" data-type="toggle_bottom_orderSummary" onClick={handleClick} ref={orderSummaryBottomShowEL}>
            <h2 className="checkout__orderSummary-bottom-sec__show__h2">{(en ? 'Order summary' : 'ملخص الطلب') + ` (${totalProducts})`}</h2>
            <span className="checkout__orderSummary-bottom-sec__show__show" ref={orderSummaryBottomShowTextEL}>{en ? 'Show' : 'عرض'}</span>
            <img className="checkout__orderSummary-bottom-sec__show__arrow" src={darkMode ? keyboardArrowDropDownSecondaryColor : keyboardArrowDropDownPrimaryColor} ref={orderSummaryBottomShowArrowEL} />
          </div>
          <div className="checkout__orderSummary-bottom-sec__orderList" ref={orderSummaryBottomEL}>
            <OrderSummary darkMode={darkMode} lan={lan} order={order} hidePrices={true} />
          </div>
          <div className="checkout__orderSummary-bottom-sec__subtotal">
            <span className="checkout__orderSummary-bottom-sec__subtotal__text">{en ? 'Subtotal' : 'المجموع الفرعي'}</span>
            <span className="checkout__orderSummary-bottom-sec__subtotal__amount">{en ? 'S.P ' : ' ل.س '} {formatNumberWithCommas(order.subtotal)}</span>
          </div>              
          <div className="checkout__orderSummary-bottom-sec__shipping">
            <span className="checkout__orderSummary-bottom-sec__shipping__text">{en ? 'Shipping' : 'الشحن'}</span>
            <span className="checkout__orderSummary-bottom-sec__shipping__amount">{order.shippingCost === 0 ? '--' : (en ? 'S.P ' : ' ل.س ') + formatNumberWithCommas(order.shippingCost)}</span>
          </div>      
          <div className="checkout__orderSummary-bottom-sec__total">
            <span className="checkout__orderSummary-bottom-sec__total__text">{en ? 'Total' : 'الاجمالي'}</span>
            <span className="checkout__orderSummary-bottom-sec__total__amount">{en ? 'S.P ' : ' ل.س '} {formatNumberWithCommas(order.total)}</span>
          </div>      
        </section>
        <button className="checkout__place-order-btn" data-type="submit_button_is_clicked" onClick={handleClick}>{handleProcessing(en ? 'Place Order' : 'إتمام الطلب')}</button>
      </div>
    </>
  )
}

export default Checkout;