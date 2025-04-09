'use client';
import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAnItem, getAPhone } from "../../backend/envirnoment";
import { DataPhones, ItemProps, PhoneProps } from './dataProvider';

export function ItemsSearch() {
  const { setPhones, setItems, isPhone, showAlert } = DataPhones();
  const [phone, setPhone] = React.useState<PhoneProps>({
    phoneName: '',
    type: '',
    environmentId: '',
    price: '',
    profit: '',
    buyerName: '',
    buyerNumber: '',
    firstPrice: '',
    fixedCut: '',
  });
  const [item, setItem] = React.useState<ItemProps>({
    itemName: '',
    type: '',
    environmentId: '',
    price: ''
  });

  async function searchPhone() {
    // Validate inputs
    if (isPhone == "Phone") {
      if (!phone.phoneName.trim()) {
        showAlert("Please enter a name", false);
        return;
      }
      if (!phone.type || !["IOS", "Android", "Items"].includes(phone.type)) {
        showAlert("Please select a valid system type", false);
        return;
      }
    } else if (isPhone === "Item") {
      if (!item.itemName.trim()) {
        showAlert("Please enter a name", false);
        return;
      }
      if (!item.type || !["IOS", "Android", "Items"].includes(item.type)) {
        showAlert("Please select a valid system type", false);
        return;
      }
    }
    const EnvId = localStorage.getItem('envId');
    if (!EnvId) {
      showAlert("Environment ID is missing. Please check your setup.", false);
      return;
    }

    phone.environmentId = EnvId;
    item.environmentId = EnvId;

    try {
      const [phones, items] = await Promise.all([
        getAPhone(phone),
        getAnItem(item)
      ]);
      if (isPhone === "Item") {
        setItems(items as ItemProps[]);
      } else if (isPhone === "Phone") {
        setPhones(phones as PhoneProps[]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showAlert("An error occurred while fetching data. Please try again.");
    }

    // Reset the phone & item fields after the search
    setPhone({
      phoneName: '',
      type: '',
      environmentId: '',
      price: '',
      profit: '',
      buyerName: '',
      buyerNumber: '',
      firstPrice: '',
      fixedCut: '',
    });
    setItem({ itemName: '', type: '', environmentId: '', price: '' });
  }


  return (
    <div className=' lg:flex mt-12'>
      <Card className="w-[300px] ">
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>You can search for Phones & Items</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  value={isPhone === "Phone" ? phone.phoneName : item.itemName}
                  onChange={(e) =>
                    isPhone === "Phone" ?
                      setPhone((prev) => ({ ...prev, phoneName: e.target.value }))
                      :
                      setItem((prev) => ({ ...prev, itemName: e.target.value }))
                  }
                  id="name"
                  placeholder="Item | Phone Name"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="framework">System</Label>
                <Select
                  value={isPhone === "Phone" ? phone.type : item.type || "Android"}
                  onValueChange={(value) =>
                    isPhone === "Phone" ?
                      setPhone((prev) => ({ ...prev, type: value }))
                      :
                      setItem((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger id="framework">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="IOS">IOS</SelectItem>
                    <SelectItem value="Android">Android</SelectItem>
                    <SelectItem value="Items">Items</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={searchPhone}>Search</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
