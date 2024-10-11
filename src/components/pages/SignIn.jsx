// HOOKS
import React, {useState, useEffect, useRef} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {Helmet} from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from 'react-query';

// COMPONENTS
import Banner from '/src/components/Banner';
import ProgressActivity from '/src/components/ProgressActivity';
import Alert from '/src/components/Alert';

// STORES
import { useOrderStore, useDataStore } from '/src/store/store.js';

// SCSS
import '/src/styles/components/pages/SignIn.scss';

// API
import signin from '/src/api/users/signin';
import checkAuthAndGetProfile from '/src/api/users/checkAuthAndGetProfile';

// UTILS
import validate from '/src/utils/validate';
import Redirector from '/src/utils/Redirector';

function SignIn ({darkMode, lan}) {

  const pageURL = window.location.href;
  const siteName = "ONEBIKE";
  const pageHeadTitle = "Sign In - ONEBIKE";
  const pageDescription = "Sign in to ONEBIKE to manage your orders, view your account details, and enjoy a seamless shopping experience.";
  const pageKeywords = "ONEBIKE, sign in, login, bicycle, bicycle parts, Syria";

  const en = lan === 'en';
  const {href ,pathname} = window.location;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const {headToCheckouts, setHeadToCheckouts} = useOrderStore();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: checkAuthAndGetProfile,
    onSuccess: () => { 
      setTimeout(() => window.scroll({ top: 0, behavior: 'smooth' }), 500);
    },
    onError: () => {
      setAlertText(err.message);
      setNewAlert(Math.random());
    }
  });

  const signinMutation = useMutation({
    mutationFn: signin,
    onMutate: () => {
      setProcessing(true);
    },
    onSettled: () => {
      setProcessing(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user']})
    },
    onError: err => {
      setAlertText(err.message);
      setNewAlert(Math.random());
    }
  });

  const redirector = new Redirector(navigate, headToCheckouts, setHeadToCheckouts);
  const [processing, setProcessing] = useState(false);
  const [newAlert, setNewAlert] = useState(0);
  const [alertText, setAlertText] = useState(null);
  const [forgotPass, setForgotPass] = useState(false);
  const [formData, setFormData] =  useState({
    email: '',
    password: '',
  });

  const emailEL = useRef(null);
  const passEL = useRef(null);

  const emailPopupEL = useRef(null);
  const passPopupEL = useRef(null);

  const emailLabelEL = useRef(null);
  const passLabelEL = useRef(null);

  const pageTitle = forgotPass ? (en ? 'Reset your password' : 'إعادة تعيين كلمة المرور') : (en ? 'LOGIN' : 'تسجيل الدخول');
  const description = forgotPass ? (en ? 'We will send an email to reset your passowrd' : 'سنرسل بريدًا إلكترونيًا لإعادة تعيين كلمة المرور') : '';
  
  useEffect(() => {
    redirector.signin(user, headToCheckouts)
    if (!user && headToCheckouts) {
      setAlertText(en ? 'Almost there! Sign in to finalize your purchase' : 'أنت على وشك الانتهاء! سجل الدخول لإتمام عملية الشراء');
      setNewAlert(Math.random());
    }
  }, [user]);

  const handleSubmit = async e => {

    e.preventDefault();
    setProcessing(true);

    try {
      const isInputsValid = validateInputs();
      if (!isInputsValid) throw new Error ('Not all inputs are valid');

      if (forgotPass) {
        // const isOperationSucessful = await sendPassReset();
        // if (isOperationSucessful) setForgotPass(prevVal => !prevVal) 
        // setProcessing(false);
        return;
      }

      signinMutation.mutate(formData);
    } catch (err) {
      console.error(err.message);
      setProcessing(false);
    }
  }

  const handleChange = e => {
    const {name, value} = e.target;
    setFormData(prevData => ({...prevData, [name]: value.trim()}))
  }

  const handleFocus = e => {
    const {name} = e.target;

    switch (name) {
      case 'email':
        emailEL.current.classList.add('onFocus');
        emailEL.current.classList.remove('error');
        break;
      case 'password':
        passEL.current.classList.remove('error');
        passEL.current.classList.add('onFocus');
      break;
      default:
        console.log('Unknown type:', type);
    }
  }

  const handleBlur = e => {
    const {name} = e.target;
    const inputEmpty = e.target.value === '';

    if (inputEmpty) {
      switch (name) {
        case 'email':
          emailEL.current.classList.remove('onFocus');
          break;
        case 'password':
          passEL.current.classList.remove('onFocus');
          break;
        default:
          console.log('Unknown type:', type);
      }
    }
  }

  const handleClick = e => {
    navigate(path(e.target))
    setTimeout(() => window.scroll({top: 0, behavior: 'smooth'}), 500);
  }

  const handleKeyDown = e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(e);
    }
  }

  const path = el => el.dataset.path;
  const removeError = el => el.classList.remove('error');

  const validateInputs = () => {

    const handleError = (errorMessage, popupEL, formChildEL) => {
      popupEL.textContent = errorMessage;
      formChildEL.classList.add('error');
      formChildEL.scrollIntoView({block: 'center', behavior: 'smooth'});
      return false;      
    }

    const {email, password} = formData;

    if (forgotPass) {
      if (typeof(validate.login.email(email, en)) === 'string') return handleError(validate.login.email(email, en), emailPopupEL.current, emailEL.current);
    } else {
      if (typeof(validate.login.email(email, en)) === 'string') return handleError(validate.login.email(email, en), emailPopupEL.current, emailEL.current);
      if (typeof(validate.login.password(password, en)) === 'string') return handleError(validate.login.password(password, en), passPopupEL.current, passEL.current);
    }

    return true;
  }

  const handleProcessing = text => {
    switch (true) {
      case processing:
        return <ProgressActivity darkMode={darkMode} invert={true} />
      default:
        return text;
    }
  }

  // console.log('user: ', user);

  return (
    <>
      <Helmet>
        <title>{pageHeadTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <meta property="og:title" content={pageHeadTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageURL} />
        {/* <meta property="og:image" content="https://onebike-b622f.web.app/path/to/your/image.jpg" /> */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={siteName} />
      </Helmet>
      <section className='signIn' onSubmit={handleSubmit}>
        <Alert alertText={alertText} newAlert={newAlert} />
        <Banner pageTitle={pageTitle} description={description}/>
        <form className='signIn__form'>
          <div className='signIn__form__email' ref={emailEL}>
            <label htmlFor="email" ref={emailLabelEL}>{en ? 'EMAIL' : 'البريد الالكتروني'}</label>
            <input type="text" name="email" id="email" autoComplete="true" onFocus={handleFocus} onBlur={handleBlur} onChange={handleChange} />
            <div className="signIn__form__email__error-popup" onClick={() => removeError(emailEL.current)} ref={emailPopupEL} />
          </div>
          {!forgotPass && 
          <div className='signIn__form__password' ref={passEL}>
            <label htmlFor="password" ref={passLabelEL}>{en ? 'PASSWORD' : 'كلمه المرور'}</label>
            <input type="password" name="password" id="password" autoComplete="true" onFocus={handleFocus} onBlur={handleBlur} onChange={handleChange} />
            <div className="signIn__form__password__error-popup" onClick={() => removeError(passEL.current)} ref={passPopupEL} />
          </div>}
          {!forgotPass && <button className="forgot-password" tabIndex="0" onClick={() => setForgotPass(prevVal => !prevVal)}>{en ? 'Forgot password?' : 'نسيت كلمه المرور؟'}</button>}
          <button className='signIn__form__submit' type="submit">{handleProcessing(en ? (forgotPass ? 'SUBMIT' : 'SIGN IN') : (forgotPass ? 'ارسال' : 'سجل الدخول'))}</button>
          {!forgotPass && <a className="new-costumer" tabIndex="0" data-path="/account/register" onClick={handleClick} onKeyDown={handleKeyDown}>{en ? 'Don\'t have an account? Join us!' : 'ليس لديك حساب؟ انضم الينا'}</a>}
          {forgotPass && <a className="cancel" tabIndex="0" onClick={() => setForgotPass(prevVal => !prevVal)} onKeyDown={handleKeyDown}>{en ? 'Cancel' : 'الغاء'}</a>}
        </form>
      </section>
    </>
  )
}

export default SignIn;