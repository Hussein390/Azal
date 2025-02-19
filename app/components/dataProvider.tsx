'use client'
import React, { createContext, ReactNode, useContext, useState, Dispatch, SetStateAction } from "react";

// Define the type for days
export type PhoneProps = {
  id?: string;
  updatedPrice?: string;
  phoneName: string;
  buyerName: string;
  buyerNumber?: string;
  price: string;
  firstPrice: string;
  profit: string;
  fixedCut: string;
  type: string;
  environmentId: string;
  createdAt?: Date;
  creator?: {
    name: string;
  };
  userId?: string,
  isPaid?: []
};

export type ItemProps = {
  itemName: string;
  price: string;
  type: string;
  createdAt?: Date;
  environmentId: string;
};

// Define the context value type
type IsOpenContextType = {
  phones: PhoneProps[];
  setPhones: Dispatch<SetStateAction<PhoneProps[]>>;
  items: ItemProps[];
  setItems: Dispatch<SetStateAction<ItemProps[]>>;
  isPhone: string;
  setIsPhone: Dispatch<SetStateAction<string>>;
  showAlert: (message: string, isSuccess?: boolean) => void;  // ✅ Added showAlert
};

// Create the context with a proper default value
const DataContext = createContext<IsOpenContextType>({
  phones: [],
  setPhones: () => { },
  items: [],
  setItems: () => { },
  isPhone: '',
  setIsPhone: () => "Phone",
  showAlert: () => { },
});

// Create a provider component
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [phones, setPhones] = useState<PhoneProps[]>([]);
  const [items, setItems] = useState<ItemProps[]>([]);
  const [isPhone, setIsPhone] = useState<string>("Phone");
  const [alertMessage, setAlertMessage] = React.useState<string | null>(null);
  const [alertSuccessMessage, setAlertSuccessMessage] = React.useState<string | null>(null);

  function showAlert(message: string, isSuccess = false) {
    if (isSuccess) {
      setAlertSuccessMessage(message);
    } else {
      setAlertMessage(message);
    }
    setTimeout(() => {
      setAlertMessage(null);
      setAlertSuccessMessage(null);
    }, 5000);
  }

  return (
    <DataContext.Provider value={{ phones, setPhones, setItems, items, isPhone, setIsPhone, showAlert }}>
      {children}
      {(alertMessage || alertSuccessMessage) && (
        <div className={`fixed top-16 right-3 outline-2 ${alertSuccessMessage ? 'outline-green-600' : 'outline-red-600'}  outline rounded-md`}>
          <div className="bg-white p-4 rounded shadow-md max-w-sm text-center">
            <p className="text-black">{alertSuccessMessage || alertMessage}</p>
          </div>
        </div>
      )}
    </DataContext.Provider>
  );
};

// Custom hook to use the context
export const DataPhones = () => {
  return useContext(DataContext);
};
