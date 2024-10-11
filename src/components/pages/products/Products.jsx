// HOOKS
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';

// COMPONENTS
import BreadCrumb from '../../BreadCrumb';
import Controls from './Controls';
import EmptyList from './EmptyList';
import AdvertList from './AdvertList';
import NeedHelp from '../../NeedHelp';

// api
import getAllProducts from '/src/api/products/getAllProducts';

// SCSS
import '/src/styles/components/pages/products/Products.scss';

// JSON

// UTILS
import capitalizeFirstLetter from '/src/utils/capitalizeFirstLetter.js';
import cleanseString from '/src/utils/cleanseString.js';

// STORE 
import { useDataStore } from '/src/store/store';

function Products ({ subject, darkMode, lan }) {

  const [refreshProductsImg, setRefreshProductImg] = useState(0);
  const { data } = useQuery({
    queryKey: ['products'],
    queryFn: getAllProducts,
    onSuccess: () => {
      setRefreshProductImg(Math.random());
    }
  });
  const products = data || [];

  const pageURL = window.location.href;
  const matchedProducts = products.filter(product => subject.value === 'discount' 
    ? product[subject.value] 
    : product[subject.value] === subject.key
  );
  const totalProducts = matchedProducts.length;

  return (

    <>
      <Helmet>
        <title>Products - Quality Bicycles and Bicycle Parts for Sale | ONEBIKE</title>
        <meta name="description" content="Explore a wide range of quality bicycles and bicycle parts for sale at ONEBIKE. Find the best deals on bikes, components, and accessories in Syria." />
        <meta name="keywords" content="bicycles, bicycle parts, bike accessories, bike sale, ONEBIKE, quality bikes, bicycle components" />
        <meta name="author" content="ONEBIKE" />
        
        <meta property="og:title" content="Products - Quality Bicycles and Bicycle Parts for Sale | ONEBIKE" />
        <meta property="og:description" content="Explore a wide range of quality bicycles and bicycle parts for sale at ONEBIKE. Find the best deals on bikes, components, and accessories in Syria." />
        <meta property="og:image" content="https://yourwebsite.com/path/to/your-image.jpg" />
        <meta property="og:url" content="https://yourwebsite.com/products" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="ONEBIKE" />
        
        <link rel="canonical" href={pageURL} />
      </Helmet>
      <div className="products-container">
        <section className="products-container__breadCrumb-container">
          {/* <BreadCrumb category={category} type={type} additional={additional} lan={lan}/> */}
          <BreadCrumb subject={subject} lan={lan}/>
        </section>
        <section className="products-container__category-title-container">
          <h1 className="products-container__category-title-container__h1">{subject[lan]}</h1>
          <h3 className="products-container__category-title-container__result">&#10088;{lan === 'en' ? totalProducts + ' results' : totalProducts + ' نتيجه'}&#10089;</h3>
        </section>
        <Controls darkMode={darkMode} lan={lan}/>
        {totalProducts === 0 
          ? <>
            {/* <EmptyList darkMode={darkMode} lan={lan} productCategoryEN={cleanseString(productCategoryEN)} productCategory={productCategory}/>  */}
            <EmptyList darkMode={darkMode} lan={lan} subject={subject} /> 
            <NeedHelp darkMode={darkMode} lan={lan} /></>
          : <AdvertList darkMode={darkMode} lan={lan} matchedProducts={matchedProducts} products={products} refreshProductsImg={refreshProductsImg} />
        }
      </div>
    </>
  )
}

export default Products;