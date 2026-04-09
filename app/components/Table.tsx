"use client"
import React, { useEffect, useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createFixPhoneProps, deleteItem, get_Fix_Phones, getEnvironmentById, getItems, getPhone, updateItem, updatePhone } from '../../backend/envirnoment'
import { DataPhones, ItemProps, PhoneProps } from './dataProvider'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'


export default function Tables() {
  const { showAlert, phones, setPhones, search, setFixPhones, setIsPhone, isPhone, items, setItems } = DataPhones();
  const router = useRouter()
  const [open, setOpen] = useState<{ [key: number]: boolean }>({});
  const [allMoney, setAllMoney] = useState<number>(0);

  const [isUpdate, setIsUpdate] = useState<{ [key: number]: boolean }>({});
  const [update, setUpdate] = useState<{ length: string, sellPrice: string, text: string, boughtPrice: string, installmentPrice: string }>({ length: '', sellPrice: '', text: '', boughtPrice: '', installmentPrice: '' });
  const USER = typeof window !== "undefined"
    ? localStorage.getItem("chosen")
    : null;


  // Get Collaborators
  const [ownerID, setOwnerID] = useState<string>('')
  const [collaborators, setCollaborators] = useState<{ user: { id: string, name: string | null } }[] | null>(null)
  async function getUserId() {
    const EnvId = localStorage.getItem('envId')!;
    const res = await getEnvironmentById({ id: EnvId });
    // Check if res is a string (error message)
    if (typeof res === 'string') {
      showAlert("Failed to fetch environment:" + res, false);
      return;
    }

    // Assuming res is now an object with the expected structure
    if (res && 'owner' in res && Array.isArray(res.collaborators)) {
      const formattedData = [];

      // Process the owner data
      formattedData.push({ user: { id: res.owner.id, name: res.owner.name || '' } });

      // Process the collaborators data
      res.collaborators.forEach(collab => {
        if (collab.user) {
          formattedData.push({ user: { id: collab.user.id, name: collab.user.name || '' } });
        }
      });
      setCollaborators(formattedData);
    } else {
      console.error("Unexpected response format:", res);
    }
  }
  React.useEffect(() => {
    getUserId()
  }, [])

  const filteredTasks = Array.isArray(phones)
    ? phones.filter(task => {
      // if no filter selected, show all
      if (!ownerID) return true;
      return task.creator?.id === ownerID || ownerID === 'all-users';
    })


    : [];
  useEffect(() => {
    const totalMoney = filteredTasks.reduce((sum, task) => {
      return sum + Number(task.fixedCut || 0);
    }, 0);

    setAllMoney(totalMoney);
  }, [filteredTasks])

  const totalMoney = useMemo(() => {
    return filteredTasks.reduce((sum, task) =>
      sum + Number(task.fixedCut || 0),
      0);
  }, [filteredTasks]);

  useEffect(() => {
    setAllMoney(totalMoney);
  }, [totalMoney]);




  // get Phones or Items
  async function getPhones() {
    const EnvId = localStorage.getItem('envId');
    if (!EnvId) {
      console.error('Environment ID is missing!');
      return;
    }
    if (isPhone === "Item") {
      const data = await getItems(EnvId);
      setItems(data as ItemProps[]);

    } else if (isPhone === "Phone") {
      const data = await getPhone(EnvId);
      setPhones(data as PhoneProps[]);

    } else if (isPhone === "FixPhone") {
      const data = await get_Fix_Phones(EnvId);
      setFixPhones(data as createFixPhoneProps[])
    }
  }

  useEffect(() => {
    getPhones();
  }, [isPhone, setPhones]);

  // Upate an Item
  async function UpdateItem(item: { id: string }, index: number) {
    const EnvId = localStorage.getItem('envId');
    if (!EnvId) {
      console.error('Environment ID is missing!');
      return;
    }

    const object: any = {
      environmentId: EnvId,
      id: item.id,
    };

    if (update.length) object.length = update.length;
    if (update.sellPrice) object.sellPrice = update.sellPrice;
    if (update.boughtPrice) object.boughtPrice = update.boughtPrice;
    if (update.installmentPrice) object.installmentPrice = update.installmentPrice;
    if (update.text) object.text = update.text;

    const result = await updateItem(object);

    if (!result) return;
    await getPhones()
    setIsUpdate(prev => ({ ...prev, [index]: false }));
    setOpen(prev => ({ ...prev, [index]: false }));

    setItems(prev =>
      prev.map(i =>
        i.id === item.id
          ? { ...i, ...object }
          : i
      )
    );

    setUpdate({ length: '', sellPrice: '', boughtPrice: '', text: '', installmentPrice: '' });
  }
  // But an Item
  async function BuyItem(item: { id: string }, index: number) {
    const EnvId = localStorage.getItem('envId');

    if (!EnvId) {
      console.error('Environment ID is missing!');
      return;
    }

    const currentItem = items.find(i => i.id === item.id);

    if (currentItem && Number(currentItem.length) >= 1) {
      showAlert('Item sold', true);

      const object = {
        environmentId: EnvId,
        id: item.id,
        length: update.length,
        sellPrice: update.sellPrice,
        boughtPrice: update.boughtPrice,
        text: update.text,
        installmentPrice: update.installmentPrice
      };

      await updateItem(object);

      setIsUpdate(prev => ({ ...prev, [index]: false }));
      setOpen(prev => ({ ...prev, [index]: false }));

      setItems(prev =>
        prev.map(i =>
          i.id === item.id
            ? { ...i, length: String(Number(i.length) - 1) }
            : i
        )
      );

      setUpdate({
        length: '',
        sellPrice: '',
        boughtPrice: '',
        text: '',
        installmentPrice: ''
      });

    } else {
      showAlert('The Item Is Not Available', false);
    }
  }

  // Delete Item
  async function DeletItem(item: { id: string }) {
    const EnvId = localStorage.getItem('envId');
    if (!EnvId) {
      console.error('Environment ID is missing!');
      return;
    }

    const object: any = {
      environmentId: EnvId,
      id: item.id,
    };
    await deleteItem(object)
    await getPhones()
  }
  useEffect(() => {
    if (USER) setOwnerID(USER);
  }, [USER]);
  return (
    <div className='lg:w-[1200px] mb-4 lg:mb-0 lg:mr-7 grid grid-cols-1'>
      <div className="flex items-center gap-x-2 mb-3">
        <button
          className={`${isPhone == "Item" ? 'bg-blue-400 text-white ' : ''} p-2 rounded-md border hover:bg-blue-500 hover:text-white`}
          onClick={e => setIsPhone((e.target as HTMLButtonElement).innerText)}
        >
          Item
        </button>
        <button
          className={`${isPhone == "Phone" ? 'bg-blue-400 text-white ' : ''} p-2 rounded-md border hover:bg-blue-500 hover:text-white`}
          onClick={e => setIsPhone((e.target as HTMLButtonElement).innerText)}
        >
          Phone
        </button>

        <div className="md:ml-12">
          <Select
            value={ownerID}
            onValueChange={(value) => {
              setOwnerID(value);
              localStorage.setItem("chosen", value);
            }}>
            <SelectTrigger id="framework">
              <SelectValue placeholder="أختر" />
            </SelectTrigger>
            <SelectContent position="popper">
              {(() => {
                if (!collaborators || collaborators.length === 0) {
                  return <SelectItem value="IOS">No Collaborators</SelectItem>;
                }

                // Create a unique filtered list
                const filtered = collaborators.filter(
                  (user, index, self) =>
                    index === self.findIndex(u => u.user.id === user.user.id)
                );
                // Render SelectItems
                return (<>
                  {
                    filtered.map(item => (

                      <SelectItem
                        className="cursor-pointer"
                        key={item.user.id}
                        value={item.user.id || "كرار امير2"}
                      >
                        {item.user.name}
                      </SelectItem>
                    ))}
                  <SelectItem
                    value='all-users'
                    className="cursor-pointer"
                    key={"all-users"}>ALL</SelectItem>
                </>)
              })()}
            </SelectContent>
          </Select>
        </div>
        {isPhone === "Phone" &&
          <div className="md:ml-12 md:text-lg font-bold">All Cuts: <span className='text-blue-500'>{allMoney}</span></div>
        }
      </div>
      <div className=' mx-auto max-h-[450px] overflow-y-auto relative w-full' style={{ scrollbarWidth: 'none' }}>
        {isPhone === "Phone" ? <Table>
          <TableHeader>
            <TableRow className='border-b border-b-black'>
              <TableHead className="w-fit">Count</TableHead>
              <TableHead className="w-fit">Phone Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Cut</TableHead>
              <TableHead >Recived</TableHead>
              <TableHead className="text-right">Owned</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(Array.isArray(phones) && phones.length > 0) ?
              Array.isArray(phones) && filteredTasks.map((phone, index) => (

                <TableRow className="cursor-pointer" onClick={() => router.push(phone.id!)} key={index}>
                  <TableCell className="font-medium w-3">{index + 1}</TableCell>
                  <TableCell className="font-medium">{phone.phoneName}</TableCell>
                  <TableCell>{phone.price}</TableCell>
                  <TableCell >
                    {phone.createdAt ? phone.createdAt.toLocaleDateString('en-CA').replaceAll('-', '/') : 'N/A'}
                  </TableCell>
                  <TableCell className="font-sans font-semibold">{phone.buyerName}</TableCell>
                  <TableCell className="font-sans font-semibold">{phone.fixedCut}</TableCell>
                  <TableCell><div
                    className={`size-5 ml-4 rounded-full mx-auto ${phone.currMonth ? "bg-green-400" : "bg-red-400"
                      }`}
                  ></div></TableCell>
                  <TableCell className="text-right ">{phone.creator ? phone.creator.name : 'Hussein'}</TableCell>
                </TableRow>
              ))
              : <TableRow>
                <TableCell colSpan={6} className="text-center font-bold text-xl">لا يوجد هواتف</TableCell>
              </TableRow>}
          </TableBody>
        </Table> : isPhone === "Item" &&
        <div className='w-full font-sans font-semibold '>

          < Table >
            <TableHeader>
              <TableRow className='border-b border-b-black'>
                <TableHead className="w-fit">Count</TableHead>
                <TableHead className="w-fit">Item Name</TableHead>
                <TableHead>Bought Price</TableHead>
                <TableHead>Sell Price</TableHead>
                <TableHead>Installment Price</TableHead>
                <TableHead>Length</TableHead>
                <TableHead>Text</TableHead>
                <TableHead >Date</TableHead>
                <TableHead className="text-right">Owned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody >
              {Array.isArray(items) && items.length >= 1 ? (
                items
                  .filter((task) => {
                    const name =
                      search.name.toLowerCase() === ""
                        ? true
                        : task.itemName.toLowerCase().includes(search.name.toLowerCase());

                    const type =
                      search.type.toLowerCase() === ""
                        ? true
                        : task.type.toLowerCase().includes(search.type.toLowerCase());

                    return name && type;
                  }).map((item, index) => (

                    <TableRow className="cursor-pointer select-none" onDoubleClick={() => setOpen(prev => ({ ...prev, [index]: !prev[index] }))} key={index}>
                      <TableCell className="font-medium w-3">{index + 1}</TableCell>
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      <TableCell>{item.boughtPrice}</TableCell>
                      <TableCell className="font-sans font-semibold">
                        {item.sellPrice}
                        {isUpdate[index] && <input value={update.sellPrice} onChange={(e) => setUpdate(prev => ({ ...prev, sellPrice: e.target.value }))} type="text" className='rounded-full ml-2 p-2 h-7 w-14 border-slate-400 border' />}
                      </TableCell>
                      <TableCell className="font-sans font-semibold">
                        {item.installmentPrice}
                        {isUpdate[index] && <input value={update.installmentPrice} onChange={(e) => setUpdate(prev => ({ ...prev, installmentPrice: e.target.value }))} type="text" className='rounded-full ml-2 p-2 h-7 w-14 border-slate-400 border' />}
                      </TableCell>
                      <TableCell className="font-sans font-semibold">
                        {item.length}
                        {isUpdate[index] && <input value={update.length} onChange={(e) => setUpdate(prev => ({ ...prev, length: e.target.value }))} type="text" className='rounded-full ml-2 p-2 h-7 w-14 border-slate-400 border' />}
                      </TableCell>
                      <TableCell className="font-sans font-semibold">
                        {item.text}
                        {isUpdate[index] && <input value={update.text} onChange={(e) => setUpdate(prev => ({ ...prev, text: e.target.value }))} type="text" className='rounded-full ml-2 p-2 h-7 w-14 border-slate-400 border' />}
                      </TableCell>
                      <TableCell >
                        {item.createdAt ? item.createdAt.toLocaleDateString('en-CA').replaceAll('-', '/') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right select-none">{item.creator ? item.creator.name : 'Hussein'}</TableCell>
                      {open[index] && <TableCell className="flex gap-x-3 items-center m-0">
                        <button onClick={() => {
                          setOpen(prev => ({ ...prev, [index]: false }))
                          setIsUpdate(prev => ({ ...prev, [index]: !prev[index] }))
                        }} className=" bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
                          Edit
                        </button>
                        <button onClick={() => DeletItem(item)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600">
                          Delete
                        </button>
                        <button onClick={() => BuyItem(item, index)} className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600">
                          Buy
                        </button>
                      </TableCell>}
                      {isUpdate[index] && <TableCell className="flex gap-x-3 items-center m-0">
                        <button onClick={() => {
                          UpdateItem(item, index)
                          setIsUpdate(prev => ({ ...prev, [index]: false }))
                        }} className=" bg-green-500 text-white p-2 rounded-full hover:bg-green-600">
                          Save
                        </button>
                        <button onClick={() => setIsUpdate(prev => ({ ...prev, [index]: false }))} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600">
                          Cancel
                        </button>
                      </TableCell>}
                    </TableRow>
                  )))
                : <p className='text-center mt-3'>No items found</p>}
            </TableBody>
          </Table>
        </div>}
      </div>
    </div>
  );
}
