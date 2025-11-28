'use client'
import { createFixPhoneProps } from "@/backend/envirnoment";
import { isPaid } from "@prisma/client";
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
    id: string;
  };
  userId?: string,
  currMonth?: boolean
};

export type ItemProps = {
  id: string,
  itemName: string;
  price: string;
  type: string;
  createdAt?: Date;
  environmentId: string;
  image?: string;
  userId?: string;
  length: string;
  creator?: {
    name: string;
  };
};

type isPaidProps = {
  position: number,
  id: string,
  isPaid: boolean
}
// Define the context value type
type IsOpenContextType = {
  search: { name: string, type: string },
  setSearch: Dispatch<SetStateAction<{ name: string, type: string }>>,
  phones: PhoneProps[];
  setPhones: Dispatch<SetStateAction<PhoneProps[]>>;
  fixPhones: createFixPhoneProps[];
  setFixPhones: Dispatch<SetStateAction<createFixPhoneProps[]>>;
  items: ItemProps[];
  setItems: Dispatch<SetStateAction<ItemProps[]>>;
  isPhone: string;
  setIsPhone: Dispatch<SetStateAction<string>>;
  showAlert: (message: string, isSuccess?: boolean) => void;  // ✅ Added showAlert
  setIsPriced: Dispatch<SetStateAction<isPaidProps[]>>;
  isPriced: isPaidProps[];
};

// Create the context with a proper default value
const DataContext = createContext<IsOpenContextType>({
  search: { name: '', type: '' },
  setSearch: () => { },
  phones: [],
  setPhones: () => { },
  fixPhones: [],
  setFixPhones: () => { },
  items: [],
  setItems: () => { },
  isPhone: '',
  setIsPhone: () => "Phone",
  showAlert: () => { },
  setIsPriced: () => { },
  isPriced: [],
});

// Create a provider component
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [phones, setPhones] = useState<PhoneProps[]>([]);
  const [fixPhones, setFixPhones] = useState<createFixPhoneProps[]>([]);
  const [items, setItems] = useState<ItemProps[]>([]);
  const [isPhone, setIsPhone] = useState<string>("Phone");
  const [search, setSearch] = React.useState<{ name: string, type: string }>({ name: '', type: '' });
  const [alertMessage, setAlertMessage] = React.useState<string | null>(null);
  const [alertSuccessMessage, setAlertSuccessMessage] = React.useState<string | null>(null);
  const [isPriced, setIsPriced] = useState<isPaidProps[]>([]);

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
    <DataContext.Provider value={{ isPriced, setIsPriced, search, setSearch, fixPhones, setFixPhones, phones, setPhones, setItems, items, isPhone, setIsPhone, showAlert }}>
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
