// HOOKS
import React, {useEffect, useState, useRef} from 'react';
import {useNavigate} from 'react-router-dom';

// JSON
import mainListData from '/src/data/menu.json';

// SCSS
import '../../../styles/components/header/navbar/DropMenu.scss';

// UTILS
import cleanseString from '/src/utils/cleanseString.js';

function DropMenu ({darkMode, lan, menu}) {

  const navigate = useNavigate();

  const dropMenuElement = useRef(null);
  const itemsElement = useRef(null);
  const subItemsElement = useRef(null);
  const itemElement = useRef(null);

  useEffect(() => {dropMenuElement.current.style.height = `${menu ? '48' : '0'}px`}, [menu])

  const handleHover = (type, e) => {
    const element = e.currentTarget;
    type ? element.classList.add('hover') : element.classList.remove('hover');
  }

  const handleClick = (e, mainData, thirdData) => {
    e.stopPropagation();
    navigate(`/${cleanseString(mainData)}${thirdData ? '/' + cleanseString(thirdData) : ''}`);
    setTimeout(() => window.scroll({top: 0, behavior: 'smooth'}), 500);
  }
                                                         
  return (
    <section className="drop-menu" ref={dropMenuElement}>
      <ul className="drop-menu__items" ref={itemsElement}>
        {mainListData.map(mainData =>
        <li className='drop-menu__items__item' onClick={(e) => handleClick(e, mainData.en)} onMouseEnter={(e) => handleHover(true, e)} onMouseLeave={(e) => handleHover(false, e)} ref={itemElement} key={mainData.id}>
          <h2 className="drop-menu__items__item__title">{mainData[lan]}</h2>
          <ul className='drop-menu__items__item__sub-items' onMouseEnter={(e) => handleHover(true, e)} onMouseLeave={(e) => handleHover(false, e)} ref={subItemsElement}>
            {mainData.secondaryList.map(secondData => 
            <li className="drop-menu__items__item__sub-items__sub-item" key={secondData.id}>
              <h2 className="drop-menu__items__item__sub-items__sub-item__title">{secondData[lan]}</h2>
              <ul className="drop-menu__items__item__sub-items__sub-item__sub-sub-items">
                {secondData.thirdList.map(thirdData =>
                <li className="drop-menu__items__item__sub-items__sub-item__sub-sub-items__sub-sub-item" onClick={(e) => handleClick(e, mainData.en, thirdData.en)} key={thirdData.id}>
                  <h3 className="drop-menu__items__item__sub-items__sub-item__sub-sub-items__sub-sub-item__title">{thirdData[lan]}</h3>
                </li>
                )}
              </ul>
            </li>
            )}
          </ul>
        </li>
          )}
      </ul>
    </section>
  )
}

export default DropMenu;