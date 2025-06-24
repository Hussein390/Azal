'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataPhones } from './dataProvider';

export function ItemsSearch() {
  const { isPhone, setSearch, search } = DataPhones();



  return (
    <div className='lg:flex mt-12'>
      <Card className="w-[300px]">
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
                  value={search.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearch(prev => ({ ...prev, name: value }))
                  }}
                  id="name"
                  placeholder="Item | Phone Name"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="framework">System</Label>
                <Select
                  value={search.type}
                  onValueChange={(value) => {
                    setSearch(prev => ({ ...prev, type: value }))
                  }}
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

      </Card>
    </div>
  );
}
