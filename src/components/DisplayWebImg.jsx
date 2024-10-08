import React, {useEffect, useState, useRef, useMemo} from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '/src/firebase/storage';

// ASSETS
import emptyLayout1 from '/assets/img/empty/empty(3).webp';
import emptyLayout2 from '/assets/img/empty/empty(2).webp';

function DisplayWebImg ({className, src, alt, loading, fetchpriority, backup, refresh, darkMode, lan}) {
  const [imageUrl, setImageUrl] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const hanldeBackup = () => {
    switch (backup) {
      case false:
        return isLoading ? '' : emptyLayout1;
      case undefined:
        return isLoading ? '': emptyLayout2;
      default:
        return backup;
    }
  }

  const handleLoad = () => setIsLoading(false);
  
  return (
    
    <img 
      className={className} 
      // src={imageUrl || hanldeBackup()} 
      src={`${src}?t=${new Date().getTime()}`} 
      loading={loading || ''} 
      alt={alt || ''} 
      fetchpriority={fetchpriority || 'auto'} 
      onLoad={handleLoad}
      style={{
        transition: 'filter 0.5s ease-in-out',
        filter: 'blur(' + (isLoading ? '20' : '0') + 'px)',
      }}
    />

  )
}

export default DisplayWebImg;
