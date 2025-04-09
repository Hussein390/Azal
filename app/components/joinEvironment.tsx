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
import { useState } from "react"
import { collaboratorProps, getItems, getPhone, JoinEnviromnent } from "@/backend/envirnoment"
import { DataPhones, ItemProps, PhoneProps } from "./dataProvider"


export function JoinEnvironment({ setIsOpen }: { setIsOpen: (b: string | null) => void }) {
  const { showAlert, setItems, setPhones, isPhone } = DataPhones()
  const [environmentId, setEnvironmentId] = useState('')
  const [password, setPassword] = useState('')
  async function getPhones() {
    const EnvId = localStorage.getItem('envId');
    if (!EnvId) {
      console.error('Environment ID is missing!');
      return;
    }
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
  async function createEnv() {
    const data = { environmentId, password };
    if (!environmentId && !password) {
      showAlert("Either environmentId or Password is required!", false);
      return null;
    }
    await JoinEnviromnent(data as collaboratorProps);
    showAlert(environmentId + "added successfully ✅", true)
    setEnvironmentId('');
    setPassword('');
    getPhones()
    setIsOpen(null);
  }
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>انضم الى بيأت عمل</CardTitle>
        <CardDescription style={{ direction: 'rtl' }}>احصل على ال Id و ال Password من المالك للنضمام</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Environment Id</Label>
              <Input min={6} id="name" onChange={(e) => setEnvironmentId(e.target.value)} placeholder="Environment Id" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input type="password" min={6} id="password" onChange={(e) => setPassword(e.target.value)} placeholder="Environment Password" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setIsOpen(null)}>ألفاء</Button>
        <Button onClick={createEnv}>أنضمام</Button>
      </CardFooter>
    </Card>
  )
}
