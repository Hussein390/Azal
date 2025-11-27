'use client'
import React, { useEffect, useState, useRef } from 'react'
import { DataPhones, PhoneProps } from '../components/dataProvider'
import { createIsPaid, deleteMyPhone, getEnvironmentById, getIsPaid, getMyPhone, updatePhone } from '../../backend/envirnoment';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type isPaidProps = {
  position: number,
  id: string,
  isPaid: boolean
}
export default function page({ params }: { params: Promise<{ phone: string }> }) {
  const { showAlert } = DataPhones();
  const [phone, setPhone] = useState<PhoneProps | null>(null);
  const [date, setDate] = useState('')
  const [changeOwner, setChangeOwner] = useState(false);
  const price = String(Number(phone?.price) + Number(phone?.profit) - Number(phone?.firstPrice));
  const months = Math.ceil(Number(price) / (parseInt(phone?.fixedCut!) || 50));
  const [isPriced, setIsPriced] = useState<isPaidProps[]>([]);
  const PDFRef = useRef<HTMLDivElement | null>(null)
  const Router = useRouter()
  const nowDate = new Date();
  const formattedDate = `${nowDate.getFullYear()}/${nowDate.getMonth() + 1}/${nowDate.getDate()}`;
  // fn
  async function handleGeneratePDF() {
    const PDFData = PDFRef.current!;
    try {
      // Ensure it captures the full width
      const profitElement = PDFData.querySelector<HTMLParagraphElement>(".profit");
      if (profitElement) profitElement.style.display = "none";
      const owner = PDFData.querySelector<HTMLParagraphElement>(".owner");
      if (owner) owner.style.display = "none";
      const canvas = await html2canvas(PDFData, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      // Restore the profit element after capture
      if (profitElement) profitElement.style.display = "";
      if (owner) owner.style.display = "";
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height], // Dynamically set width & height
      });
      const imgProp = pdf.getImageProperties(imgData)
      const width = pdf.internal.pageSize.getWidth();
      const height = (imgProp.height * width) / imgProp.width;
      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save("Azal.pdf");
    } catch (err: unknown) {
      if (err instanceof Error) console.log(err.message);
    }
  }

  const [isPaid, setIsPaid] = useState<{ [key: string]: boolean }>(() => {
    const initialState: { [key: string]: boolean } = {};
    Array.from({ length: months + 1 }, (_, id) => {
      initialState[id] = false;
    });
    return initialState;
  });
  async function handleGetPhone() {
    const id = (await params).phone;
    if (!id) return;
    const environmentId = localStorage.getItem('envId')!;

    const [data, getData] = await Promise.all([
      getMyPhone(id),
      getIsPaid({ id: phone?.id!, envId: environmentId })
    ])
    setPhone(data as PhoneProps)
    if (getData instanceof Object) {
      const filteredData = getData.filter(item => item.phoneId === id)
      setIsPriced(filteredData);
    }

    return;
  }
  useEffect(() => {
    handleGetPhone()

  }, [])
  const handlePayment = (id: number) => {
    setIsPaid((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  // got the money of a month
  async function updatedPrice(index: number) {
    const id = (await params).phone;
    const environmentId = localStorage.getItem('envId')!;
    const value = Number(phone?.updatedPrice) - Number(phone?.fixedCut);
    const data = { id, environmentId, updatedPrice: String(value) }
    const [res, any] = await Promise.all([
      updatePhone(data),
      createIsPaid({ id: id, position: index, envId: environmentId }),
    ])
    if (res instanceof Error) showAlert(res.message, false)
    handlePayment(index)
    return
  }
  // update date
  async function updateDate(value: string) {
    const id = (await params).phone;
    const environmentId = localStorage.getItem('envId')!;
    const data = { id, environmentId, date: String(value) }
    const res = await updatePhone(data);
    if (res instanceof Error) showAlert(res.message, false)
    handleGetPhone();
    return
  }
  // Get Collaborators
  const [collaborators, setCollaborators] = useState<{ user: { id: string, name: string | null } }[] | null>(null)
  async function getUserId() {
    const EnvId = localStorage.getItem('envId')!;
    const res = await getEnvironmentById({ id: EnvId });
    // Check if res is a string (error message)
    if (typeof res === 'string') {
      console.error("Failed to fetch environment:", res);
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
  // Update owner
  async function updateOwner(value: string) {
    const id = (await params).phone;
    const environmentId = localStorage.getItem('envId')!;
    const data = { id, environmentId, creatorId: value }
    const res = await updatePhone(data);
    if (res instanceof Error) showAlert(res.message, false)
    handleGetPhone();
    return
  }


  React.useEffect(() => {
    getUserId()
  }, [])

  async function updateLastMonthPaid(value: boolean) {
    const id = (await params).phone;
    const environmentId = localStorage.getItem('envId')!;
    const data = { id, environmentId, currMonth: value }
    const res = await updatePhone(data);
    if (res instanceof Error) showAlert(res.message, false)
    handleGetPhone();
    return
  }

  useEffect(() => {
    if (!phone || isPriced.length === 0) return;

    const maxPosition = Math.max(...isPriced.map(i => i.position));

    const getDateForPosition = (pos: number) => {
      const baseDate = phone.createdAt ? new Date(phone.createdAt) : new Date();
      baseDate.setMonth(baseDate.getMonth() + pos);
      return baseDate
        .toLocaleDateString('en-CA')
        .replaceAll('-', '/')
        .match(/\/(\d{2})\//)?.[1];
    };

    const todayMonth = new Date()
      .toLocaleDateString('en-CA')
      .replaceAll('-', '/')
      .match(/\/(\d{2})\//)?.[1];

    const lastPaidMonth = getDateForPosition(maxPosition);

    // ✔ Update state ONLY if value is different
    updateLastMonthPaid(lastPaidMonth === todayMonth)
  }, [phone?.createdAt, isPriced]);
  return (
    <div ref={PDFRef} style={{ direction: 'rtl' }} className='md:w-[920px]  mt-16 p-8 rounded-md border shadow-sm mx-auto  relative'>
      <div className="flex items-center gap-x-6 absolute -top-12 left-0">
        <Link href={'/'} className='p-2 rounded border bg-slate-100 hover:bg-slate-200 delay-75 '><ArrowLeft /></Link>
        <button onClick={handleGeneratePDF} className='p-2 rounded border bg-slate-100 hover:bg-slate-200 delay-75 '>Download PDF</button>
        <Dialog>
          <DialogTrigger className='p-2 rounded border bg-slate-100 hover:bg-slate-200 delay-75 '>Update Date</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تغير تاريخ الانشاء</DialogTitle>
            </DialogHeader>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className='border p-2 rounded w-full right' />
            <div className="mt-4 flex items-center justify-between">
              <DialogClose asChild>
                <button onClick={() => {
                  updateDate(date)
                }} className='p-2 rounded border green-red-600 bg-green-300 hover:bg-green-400 delay-75 '>Upate</button>
              </DialogClose>
              <DialogClose asChild>
                <button type='button' className='p-2 rounded border bg-slate-100 hover:bg-slate-200 delay-75 '>Cancel</button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger className='p-2 rounded border bg-slate-100 hover:bg-slate-200 delay-75 '>Delete Phone</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>هل أنت متأكد؟</DialogTitle>
            </DialogHeader>
            <div className="mt-4 flex items-center justify-between">
              <button onClick={async () => {
                const id = (await params).phone;
                const envId = localStorage.getItem('envId')!;
                await deleteMyPhone(id, envId)
                Router.push('/')
              }} className='p-2 rounded border border-red-600 bg-red-300 hover:bg-red-400 delay-75 '>Delete</button>
              <DialogClose asChild>
                <button type='button' className='p-2 rounded border bg-slate-100 hover:bg-slate-200 delay-75 '>Cancel</button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className=" flex items-center justify-between ">
        <p className="font-sans font-semibold ">تحيه طيبه من مركز <span className='text-blue-700'>الأزل</span></p>
        <p className="font-sans font-semibold ">تاريخ الوصل : <span className='text-blue-700'>{formattedDate}</span></p>
        <p className="font-sans font-semibold "> رقم المركز: <span className='text-blue-600 mr-2'>07716701849</span> </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 w-full relative mt-6" >
        <div className=" flex flex-col gap-y-4 text-right ">
          <p className="font-sans border-b w-fit pb-2">أسم الهاتف: <span className='mr-2 font-semibold'>{phone?.phoneName}</span></p>
          <p className="font-sans ">السعر: <span className='text-blue-600 mr-2 font-semibold'>{Number(phone?.price) + Number(phone?.profit)} ألف</span></p>
          <p className="font-sans profit">الربح: <span className='text-green-600 mr-2 font-semibold'>{phone?.profit} ألف</span></p>
          <p className="font-sans ">المقدمه: <span className='text-green-600 mr-2 font-semibold'>{phone?.firstPrice} ألف</span></p>
          <p className="font-sans ">المبلغ المتبقي: <span className='text-red-600 mr-2 font-semibold'>{phone?.updatedPrice} ألف</span></p>
          <p className="font-sans ">القطع الشهري: <span className='text-blue-600 mr-2 font-semibold'>{phone?.fixedCut} ألف</span></p>
          <p className="font-sans border-t w-fit pt-2">أسم المشتري: <span className='text-black mr-2 font-semibold'>{phone?.buyerName || 'Hussein'} </span></p>
          <p className="font-sans ">رقم المشتري: <span className='text-blue-600 mr-2 font-semibold'>{phone?.buyerNumber || 'لا يوجد رقم'} </span></p>
          <button onDoubleClick={() => setChangeOwner(prev => !prev)} className="font-sans owner text-right">المالك: <span className='text-blue-600 mr-2 font-semibold'>{phone?.creator?.name || 'لا يوجد مالك'} </span></button>
          {changeOwner && <div className="flex flex-col space-y-1.5">
            <Label htmlFor="framework">المالك</Label>
            <Select onValueChange={(value) => {
              updateOwner(value)
              setChangeOwner(false)
            }}>
              <SelectTrigger id="framework">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent position="popper">
                {collaborators ? collaborators.filter(
                  (user, index, self) =>
                    index === self.findIndex(u => u.user.id === user.user.id)
                ).map(item => {
                  return (
                    <SelectItem key={item.user.id} value={item.user.id || 'كرار امير2'}>{item.user.name}</SelectItem>
                  )
                }) : <SelectItem value="IOS">No Collaborators</SelectItem>}
              </SelectContent>
            </Select>
          </div>}
        </div>
        <div className='md:col-span-2 mt-4 md:mt-0 w-full max-h-[400px] overflow-y-auto scroll-smooth ' style={{ scrollbarWidth: 'none' }}>
          <Table className='select-none'>
            <TableHeader >
              <TableRow className='w-full '>
                <TableHead className='text-nowrap text-black'>المبلغ الكلي</TableHead>
                <TableHead className='text-nowrap text-black'>القطع الشهري</TableHead>
                <TableHead className='text-nowrap text-black'>المبلغ بعد القطع</TableHead>
                <TableHead className='text-nowrap text-black' >الأشهر المتبقية</TableHead>
                <TableHead className='text-nowrap text-black' >تاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody >
              {Array.from({ length: months }, (_, index) => {
                // Ensure createdAt exists and clone it to avoid mutation
                const date = phone?.createdAt ? new Date(phone.createdAt) : new Date();
                date.setMonth(date.getMonth() + index); // Increment month




                const remaining =
                  phone?.price && phone?.fixedCut
                    ? Number(price) - parseInt(phone.fixedCut) * index
                    : 150;

                const remainingAmount =
                  parseInt(phone?.fixedCut!) >= remaining ? 0
                    : Number(price) - parseInt(phone?.fixedCut!) * (index + 1);
                // Determine installment amount
                const installment =
                  parseInt(phone?.fixedCut!) > remaining ? remaining : phone?.fixedCut;

                return (
                  <TableRow key={index} onDoubleClick={() => handlePayment(index)} className={`  relative ${isPriced.length > 0 && isPriced.find(item => item.position === index) ? 'pointer-events-none bg-black/15' : ''} cursor-pointer`}>
                    <TableCell className="text-black text-center ">{index === 0 ? price : remaining}</TableCell>
                    <TableCell className='text-red-700 text-center'>{installment}</TableCell>
                    <TableCell className='text-blue-700 text-center '>{String(remainingAmount)}</TableCell>
                    <TableCell className='text-center text-black'>{months - index}</TableCell>
                    <TableCell className="text-center">
                      {date.toLocaleDateString('en-CA').replaceAll('-', '/')}
                    </TableCell>
                    {isPaid[index] === true && <TableCell className=' bg-white z-20 absolute top-0 right-0 p-2 rounded-md border w-[200px]'>
                      <p className="font-semibold text-center mb-3">هل استلمت المبلغ؟</p>
                      <div className="flex justify-between items-center">
                        <Button className='bg-green-500 delay-100 hover:bg-green-400 font-semibold text-white' onClick={() => {
                          updatedPrice(index)
                          handleGetPhone()
                        }}>نعم</Button>
                        <Button className='bg-green-500 delay-100 hover:bg-green-400 font-semibold text-white' onClick={() => handlePayment(index)}>لا</Button>
                      </div>
                    </TableCell>}
                    {isPriced.length > 0 && isPriced.find(item => item.position == index) ? <TableCell className='absolute -top-4 -right-3 text-xl'>✅</TableCell> : ''}
                  </TableRow>

                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>

  )
}
