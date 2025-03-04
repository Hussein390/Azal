"use client"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createItem, createPhone, getEnvironmentById, getItems, getPhone } from "../../backend/envirnoment"
import { DataPhones, ItemProps, PhoneProps } from "./dataProvider"

export function ItemsCreate({ setOpen }: { setOpen: (b: string | null) => void }) {
  const { setPhones, showAlert, setItems, isPhone } = DataPhones();
  const [collaborators, setCollaborators] = React.useState([{ user: { id: '', name: '' } }]);
  const [open, setIsOpen] = React.useState("Item");
  const [phone, setPhone] = React.useState<PhoneProps>({
    phoneName: '',
    buyerName: '',
    buyerNumber: '',
    price: '',
    firstPrice: '',
    profit: '',
    fixedCut: '',
    type: 'Android',
    environmentId: '',
    userId: ''
  });
  const [item, setItem] = React.useState<ItemProps>({
    itemName: '',
    price: '',
    type: 'Android',
    environmentId: ''
  });
  async function getPhones() {
    const EnvId = localStorage.getItem('envId')!;

    const [phones, items] = await Promise.all([
      getPhone(EnvId),
      getItems(EnvId)
    ]);
    if (isPhone === "Item") {
      setItems(items as ItemProps[]);
    } else if (isPhone === "Phone") {
      setPhones(phones as PhoneProps[]);
    }
  }
  async function createAPhone() {
    try {
      if (phone) {
        if (!phone.phoneName.trim()) {
          showAlert("Please enter a name", false);
          return;
        }
        if (!phone.price) {
          showAlert("Please add a price", false);
          return;
        }
        if (!phone.type) {
          showAlert("Please select a system type", false);
          return;
        }
      }

      const EnvId = localStorage.getItem("envId");
      if (!EnvId) {
        showAlert("Environment ID not found", false);
        return;
      }

      phone.environmentId = EnvId;
      const res = await createPhone(phone);
      if (res instanceof Error) {
        showAlert(res.message, false);
        setOpen(null);
        return;
      }
      if (res) {
        showAlert("Phone created successfully ✅", true);
        getPhones();
      }
      // Close modal and reset form
      setOpen(null);
      setPhone(prev => ({
        ...prev,
        phoneName: "",
        buyerName: "",
        buyerNumber: "",
        profit: "",
        fixedCut: "",
        price: "",
        type: "Android",
      }));

    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log("Error------", err);
      } else {
        console.log("Unknown error occurred");
      }
    }
  }

  async function createItems() {
    if (item) {
      if (!item.itemName.trim()) {
        showAlert("Please enter a name", false);
        return;
      }
      if (!item.price) {
        showAlert("Please add a price", false);
        return;
      }

      if (!item.type) {
        showAlert("Please select a system type", false);
        return;
      }
    }
    const EnvId = localStorage.getItem('envId');
    item.environmentId = EnvId!;
    const res = await createItem(item);
    if (res instanceof Error) {
      showAlert(res.message, false);
      setOpen(null);
      return;
    }
    if (res) {
      showAlert("Item created successfully", true);
      getPhones();
    }

    setItem(prev => ({
      ...prev,
      itemName: '',
      price: 'Android',
      type: '',
    }));
    setOpen(null)
    return
  }
  ///
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

  // async function getUserId() {
  //   const EnvId = localStorage.getItem('envId')!;
  //   const res = await getEnvironmentById({ id: EnvId });

  //   console.log(res);

  //   // Check if res is an instance of an Error
  //   if (res instanceof Error) {
  //     console.error("Failed to fetch environment:", res.message);
  //     return;
  //   }

  //   // Ensure res has the expected structure
  //   if (res && typeof res === 'object' && 'owner' in res && 'collaborators' in res) {
  //     const formattedData = [];

  //     // Process the owner data
  //     if (res.owner) {
  //       formattedData.push({ user: { id: res.owner.id, name: res.owner.name || '' } });
  //     }

  //     // Process the collaborators data
  //     if (Array.isArray(res.collaborators)) {
  //       res.collaborators.forEach(collab => {
  //         if (collab.user) {
  //           formattedData.push({ user: { id: collab.user.id, name: collab.user.name || '' } });
  //         }
  //       });
  //     }

  //     setCollaborators(formattedData);
  //   } else {
  //     console.error("Unexpected response format:", res);
  //   }
  // }



  React.useEffect(() => {
    getUserId()
  }, [])
  return (
    <Card className={` delay-50 w-[320px] ${open === "Phone" && 'w-[520px]'}`}>
      <CardHeader>
        <CardTitle>Create</CardTitle>
        <CardDescription>You can create Phones & Items</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-x-2 mb-3">
          <button className={`${open == "Item" ? 'bg-blue-400 text-white ' : ''} p-2 rounded-md border hover:bg-blue-500 hover:text-white`} onClick={e => setIsOpen((e.target as HTMLButtonElement).innerText)}>Item</button>
          <button className={`${open == "Phone" ? 'bg-blue-400 text-white ' : ''} p-2 rounded-md border hover:bg-blue-500 hover:text-white`} onClick={e => setIsOpen((e.target as HTMLButtonElement).innerText)}>Phone</button>
        </div>
        <form>
          <div className="flex justify-between gap-x-4 w-full items-start gap-4">
            <div className="w-full flex flex-col gap-y-3">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">{open === "Phone" ? 'أسم الهاتف' : 'أسم العنصر'}</Label>
                <Input onChange={(e) => {
                  if (open === "Item") {
                    setItem(prev => ({ ...prev, itemName: e.target.value }));
                  } else if (open === "Phone") {
                    setPhone(prev => ({ ...prev, phoneName: e.target.value }));
                  }
                }} value={open === "Item" ? item.itemName : phone.phoneName} id="name" placeholder={`${open === 'Phone' ? 'Phone' : 'Item'} Name`} className="appearance-none" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="Price">السعر</Label>
                <Input onChange={(e) => {
                  if (open === "Item") {
                    setItem(prev => ({ ...prev, price: e.target.value }));
                  } else if (open === "Phone") {
                    setPhone(prev => ({ ...prev, price: e.target.value }));
                  }
                }} value={open === "Item" ? item.price : phone.price} type="number" id="Price" placeholder={`${open === 'Phone' ? 'Phone' : 'Item'} Price`} className="appearance-none" />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="framework">النضام</Label>
                <Select value={open === "Phone" ? phone.type : item.type || "Android"} onValueChange={(value) => {
                  if (open === "Item") {
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
                    {open === 'Item' && <SelectItem value="Items">Items</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="framework">المالك</Label>
                <Select value={phone.userId} onValueChange={(value) => setPhone(prev => ({ ...prev, userId: value }))}>
                  <SelectTrigger id="framework">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {collaborators ? collaborators.map(item => {
                      return (
                        <SelectItem key={item.user.id} value={item.user.id || 'a'}>{item.user.name}</SelectItem>
                      )
                    }) : <SelectItem value="IOS">No Collaborators</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {open === "Phone" &&
              <div className="w-full flex flex-col gap-y-3">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="profit">الربح</Label>
                  <Input type="number" onChange={(e) => {
                    setPhone(prev => ({ ...prev, profit: e.target.value }));
                  }} value={phone.profit} id="profit" placeholder="Profit" />
                </div>
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
              </div>
            }
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setOpen(null)}>Cancel</Button>
        <Button onClick={() => open === "Item" ? createItems() : createAPhone()}>Create</Button>
      </CardFooter>
    </Card>
  );
}

