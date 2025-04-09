'use client'
import React, { useEffect, useState, useRef } from 'react'

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
import { createFixPhoneProps, delete_Fix_Phone, get_A_Fix_Phone } from '@/backend/envirnoment';


export default function page({ params }: { params: Promise<{ phone: string }> }) {

  const [phone, setPhone] = useState<createFixPhoneProps | null>(null);

  const PDFRef = useRef<HTMLDivElement | null>(null)
  const Router = useRouter()
  const date = new Date();
  const formattedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
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

  async function handleGetPhone() {
    const id = (await params).phone;
    if (!id) return;

    const data = await get_A_Fix_Phone(id);
    setPhone(data as createFixPhoneProps)

    return;
  }
  useEffect(() => {
    handleGetPhone()

  }, [])



  return (
    <div ref={PDFRef} style={{ direction: 'rtl' }} className='md:w-[520px] text-sm  mt-16 p-8 rounded-md border shadow-sm mx-auto  relative'>
      <div className="flex items-center gap-x-6 absolute -top-12 left-0">
        <Link href={'/'} className='p-2 rounded border bg-slate-100 hover:bg-slate-200 delay-75 '><ArrowLeft /></Link>
        <button onClick={handleGeneratePDF} className='p-2 rounded border bg-slate-100 hover:bg-slate-200 delay-75 '>Download PDF</button>

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
                await delete_Fix_Phone(id, envId)
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
        <div className=" flex flex-col gap-y-4 text-right text-nowrap font-semibold">
          <p className="font-sans border-b w-fit pb-2 ">أسم الهاتف: <span className='mr-2 font-semibold'>{phone?.phoneName}</span></p>
          <p className="font-sans ">السعر: <span className='text-blue-600 mr-2 font-semibold'>{Number(phone?.price) + Number(phone?.profit)} ألف</span></p>
          <p className="font-sans profit">الربح: <span className='text-green-600 mr-2 font-semibold'>{phone?.profit} ألف</span></p>
          <p className="font-sans ">المقدمه: <span className='text-green-600 mr-2 font-semibold'>{phone?.firstPrice || 0} ألف</span></p>
          <p className="font-sans ">العطل: <span className='text-green-600 mr-2 font-semibold'>{phone?.bug} </span></p>
          <p className="font-sans border-t w-fit pt-2">أسم العميل: <span className='text-black mr-2 font-semibold'>{phone?.clientName || 'Hussein'} </span></p>
          <p className="font-sans ">رقم العميل: <span className='text-blue-600 mr-2 font-semibold'>{phone?.clientNumber || 'لا يوجد رقم'} </span></p>
          <p className="font-sans owner">المالك: <span className='text-blue-600 mr-2 font-semibold'>{phone?.creator?.name || 'لا يوجد مالك'} </span></p>
        </div>
      </div>
    </div>

  )
}
