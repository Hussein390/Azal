import React from 'react'
import { createFixPhoneProps } from '@/backend/envirnoment';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PhonesPro = {
  FixPhone: createFixPhoneProps;
  setFixPhone: React.Dispatch<React.SetStateAction<createFixPhoneProps>>;
}
export default function FixPhones({ FixPhone, setFixPhone }: PhonesPro) {

  return (
    <div id='main' className="flex justify-between gap-x-4 w-full items-start gap-4">
      <div className="w-full flex flex-col gap-y-3">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="name">أسم الهاتف</Label>
          <Input onChange={(e) => {
            setFixPhone(prev => ({ ...prev, phoneName: e.target.value }));
          }} value={FixPhone.phoneName} id="name" placeholder={'Phone Name'} className="appearance-none" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="Price">السعر</Label>
          <Input onChange={(e) => {
            setFixPhone(prev => ({ ...prev, price: e.target.value }));

          }} value={FixPhone.price} type="number" id="Price" placeholder={'Phone Price'} className="appearance-none" />
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="profit">الربح</Label>
          <Input type="number" onChange={(e) => {
            setFixPhone(prev => ({ ...prev, profit: e.target.value }));
          }} value={FixPhone.profit} id="profit" placeholder="Profit" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="firstPrice">المقدمه</Label>
          <Input type="number" onChange={(e) => {
            setFixPhone(prev => ({ ...prev, firstPrice: e.target.value }));
          }} value={FixPhone.firstPrice} id="firstPrice" placeholder="First Price" />
        </div>
      </div>
      <div className="w-full flex flex-col gap-y-3">

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="clientName">اسم العميل</Label>
          <Input onChange={(e) => {
            setFixPhone(prev => ({ ...prev, clientName: e.target.value }));
          }} value={FixPhone.clientName} id="clientName" placeholder="client Name" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="clientNumber">رقم العميل</Label>
          <Input onChange={(e) => {
            setFixPhone(prev => ({ ...prev, clientNumber: e.target.value }));
          }} value={FixPhone.clientNumber} type="number" id="clientNumber" placeholder="client Number" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="bug">العطل</Label>
          <textarea onChange={(e) => {
            setFixPhone(prev => ({ ...prev, bug: e.target.value }));
          }} className='max-h-28 p-3 rounded  outline-none border' value={FixPhone.bug} id="bug" placeholder="Bug" />
        </div>
      </div>

    </div>
  )
}