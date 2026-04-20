'use client';

import { useEffect } from 'react';
import { DataPhones } from './dataProvider';

export default function DynamicMetadata() {
  const { EnvironmentName } = DataPhones();
  
  useEffect(() => {
    if (EnvironmentName?.name) {
      // Update title
      document.title = `${EnvironmentName.name}`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 
          `This app was created by Hussein Saleem for the ${EnvironmentName.name} shop`
        );
      }
    }
  }, [EnvironmentName]);
  
  return null;
}