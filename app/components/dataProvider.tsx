'use client'
import { createFixPhoneProps, getEnvironmentById } from "@/backend/envirnoment";

import React, { createContext, ReactNode, useContext, useState, Dispatch, SetStateAction, useEffect } from "react";

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
  sellPrice: string;
  boughtPrice: string;
  installmentPrice: string;
  text?: string;
  type: string;
  createdAt?: Date;
  environmentId: string;
  userId?: string;
  length: string;
  fixedLength?: string
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
  EnvironmentName: envirnomentProps
};
type collaboratorsProps = {
  role: string,
  user: {
    id: string,
    name: string,
    image: string
  }
}
type envirnomentProps = {
  id: string,
  name: string,
  owner: { name: string },
  password: string,
  phones: { creatorId: string, profit: string, price: string }[],
  items: any,
    collaborators: collaboratorsProps[],

}


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
  EnvironmentName: {
    id: '',
    name: '',
    owner: { name: '' },
    password: '',
    phones: [],
    items: {},
    collaborators: []
  }
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
const [EnvironmentName, setEnvironmentName] = useState<envirnomentProps>({
  id: '',
  name: '',
  owner: { name: '' },
  password: '',
  phones: [],
  items: {},
  collaborators: []
});
  useEffect(() => {

    async function fetchEnvironment() {
      try {
        const EnvId = localStorage.getItem('envId');
    if (!EnvId) {
      console.error('Environment ID is missing!');
      return;
    }
        const data = await getEnvironmentById({ id: EnvId });
        setEnvironmentName(data as envirnomentProps);
      } catch (err) {
        console.error(err);
      }
    }
    fetchEnvironment();
  }, []);
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
    <DataContext.Provider value={{ EnvironmentName, isPriced, setIsPriced, search, setSearch, fixPhones, setFixPhones, phones, setPhones, setItems, items, isPhone, setIsPhone, showAlert }}>
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
