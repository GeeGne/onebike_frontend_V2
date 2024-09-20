// HOOKS
import React, {useEffect} from 'react';
import {Link} from 'react-router-dom';

// SCSS
import '/src/styles/components/BreadCrumb.scss';

// Utils
import strSlashSplit from '/src/utils/strSlashSplit.js';
import cleanseString from '/src/utils/cleanseString.js';

function BreadCrumb ({category, type, additional, subject, lan}) {
  return (
    <ul className="breadCrumb-list">
      <li className="breadCrumb-list__item-container">
        <Link className="breadCrumb-list__item-container__link" to="/" tabIndex="0">{lan === 'en' ? 'Home' : 'الرئيسيه'}</Link>
        <span className="breadCrumb-list__item-container__quotation-mark-ornament">&#10095;</span>
      </li>
      {/* {additional &&
        <li className ="breadCrumb-list__item-container">
          <Link className="breadCrumb-list__item-container__link" to={'/' + cleanseString(additional.en)} tabIndex="0">{additional[lan]}</Link> 
        </li> 
      }  
      {type && category &&
        <li className ="breadCrumb-list__item-container">
          <Link className="breadCrumb-list__item-container__link" to={'/' + cleanseString(category.en)} tabIndex="0">{category[lan]}</Link> 
          <span className="breadCrumb-list__item-container__quotation-mark-ornament">&#10095;</span>
          <Link className="breadCrumb-list__item-container__link" to={'/' + cleanseString(category.en) + '/' + cleanseString(type.en)} tabIndex="0">{type[lan]}</Link> 
        </li>
      } 
      {category && !type &&
        <li className ="breadCrumb-list__item-container">
          <Link className="breadCrumb-list__item-container__link" to={'/' + cleanseString(category.en)} tabIndex="0">{category[lan]}</Link> 
        </li> 
      } */}  
      {subject.firstLink ? 
        <li className ="breadCrumb-list__item-container">
          <Link className="breadCrumb-list__item-container__link" to={'/' + subject.firstLink.key} tabIndex="0">{subject.firstLink[lan]}</Link> 
          <span className="breadCrumb-list__item-container__quotation-mark-ornament">&#10095;</span>
          <Link className="breadCrumb-list__item-container__link" to={'/' + subject.firstLink.key + '/' + subject.key} tabIndex="0">{subject[lan]}</Link> 
        </li> 
       : <li className ="breadCrumb-list__item-container">
          <Link className="breadCrumb-list__item-container__link" to={'/' + subject.key} tabIndex="0">{subject[lan]}</Link> 
        </li> 
      } 
    </ul>
  )
}

export default BreadCrumb;