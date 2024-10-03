// HOOKS
import React, {useEffect, useState, useRef } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';

// SCSS
import '/src/styles/components/pages/admin/Admin.scss';

// COMPONENTS
import ContentManagementTable from '/src/components/pages/admin/ContentManagementTable';
import GeneralSettingsTable from '/src/components/pages/admin/GeneralSettingsTable';
import OrdersManagementTable from '/src/components/pages/admin/OrdersManagementTable';
import BreadCrumb from '/src/components/BreadCrumb';
import DisplayWebImg from '/src/components/DisplayWebImg';
import Alert from '/src/components/Alert';
import ProgressActivity from '/src/components/ProgressActivity';

// JSON
import menu from '/src/data/menu.json';

// UTILS
import Redirector from '/src/utils/Redirector';

function Admin ({darkMode, lan}) {

  // const { userData, products, setRefreshProducts } = useDataStore();
  const { data: user } = useQuery('user');
  const [ newAlert, setNewAlert ] = useState(0);
  const [ alertText, setAlertText ] = useState(null);
  const [ tab, setTab ] = useState('content-management');

  const contentBtnEL = useRef(null);
  const generalBtnEL = useRef(null);
  const ordersBtnEL = useRef(null);

  const en = lan === 'en';
  const navigate = useNavigate();
  const redirector = new Redirector(navigate);
  const titleTab = () => {
    switch (tab) {
      case 'content-management':
      return en ? 'Content Management' : 'اداره المحتوى';
      case 'general-settings':
      return en ? 'General Settings' : 'الاعدادات العامه';
      case 'orders-management':
      return en ? 'Orders Management' : 'اداره الطلبات';
    }
  }

  const descriptionTab = () => {
    switch (tab) {
      case 'content-management':
      return <ContentManagementTable darkMode={darkMode} lan={lan} />;
      case 'general-settings':
      return <GeneralSettingsTable darkMode={darkMode} lan={lan} />;
      case 'orders-management':
      return <OrdersManagementTable darkMode={darkMode} lan={lan} />;
    }
  }

  useEffect(() => {
    redirector.admin(user);
  }, [user]);

  const handleClick = e => {
    const { action } = e.currentTarget.dataset;

    const removeClickedClassFromButtons = () => {
      contentBtnEL.current.classList.remove('clicked');
      generalBtnEL.current.classList.remove('clicked');
      ordersBtnEL.current.classList.remove('clicked');
    }

    switch (action) {
      case "content_button_is_clicked":
        setTab('content-management');
        removeClickedClassFromButtons();
        contentBtnEL.current.classList.add('clicked');
        break;
      case "general_button_is_clicked":
        setTab('general-settings');
        removeClickedClassFromButtons();
        generalBtnEL.current.classList.add('clicked');
        break;
      case "orders_button_is_clicked":
        setTab('orders-management');
        removeClickedClassFromButtons();
        ordersBtnEL.current.classList.add('clicked');
        break;
    }
  }

  return (
    <div className="admin">
      <Alert alertText={alertText} newAlert={newAlert} />
      <section className="admin__breadCrumb-sec">
        <BreadCrumb subject={ { firstLink: { key: 'account', en: 'Account', ar: 'الحساب' }, key: 'admin', en: 'Admin', ar: 'ادمن' }} lan={lan} />
      </section>
      <section className="admin__title-sec">
        <h1 className="admin__title-sec__h1">{titleTab()}</h1>
        <button className="admin__title-sec__content-btn clicked" aria-label="Open Content Management Tab" data-action="content_button_is_clicked" onClick={handleClick} ref={contentBtnEL} />
        <button className="admin__title-sec__general-btn" aria-label="Open General Settings Tab" data-action="general_button_is_clicked" onClick={handleClick} ref={generalBtnEL} />
        <button className="admin__title-sec__orders-btn" aria-label="Open Orders Management Tab" data-action="orders_button_is_clicked" onClick={handleClick} ref={ordersBtnEL} />
      </section>
      <section className="admin__description-sec">{descriptionTab()}</section>
    </div>
  )
}

export default Admin;