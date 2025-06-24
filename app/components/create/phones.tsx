import React from 'react'
import { DataPhones, ItemProps, PhoneProps } from '../dataProvider';
import { createPhone } from '@/backend/envirnoment';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type PhonesPro = {
  phone: PhoneProps;
  open?: string;
  collaborators: { user: { id: string, name: string } }[] | [];
  setPhone: React.Dispatch<React.SetStateAction<PhoneProps>>;
  setItem: React.Dispatch<React.SetStateAction<ItemProps>>;
}
export default function Phones({ phone, setPhone, open, collaborators, setItem }: PhonesPro) {


  return (
    <div id='main' className="flex justify-between gap-x-4 w-full items-start gap-4">
      <div className="w-full flex flex-col gap-y-3">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="name">أسم الهاتف</Label>
          <Input onChange={(e) => {
            setPhone(prev => ({ ...prev, phoneName: e.target.value }));
          }} value={phone.phoneName} id="name" placeholder={'Phone Name'} className="appearance-none" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="Price">السعر</Label>
          <Input onChange={(e) => {
            setPhone(prev => ({ ...prev, price: e.target.value }));

          }} value={phone.price} type="number" id="Price" placeholder={'Phone Price'} className="appearance-none" />
        </div>

        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="profit">الربح</Label>
          <Input type="number" onChange={(e) => {
            setPhone(prev => ({ ...prev, profit: e.target.value }));
          }} value={phone.profit} id="profit" placeholder="Profit" />
        </div>
      </div>
      <div className="w-full flex flex-col gap-y-3">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="firstPrice">المقدمه</Label>
          <Input type="number" onChange={(e) => {
            setPhone(prev => ({ ...prev, firstPrice: e.target.value }));
          }} value={phone.firstPrice} id="firstPrice" placeholder="First Price" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="fixedCut">القطع الشهري</Label>
          <Input type="number" onChange={(e) => {
            setPhone(prev => ({ ...prev, fixedCut: e.target.value }));
          }} value={phone.fixedCut} id="fixedCut" placeholder="fixed Cut" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="BuyerName">اسم المشتري</Label>
          <Input onChange={(e) => {
            setPhone(prev => ({ ...prev, buyerName: e.target.value }));
          }} value={phone.buyerName} id="BuyerName" placeholder="Buyer Name" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="BuyerNumber">رقم المشتري</Label>
          <Input onChange={(e) => {
            setPhone(prev => ({ ...prev, buyerNumber: e.target.value }));
          }} value={phone.buyerNumber} type="number" id="BuyerNumber" placeholder="Buyer Number" />
        </div>
        <div className="grid grid-cols-2 mt-4 gap-4 w-full">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="framework">النضام</Label>
            <Select onValueChange={(value) => {
              if (open === "Items") {
                setItem(prev => ({ ...prev, type: value }));
              } else if (open === "Phone") {
                setPhone(prev => ({ ...prev, type: value }));
              }
            }}>
              <SelectTrigger id="framework">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="IOS">IOS</SelectItem>
                <SelectItem value="Android">Android</SelectItem>
                {open === 'Items' && <SelectItem value="Items">Items</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="framework">المالك</Label>
            <Select value={phone.userId} onValueChange={(value) => {
              setPhone(prev => ({ ...prev, userId: value }))
              console.log(value)
            }}>
              <SelectTrigger id="framework">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent position="popper">
                {collaborators ? collaborators.map(item => {
                  return (
                    <SelectItem key={item.user.id} value={item.user.id || 'كرار امير2'}>{item.user.name}</SelectItem>
                  )
                }) : <SelectItem value="IOS">No Collaborators</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

    </div>
  )
}



