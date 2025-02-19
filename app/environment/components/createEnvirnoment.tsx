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
import { createAnEnvironment } from "../../../backend/envirnoment"
import { DataPhones } from "../../components/dataProvider"


export function CreateEnvironment({ setIsOpen }: { setIsOpen: (b: string | null) => void }) {
  const { showAlert } = DataPhones()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  async function createEnv() {
    const data = { name, password };
    if (!name && !password) {
      showAlert("Either Name or Password is required!", false);
      return null;
    }
    await createAnEnvironment(data);
    showAlert(name + "added successfully ✅", true)
    setName('');
    setPassword('');
    setIsOpen(null);
  }
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create Environment</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Environment</Label>
              <Input min={6} id="name" onChange={(e) => setName(e.target.value)} placeholder="Environment Name" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input type="password" min={6} id="password" onChange={(e) => setPassword(e.target.value)} placeholder="Environment Password" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setIsOpen(null)}>Cancel</Button>
        <Button onClick={createEnv}>Deploy</Button>
      </CardFooter>
    </Card>
  )
}
