'use client'
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
import { accessEmailsProps, addAccessEmails } from "../../backend/envirnoment"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataPhones } from "./dataProvider"


export function AddCollaborator({ setIsOpen }: { setIsOpen: (b: string | null) => void }) {
  const { showAlert } = DataPhones();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('VIEWER')

  async function createEnv() {
    try {
      const EnvId = localStorage.getItem("envId");
      const data = { email, role, environmentId: EnvId! };
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showAlert("Please, enter a valid email  \"example@email.com\"✅", false);
        return;
      }
      if (!EnvId) {
        showAlert("No Environment id is found", false);
        return;
      }
      const response = await addAccessEmails(data as accessEmailsProps);

      if (response instanceof Error) {
        showAlert(response.message, false);
        setIsOpen(null);
        return;
      }

      showAlert(email + " added successfully ✅", true);
      setEmail('');
      setRole('VIEWER');
      setIsOpen(null);

    } catch (err: unknown) {
      if (err instanceof Error) {
        showAlert(err.message, false)
        console.log(err.message)
        return
      } else return
    }
  }
  return (
    <Card className="w-[350px]" style={{ direction: 'rtl' }}>
      <CardHeader>
        <CardTitle className="font-sans tracking-wider">مستثمر</CardTitle>
        <CardDescription className={`font-sans font-semibold `}>قم بأضافت البريد الخاص بل المستثمر</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="Email">Email</Label>
              <Input min={6} type="email" id="Email" onChange={(e) => setEmail(e.target.value)} placeholder="Enter Your Email" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="framework">Role</Label>
              <Select value={role || "VIEWER"} onValueChange={e => setRole(e)}>
                <SelectTrigger id="framework">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={createEnv}>Create</Button>
        <Button variant="outline" onClick={() => setIsOpen(null)}>Cancel</Button>
      </CardFooter>
    </Card>
  )
}
