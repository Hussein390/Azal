"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createFixPhoneProps, deleteItem, get_Fix_Phones, getEnvironmentById, getItems, getPhone, updateItem} from '../../backend/envirnoment'
import { DataPhones, ItemProps, PhoneProps } from './dataProvider'
import { useRouter } from 'next/navigation'
import jsPDF from 'jspdf';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import html2canvas from 'html2canvas'

type UpdateState = {
  length?: string;
  fixedLength?: string;
  sellPrice?: string;
  text?: string;
  boughtPrice?: string;
  installmentPrice?: string;
};
export default function Tables() {
  const { showAlert, phones, setPhones, search, setFixPhones, setIsPhone, isPhone, items, setItems, EnvironmentName } = DataPhones();
  const router = useRouter()
  const [open, setOpen] = useState<{ [key: number]: boolean }>({});
  const [allMoney, setAllMoney] = useState<number>(0);
  const [allItemsMoney, setAllItemsMoney] = useState<{sellPrice: number, installmentsPrice: number, boughtPrice: number}>({sellPrice: 0, boughtPrice: 0,installmentsPrice:0});

  const [isUpdate, setIsUpdate] = useState<{ [key: number]: boolean }>({});
  const [update, setUpdate] = useState<UpdateState>({});
  const USER = typeof window !== "undefined"
    ? localStorage.getItem("chosen")
    : null;


    //Generate PDF
    const PDFRef = useRef<HTMLDivElement | null>(null)
    
async function handleGeneratePDF() {
  try {
    const element = PDFRef.current!;
    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;
    
    element.style.height = 'auto';
    element.style.overflow = 'visible';
    
    // Format date as 2026/4/20
    const now = new Date();
    const currentDate = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
    
    // Create header
    const headerDiv = document.createElement('div');
    headerDiv.style.cssText = `
      padding:8px;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
      gap: 5px;
      font-size: 23px;
      font-weight: bold;
      text-align: center;
    `;
    
    headerDiv.innerHTML = `
      <span>${EnvironmentName?.name || 'Hussein'}</span>
      <span> التاريخ: ${currentDate}</span>
    `;
    
    element.insertBefore(headerDiv, element.firstChild);
    
    // Apply compact styles
    const tableCells = element.querySelectorAll('th, td');
    const originalPadding: string[] = [];
    tableCells.forEach((cell, index) => {
      const el = cell as HTMLElement;
      originalPadding[index] = el.style.padding || '';
      el.style.padding = '5px 5px';
      el.style.fontSize = '16px';
    });
    
    const rows = element.querySelectorAll('tr');
    rows.forEach(row => {
      (row as HTMLElement).style.lineHeight = '1.4';
    });
    
    const container = element.parentElement;
    const originalContainerPadding = container?.style.padding;
    if (container) container.style.padding = '0';
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const canvas = await html2canvas(element, {
      scale: 1.9,
      useCORS: true,
      allowTaint: true,
      windowHeight: element.scrollHeight,
      height: element.scrollHeight,
    });
    
    // Remove temporary header
    if (headerDiv && headerDiv.parentNode) {
      headerDiv.remove();
    }
    
    // Restore original styles
    element.style.height = originalHeight;
    element.style.overflow = originalOverflow;
    tableCells.forEach((cell, index) => {
      const el = cell as HTMLElement;
      el.style.padding = originalPadding[index];
      el.style.fontSize = '';
    });
    rows.forEach(row => {
      (row as HTMLElement).style.lineHeight = '';
    });
    if (container) container.style.padding = originalContainerPadding || '';
    
    const imgData = canvas.toDataURL('image/png');
    
    // CHANGE THIS LINE - from 'landscape' to 'portrait'
    const pdf = new jsPDF({
      orientation: 'portrait',  // Changed from 'landscape'
      unit: 'px',
    });
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    let heightLeft = imgHeight;
    let position = 0;
    let pageCount = 0;
    
    while (heightLeft > 0) {
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
      position -= pdfHeight;
      if (heightLeft > 0) pdf.addPage();
      pageCount++;
    }
    
    console.log(`Generated ${pageCount} pages`);
    pdf.save("Azal.pdf");
    
  } catch (err: unknown) {
    if (err instanceof Error) console.log(err.message);
  }
}
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
      const name = search.name.toLowerCase() === "" ? true
                        : task.buyerName!.toLowerCase().includes(search.name.toLowerCase());
      return  task.creator?.id === ownerID || ownerID === 'all-users' && name;
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

 const totalItemsMoney = useMemo(() => {
  const boughtPrice = items.reduce((sum, task) =>
    sum + (Number(task.boughtPrice) || 0) * (Number(task.length) || 0),
    0);
  
  const sellPrice = items.reduce((sum, task) =>
    sum + (Number(task.sellPrice) || 0) * (Number(task.length) || 0),
    0);
  
  const installmentsPrice = items.reduce((sum, task) =>
    sum + (Number(task.installmentPrice) || 0) * (Number(task.length) || 0),
    0);

  return { boughtPrice, sellPrice, installmentsPrice };
}, [items]);

  useEffect(() => {
    setAllMoney(totalMoney);
  }, [totalMoney]);
  useEffect(() => {
    setAllItemsMoney(totalItemsMoney);
  }, [totalItemsMoney]);




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

    if (update.length !== undefined) object.length = update.length;
    if (update.fixedLength !== undefined) object.fixedLength = update.fixedLength;
    if (update.sellPrice !== undefined) object.sellPrice = update.sellPrice;
    if (update.boughtPrice !== undefined) object.boughtPrice = update.boughtPrice;
    if (update.installmentPrice !== undefined) object.installmentPrice = update.installmentPrice;
    if (update.text !== undefined) object.text = update.text;

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
    
    setUpdate({ });
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
    const decreasedLength = String(Number(currentItem.length) - 1);
    
    const object = {
      environmentId: EnvId,
      id: item.id,
      length: decreasedLength, // Use decreased length, not update.length
      fixedLength: update.fixedLength,
      sellPrice: update.sellPrice,
      boughtPrice: update.boughtPrice,
      text: update.text,
      installmentPrice: update.installmentPrice
    };

     await updateItem(object);
    
    
      showAlert(`Item purchased! Remaining: ${decreasedLength}`, true);
      
      setIsUpdate(prev => ({ ...prev, [index]: false }));
      setOpen(prev => ({ ...prev, [index]: false }));

      // Update local state to match server
      setItems(prev =>
        prev.map(i =>
          i.id === item.id
            ? { ...i, length: decreasedLength }
            : i
        )
      );

      setUpdate({});
    } else {
      showAlert('Failed to update item on server', false);
      // Optionally refresh data from server to sync
    }
  
}

  // Delete Item
  async function DeletItem(item: { id: string }, index: number) {
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
    setOpen(prev => ({ ...prev, [index]: false }))
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
          onClick={e => setIsPhone('Item')}
        >
          العناصر
        </button>
        <button
          className={`${isPhone == "Phone" ? 'bg-blue-400 text-white ' : ''} p-2 rounded-md border hover:bg-blue-500 hover:text-white`}
          onClick={e => setIsPhone('Phone')}
        >
          الاقساط
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
          <div className="md:ml-12 md:text-lg font-bold">مجموع القطع الشهري: <span className='text-blue-500'>{allMoney}</span></div>
        }
        {isPhone === "Item" &&
          <div className="md:ml-12 font-semibold  flex items-center gap-x-5">
            <button onClick={handleGeneratePDF} className='p-2 text-sm mr-4 rounded border bg-slate-100 hover:bg-slate-200 delay-75 '>Download PDF</button>
            <div>سعر الشراء الكلي: <span className='text-blue-600'>{allItemsMoney.boughtPrice}</span></div>
            <div>سعر البيع الكلي: <span className='text-green-600'>{allItemsMoney.sellPrice}</span></div>
            <div>سعر التقسيط الكلي: <span className='text-yellow-600'>{allItemsMoney.installmentsPrice}</span>
            </div>
          </div>
        } 
      </div>
      <div className=' mx-auto max-h-[650px] overflow-y-auto relative w-full' style={{ scrollbarWidth: 'none' }}>
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
        <div ref={ PDFRef} className='w-full font-sans font-semibold '>

          < Table >
            <TableHeader>
  <TableRow className='border-b border-b-black'>
    <TableHead className="text-nowrap">عدد العناصر</TableHead>
    <TableHead className="text-center w-48">اسم العنصر</TableHead>
    <TableHead>سعر الشراء</TableHead>
    <TableHead>سعر البيع</TableHead>
    <TableHead>سعر التقسيط</TableHead>
    <TableHead>العدد الثابت</TableHead>
    <TableHead>العدد</TableHead>
    <TableHead>ملاحضه</TableHead>
    <TableHead >التاريخ</TableHead>
    <TableHead className="text-right">المالك</TableHead>
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
                    return name ;
                  }).map((item, index) => (

                    <TableRow className="cursor-pointer select-none text-center relative" onDoubleClick={() => setOpen(prev => ({ ...prev, [index]: !prev[index] }))} key={index}>
                      <TableCell className="font-medium w-3">{index + 1}</TableCell>
                      <TableCell className="font-medium text-left">{item.itemName}</TableCell>
                      <TableCell className='text-blue-600'>{item.boughtPrice}</TableCell>
                      <TableCell className="font-sans font-semibold relative text-green-600">
                        {!isUpdate[index]? item.sellPrice 
                        : <input value={update.sellPrice} onChange={(e) => setUpdate(prev => ({ ...prev, sellPrice: e.target.value }))} type="text" className='rounded-full absolute top-3 left-5 m-0 p-2 h-7 w-14 border-slate-400 border' />}
                      </TableCell>
                      <TableCell className="font-sans font-semibold relative text-red-600">
                        
                        {!isUpdate[index] ? item.installmentPrice
                        : <input value={update.installmentPrice} onChange={(e) => setUpdate(prev => ({ ...prev, installmentPrice: e.target.value }))} type="text" className='rounded-full absolute top-3 right-10 m-0 p-2 h-7 w-14 border-slate-400 border' />}
                      </TableCell>
                      <TableCell className="font-sans font-semibold relative text-yellow-600">
                        {item.fixedLength}
                        {/* {!isUpdate[index]
                        : <input value={update.fixedLength} onChange={(e) => setUpdate(prev => ({ ...prev, fixedLength: e.target.value }))} type="text" className='rounded-full absolute top-3 left-2 m-0 p-2 h-7 w-14 border-slate-400 border' />} */}
                      </TableCell>
                      <TableCell className="font-sans font-semibold relative">
                        
                        {!isUpdate[index] ? item.length
                        : <input value={update.length} onChange={(e) => setUpdate(prev => ({ ...prev, length: e.target.value }))} type="text" className='rounded-full absolute top-3 left-5 m-0 p-2 h-7 w-14 border-slate-400 border' />}
                      </TableCell>
                      <TableCell className="font-sans font-semibold relative text-blue-600">
                        
                        {!isUpdate[index] ?item.text
                        : <input  value={update.text} onChange={(e) => setUpdate(prev => ({ ...prev, text: e.target.value }))} type="text" className='rounded-full absolute top-3 left-2 m-0 p-2 h-7 w-14 border-slate-400 border' />}
                      </TableCell>
                      <TableCell >
                        {item.createdAt ? item.createdAt.toLocaleDateString('en-CA').replaceAll('-', '/') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right select-none ">{item.creator?.name ?? 'Hussein'}</TableCell>
                      {open[index] && <TableCell className="flex gap-x-2 p-2 items-center m-0 absolute top-0 right-0 bg-slate-300 rounded-3xl">
                        <button onClick={() => {
                          setOpen(prev => ({ ...prev, [index]: false }))
                          setIsUpdate(prev => ({ ...prev, [index]: !prev[index] }))
                          setUpdate({
                              length: item.length,
                              sellPrice: item.sellPrice,
                              text: item.text,
                              boughtPrice: item.boughtPrice,
                              installmentPrice: item.installmentPrice
                            })
                        }} className=" bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
                          Edit
                        </button>
                        <button onClick={() => DeletItem(item, index)} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600">
                          Delete
                        </button>
                        <button onClick={() => BuyItem(item, index)} className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600">
                          Buy
                        </button>
                      </TableCell>}
                      {isUpdate[index] && <TableCell className="flex gap-x-3 items-center m-0 p-2 absolute top-0 right-0 bg-slate-300 rounded-3xl">
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
