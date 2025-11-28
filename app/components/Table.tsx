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
  const [update, setUpdate] = useState<{ length: string, price: string, image: string }>({ image: '', length: '', price: '' });
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
    const object = { environmentId: EnvId, id: item.id, length: update.length, price: update.price, image: update.image }
    await updateItem(object);
    setIsUpdate(prev => ({ ...prev, [index]: false }))
    setOpen(prev => ({ ...prev, [index]: false }))
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, length: update.length, price: update.price } : i));
    setUpdate({ length: '', price: '', image: '' });
  }
  // But an Item

  async function BuyItem(item: { id: string }, index: number) {
    const EnvId = localStorage.getItem('envId');
    if (!EnvId) {
      console.error('Environment ID is missing!');
      return;
    }
    const object = { environmentId: EnvId, id: item.id, length: update.length, price: update.price, image: update.image }
    await updateItem(object);
    setIsUpdate(prev => ({ ...prev, [index]: false }))
    setOpen(prev => ({ ...prev, [index]: false }))
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, length: String(Number(i.length) > 1 ? Number(i.length) - 1 : 0) } : i));
    setUpdate({ length: '', price: '', image: '' });
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
        <div className="md:ml-12 md:text-lg font-bold">All Cuts: <span className='text-blue-500'>{allMoney}</span></div>
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
        <div className='w-full font-sans font-semibold grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 text-right'>
          {items.length >= 1 ? items.filter((task) => {
            const name = search.name.toLowerCase() == '' ? task : task.itemName.toLowerCase().includes(search.name.toLowerCase())
            const type = search.type.toLowerCase() == '' ? task : task.type.toLowerCase().includes(search.type.toLowerCase())
            return name && type
          }).map((item, index) => (
            <div onClick={() => {
              console.log(item.image)
              setOpen(prev => ({ ...prev, [index]: !prev![index] }))
            }
            } key={index} className='border relative p-2 rounded-md cursor-pointer hover:bg-gray-100'>
              <img src={item.image || "/azal.png"} alt={''} className='w-full h-24 rounded-md object-cover mb-2' />
              <h3 className=' my-1 direction-reverse'>الاسم: <span className='text-orange-500 mr-2'>{item.itemName}</span></h3>
              <p className='text-sm my-3 '>السعر: <span className='text-blue-500 mr-2'>{item.price}</span></p>
              <p className='text-sm  '>العدد: <span className='text-blue-500 mr-2'>{item.length || 1}</span></p>
              <p className='text-sm mt-3'>التاريخ: <span className='text-blue-900 mr-2'>{item.createdAt ? item.createdAt.toLocaleDateString('en-CA').replaceAll('-', '/') : 'N/A'}</span></p>
              {open[index] &&
                <div className="absolute top-0 left-0  bg-slate-600 rounded-md p-2 text-xs">
                  <button onClick={() => BuyItem(item, index)} className='p-1 rounded cursor-pointer bg-green-400 hover:bg-green-300/55 duration-300 w-full'>Buy</button>
                  <button onClick={() => setIsUpdate(prev => ({ ...prev, [index]: true }))} className='p-1 rounded cursor-pointer bg-slate-400 hover:bg-white/75 duration-300 w-full mt-3'>Update</button>
                  <button onClick={async () => {
                    const EnvId = localStorage.getItem('envId');
                    if (!EnvId) {
                      console.error('Environment ID is missing!');
                      return;
                    }
                    const object = { environmentId: EnvId, id: item.id }
                    await deleteItem(object);
                    setItems(prev => prev.filter(i => i.id !== item.id));
                  }} className='p-1 mt-3 rounded cursor-pointer bg-red-400 hover:bg-red-300/55 duration-300 w-full'>Delete</button>
                </div>
              }
              {isUpdate[index] &&
                <div className="absolute top-0 left-0 w-full h-auto bg-slate-600 rounded-md p-2 text-xs">
                  <label className='text-white  font-semibold' htmlFor="length">العدد</label>
                  <input value={update.length || item.length} onChange={e => setUpdate(prev => ({ ...prev, length: e.target.value }))} type="text" placeholder='Length' className='p-1 rounded w-full mb-2' />
                  <label className='text-white  font-semibold' htmlFor="price">السعر</label>
                  <input value={update.price || item.price} onChange={e => setUpdate(prev => ({ ...prev, price: e.target.value }))} type="number" placeholder='Price' className='p-1 rounded w-full mt-1' />
                  <label className='text-white  font-semibold' htmlFor="price">صوره</label>
                  <Input
                    type="file"
                    accept="image/*"
                    id="Image"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setUpdate((prev) => ({ ...prev, image: reader.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="flex justify-between">
                    <button onClick={() => UpdateItem(item, index)} className='p-1 rounded cursor-pointer bg-slate-400 hover:bg-white/75 duration-300 text-xs mt-3'>Update</button>
                    <button onClick={() => {
                      setOpen(prev => ({ ...prev, [index]: false }))
                      setIsUpdate(prev => ({ ...prev, [index]: false }))
                    }} className='p-1 rounded cursor-pointer bg-slate-400 hover:bg-white/75 duration-300 text-xs mt-3'>Cancel</button>
                  </div>
                </div>}
            </div>
          )

          ) : <p className='text-center'>No items found</p>}
        </div>}
      </div>
    </div>
  );
}
