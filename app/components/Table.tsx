'use client'
import React, { useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createFixPhoneProps, get_Fix_Phones, getItems, getPhone } from '../../backend/envirnoment'
import { DataPhones, ItemProps, PhoneProps } from './dataProvider'
import { useRouter } from 'next/navigation'


export default function Tables() {
  const { phones, setPhones, fixPhones, setFixPhones, setIsPhone, isPhone, items, setItems } = DataPhones();
  const router = useRouter()

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
        <button
          className={`${isPhone == "FixPhone" ? 'bg-blue-400 text-white ' : ''} p-2 rounded-md border hover:bg-blue-500 hover:text-white`}
          onClick={e => setIsPhone((e.target as HTMLButtonElement).innerText)}
        >
          FixPhone
        </button>
      </div>
      <div className=' mx-auto max-h-[450px] overflow-y-auto relative w-full' style={{ scrollbarWidth: 'none' }}>
        <Table>
          <TableHeader>
            <TableRow className='border-b border-b-black'>
              <TableHead className="w-fit">Phone Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Date</TableHead>
              {isPhone === "Phone" && (
                <>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead className="text-right">Owned</TableHead>
                </>
              )}
              {isPhone === "FixPhone" && (
                <>
                  <TableHead>Client</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead className="text-right">Owned</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(Array.isArray(items) && items.length > 0) || (Array.isArray(phones) && phones.length > 0) ? (
              isPhone === "Phone" ? (
                Array.isArray(phones) ? (
                  phones.map((phone, index) => (
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
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Invalid data format.</TableCell>
                  </TableRow>
                )
              ) : isPhone === "FixPhone" ?
                fixPhones.map((phone, index) => (
                  <TableRow className="cursor-pointer" onClick={() => router.push(`/fix/${phone.id!}`)} key={index}>
                    <TableCell className="font-medium">{phone.phoneName}</TableCell>
                    <TableCell>{phone.price}</TableCell>
                    <TableCell>
                      {phone.createdAt ? phone.createdAt.toLocaleDateString('en-CA').replaceAll('-', '/') : 'N/A'}
                    </TableCell>
                    <TableCell className="font-sans font-semibold">{phone.clientName}</TableCell>
                    <TableCell className="font-sans font-semibold">{phone.profit}</TableCell>
                    <TableCell className="text-right">{phone.creator ? phone.creator.name : 'Hussein'}</TableCell>
                  </TableRow>
                )) :
                isPhone === "Item" ? (
                  items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell>
                        {item.createdAt ? item.createdAt.toLocaleDateString('en-CA').replaceAll('-', '/') : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : null
            ) : (
              <TableRow>
                <TableCell colSpan={isPhone === "Phone" ? 5 : 3} className="text-center">No data available.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
