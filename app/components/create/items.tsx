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
import { create_Fix_Phone, createFixPhoneProps, createItem, createPhone, get_Fix_Phones, getEnvironmentById, getItems, getPhone } from "../../../backend/envirnoment"
import { DataPhones, ItemProps, PhoneProps } from "../dataProvider"
import Phones from "./phones"

export function ItemsCreate({ setOpen }: { setOpen: (b: string | null) => void }) {
  const { setPhones, setFixPhones, showAlert, setItems, isPhone } = DataPhones();
  const [collaborators, setCollaborators] = React.useState([{ user: { id: '', name: '' } }]);
  const [open, setIsOpen] = React.useState("Phone");
  const [FixPhone, setFixPhone] = React.useState<createFixPhoneProps>({
    phoneName: '',
    clientName: '',
    clientNumber: '',
    price: '',
    firstPrice: '',
    profit: '',
    type: 'Android',
    environmentId: '',
    userId: '',
    bug: ''
  });
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
    id: '',
    itemName: '',
    price: '',
    type: 'Android',
    environmentId: '',
    image: '',
    userId: '',
    length: '1',
    creator: {
      name: ''
    }
  });
  async function getPhones() {
    const EnvId = localStorage.getItem('envId')!;

    if (isPhone === "Items") {
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

  async function CREATE_FIX_PHONE() {
    try {
      if (FixPhone) {
        if (!FixPhone.phoneName.trim()) {
          showAlert("Please enter a name", false);
          return;
        }
        if (!FixPhone.price) {
          showAlert("Please add a price", false);
          return;
        }
        if (!FixPhone.type) {
          showAlert("Please select a system type", false);
          return;
        }
      }

      const EnvId = localStorage.getItem("envId");
      if (!EnvId) {
        showAlert("Environment ID not found", false);
        return;
      }

      FixPhone.environmentId = EnvId;
      const res = await create_Fix_Phone(FixPhone);
      if (res instanceof Error) {
        showAlert(res.message, false);
        setOpen(null);
        return;
      }
      if (res) {
        showAlert("FixPhone created successfully ✅", true);
        getPhones();
      }
      // Close modal and reset form
      setOpen(null);
      setFixPhone(prev => ({
        ...prev,
        phoneName: "",
        clientName: "",
        clientNumber: "",
        profit: "",
        price: "",
        type: "Android",
        bug: ''
      }));

    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log("Error------", err);
      } else {
        console.log("Unknown error occurred");
      }
    }
  }
  async function CREATE_PHONE() {
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
  async function CREATE_ITEMS() {
    if (item) {
      if (!item.itemName.trim()) {
        showAlert("Please enter a name", false);
        return;
      }
      if (!item.price) {
        showAlert("Please add a price", false);
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
      image: '',
      userId: '',
      length: '1',
      creator: {
        name: ''
      }
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



  React.useEffect(() => {
    getUserId()
  }, [])
  return (
    <Card className={` delay-50 min-w-[360px]`}>
      <CardHeader>
        <CardTitle>Create</CardTitle>
        <CardDescription>You can create Phones & Items</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-x-2 mb-3">
          {/* <button className={`${open == "Item" ? 'bg-blue-400 text-white ' : ''} p-2 rounded-md border hover:bg-blue-500 hover:text-white`} onClick={e => setIsOpen((e.target as HTMLButtonElement).innerText)}>FixPhone</button> */}
          <button className={`${open == "Phone" ? 'bg-blue-400 text-white ' : ''} p-2 rounded-md border hover:bg-blue-500 hover:text-white`} onClick={e => setIsOpen((e.target as HTMLButtonElement).innerText)}>Phone</button>
          <button className={`${open == "Items" ? 'bg-blue-400 text-white ' : ''} p-2 rounded-md border hover:bg-blue-500 hover:text-white`} onClick={e => setIsOpen((e.target as HTMLButtonElement).innerText)}>Items</button>
        </div>
        <form >
          {open === "Phone" ?
            < Phones phone={phone} open={open} setItem={setItem} setPhone={setPhone} collaborators={collaborators} />

            :
            <div id='main' className="flex justify-between gap-x-4 w-full items-start gap-4">
              <div className="w-full flex flex-col gap-y-3">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">أسم العنصر</Label>
                  <Input onChange={(e) => {
                    setItem(prev => ({ ...prev, itemName: e.target.value }));
                  }} value={item.itemName} id="name" placeholder={'Phone Name'} className="appearance-none" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="Price">السعر</Label>
                  <Input onChange={(e) => {
                    setItem(prev => ({ ...prev, price: e.target.value }));

                  }} value={item.price} type="number" id="Price" placeholder={'Phone Price'} className="appearance-none" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="Pieces">العدد</Label>
                  <Input onChange={(e) => {
                    setItem(prev => ({ ...prev, length: e.target.value }));

                  }} value={item.length} type="number" id="Pieces" placeholder={'Pieces'} className="appearance-none" />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="Image">صوره</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    id="Image"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setItem((prev) => ({ ...prev, image: reader.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />

                </div>
              </div>
            </div>
          }
          {open == "Items" &&
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
            </div>}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setOpen(null)}>Cancel</Button>
        <Button onClick={() => open === "Phone" ? CREATE_PHONE() : open === "FixPhone" ? CREATE_FIX_PHONE() : open === 'Items' ? CREATE_ITEMS() : ''}>Create</Button>
      </CardFooter>
    </Card>
  );
}

