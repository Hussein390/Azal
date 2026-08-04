'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataPhones } from './dataProvider';
import { createType, delete_Type, get_Types } from '../../backend/envirnoment';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ItemsSearch() {

  const { showAlert, isPhone, setSearch, search } = DataPhones();
  const [AddType, setAddType] = React.useState('');
  const [Types, setTypes] = React.useState<any[]>([]);

  async function fetchTypes() {
    try {
      const EnvId = localStorage.getItem('envId')!;
      const res = await get_Types(EnvId) as any[];
      setTypes(res);
    } catch (error) {
      console.error('Error fetching types:', error);
    }
  }
  React.useEffect(() => {
    fetchTypes();
  }, []);

  async function Delete_Type(item: string) {
    const EnvId = localStorage.getItem("envId")!;

    const res = await delete_Type(item, EnvId);

    if (res instanceof Error) {
      showAlert(res.message, false);
      setAddType("");

    } else {
      showAlert("Type Deleted successfully", true);
      fetchTypes();
      setAddType("");
    }
  }

  return (
    <div className='lg:flex mt-12'>
      <Card className="w-[300px]">
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>You can search for items</CardDescription>
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
              <Select

                value={search.type || 'all'}
                onValueChange={(value) => {
                  setSearch(prev => ({ ...prev, type: value }));
                }}>
                <SelectTrigger id="framework">
                  <SelectValue placeholder="أختر" />
                </SelectTrigger>
                <SelectContent position="popper" className='w-full'>
                  {(() => {
                    if (!Types || Types.length === 0) {
                      return <SelectItem value="IOS">No Types</SelectItem>;
                    }

                    // Create a unique filtered list
                    const filtered = Types.filter(
                      (types, index, self) =>
                        index === self.findIndex(u => u.type === types.type)
                    );
                    // Render SelectItems
                    return (<>
                      {
                        filtered.map(item => (

                          <SelectItem
                            key={item.id}
                            value={item.type}
                            className=" pr-8 "
                          >
                            <span>{item.type}</span>


                          </SelectItem>
                        ))}
                      <SelectItem
                        value='all'
                        className="cursor-pointer"
                        key={"all"}>ALL</SelectItem>
                    </>)
                  })()}
                </SelectContent>
              </Select>
            </div>
          </form>

          <div className=" py-2 mt-3">
            <input type="text" placeholder='Type' value={AddType} onChange={(e) => setAddType(e.target.value)} className='p-2 border border-gray-300 rounded-md ' />
            <button
              onClick={async () => {
                const EnvId = localStorage.getItem('envId')!;
                const res = await createType({ environmentId: EnvId, type: AddType });
                if (res instanceof Error) {
                  showAlert(res.message, false);
                  setAddType('');
                } else {
                  showAlert('Type added successfully', true);
                  fetchTypes();
                  setAddType('');
                }
              }}
              className='bg-blue-500 mt-2  text-nowrap text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-300'>
              Add Type
            </button>
            <button
              type="button"
              className="bg-red-500 mt-2  ml-3 text-nowrap text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-300"
              onClick={async (e) => {
                console.log('ss')
                Delete_Type(AddType)
              }}
            >
              Delete
            </button>
          </div>
        </CardContent>

      </Card>
    </div>
  );
}
