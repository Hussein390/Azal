'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createFixPhoneProps, deleteItem, get_Fix_Phones, getItems, getPhone, updateItem } from '../../backend/envirnoment'
import { DataPhones, ItemProps, PhoneProps } from './dataProvider'
import { useRouter } from 'next/navigation'


export default function Tables() {
  const { phones, setPhones, search, setFixPhones, setIsPhone, isPhone, items, setItems } = DataPhones();
  const router = useRouter()
  const [open, setOpen] = useState<{ [key: number]: boolean }>({});
  const [isUpdate, setIsUpdate] = useState<{ [key: number]: boolean }>({});
  const [update, setUpdate] = useState<{ length: string, price: string }>({ length: '', price: '' });

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
    const object = { environmentId: EnvId, id: item.id, length: update.length, price: update.price }
    await updateItem(object);
    setIsUpdate(prev => ({ ...prev, [index]: false }))
    setOpen(prev => ({ ...prev, [index]: false }))
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, length: update.length, price: update.price } : i));
    setUpdate({ length: '', price: '' });
  }
  return (
    <div className='lg:w-[1000px] mb-4 lg:mb-0 lg:mr-7 grid grid-cols-1'>
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

      </div>
      <div className=' mx-auto max-h-[450px] overflow-y-auto relative w-full' style={{ scrollbarWidth: 'none' }}>
        {isPhone === "Phone" ? <Table>
          <TableHeader>
            <TableRow className='border-b border-b-black'>
              <TableHead className="w-fit">Phone Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Profit</TableHead>
              <TableHead className="text-right">Owned</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(Array.isArray(phones) && phones.length > 0) ?
              Array.isArray(phones) && phones.map((phone, index) => (
                <TableRow className="cursor-pointer" onClick={() => router.push(phone.id!)} key={index}>
                  <TableCell className="font-medium">{phone.phoneName}</TableCell>
                  <TableCell>{phone.price}</TableCell>
                  <TableCell>
                    {phone.createdAt ? phone.createdAt.toLocaleDateString('en-CA').replaceAll('-', '/') : 'N/A'}
                  </TableCell>
                  <TableCell className="font-sans font-semibold">{phone.buyerName}</TableCell>
                  <TableCell className="font-sans font-semibold">{phone.profit}</TableCell>
                  <TableCell className="text-right">{phone.creator ? phone.creator.name : 'Hussein'}</TableCell>
                </TableRow>
              ))
              : null}
          </TableBody>
        </Table> : isPhone === "Item" &&
        <div className='w-full font-sans font-semibold grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 text-right'>
          {items.length >= 1 ? items.filter((task) => {
            const name = search.name.toLowerCase() == '' ? task : task.itemName.toLowerCase().includes(search.name.toLowerCase())
            const type = search.type.toLowerCase() == '' ? task : task.type.toLowerCase().includes(search.type.toLowerCase())

            return name && type
          }).map((item, index) => (
            <div onClick={() => setOpen(prev => ({ ...prev, [index]: !prev![index] }))} key={index} className='border relative p-2 rounded-md cursor-pointer hover:bg-gray-100'>
              <Image src={item.image || "/azal.png"} alt={item.itemName} width={100} height={100} className='w-full h-24 rounded-md object-cover mb-2' />
              <h3 className=' my-1 '>الاسم: <span className='text-orange-500 mr-2'>{item.itemName}</span></h3>
              <p className='text-sm my-3 '>السعر: <span className='text-blue-500 mr-2'>{item.price}</span></p>
              <p className='text-sm  '>العدد: <span className='text-blue-500 mr-2'>{item.length || 1}</span></p>
              <p className='text-sm mt-3'>التاريخ: <span className='text-blue-900 mr-2'>{item.createdAt ? item.createdAt.toLocaleDateString('en-CA').replaceAll('-', '/') : 'N/A'}</span></p>
              {open[index] &&
                <div className="absolute top-0 left-0 size-20 bg-slate-600 rounded-md p-2 text-xs">
                  <button onClick={async () => {
                    const EnvId = localStorage.getItem('envId');
                    if (!EnvId) {
                      console.error('Environment ID is missing!');
                      return;
                    }
                    const object = { environmentId: EnvId, id: item.id }
                    await deleteItem(object);
                    setItems(prev => prev.filter(i => i.id !== item.id));
                  }} className='p-1 rounded cursor-pointer bg-red-400 hover:bg-red-300/55 duration-300 w-full'>Delete</button>
                  <button onClick={() => setIsUpdate(prev => ({ ...prev, [index]: true }))} className='p-1 rounded cursor-pointer bg-slate-400 hover:bg-white/75 duration-300 w-full mt-3'>Update</button>
                </div>
              }
              {isUpdate[index] &&
                <div className="absolute top-0 left-0 w-full h-36 bg-slate-600 rounded-md p-2 text-xs">
                  <label className='text-white  font-semibold' htmlFor="length">العدد</label>
                  <input value={update.length || item.length} onChange={e => setUpdate(prev => ({ ...prev, length: e.target.value }))} type="text" placeholder='Length' className='p-1 rounded w-full mb-2' />
                  <label className='text-white  font-semibold' htmlFor="price">السعر</label>
                  <input value={update.price || item.price} onChange={e => setUpdate(prev => ({ ...prev, price: e.target.value }))} type="number" placeholder='Price' className='p-1 rounded w-full mt-1' />
                  <div className="flex justify-between">
                    <button onClick={() => UpdateItem(item, index)} className='p-1 rounded cursor-pointer bg-slate-400 hover:bg-white/75 duration-300 text-xs mt-3'>Update</button>
                    <button onClick={() => {
                      setOpen(prev => ({ ...prev, [index]: false }))
                      setIsUpdate(prev => ({ ...prev, [index]: false }))
                    }} className='p-1 rounded cursor-pointer bg-slate-400 hover:bg-white/75 duration-300 text-xs mt-3'>Cancel</button>
                  </div>
                </div>}
            </div>
          )) : <p className='text-center'>No items found</p>}
        </div>}
      </div>
    </div>
  );
}
