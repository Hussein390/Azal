"use client"
import { useState } from "react"
import Profile from "./profile"
import { SessionProvider } from "next-auth/react"
import Search from "../environment/components/search"
import { ItemsCreate } from "./create/items"
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<string | null>(null);

  return (
    <div className="relative flex items-center justify-between">
      <div className="flex items-center gap-x-4">
        <SessionProvider>
          <Profile />
        </SessionProvider>
        <Search />
      </div>
      <div className="flex items-center gap-x-3">
        <button className="p-2 border  hover:bg-blue-400 hover:text-white rounded-md delay-100" onClick={() => { setIsOpen("item") }}>Create Phone</button>

        < button className="p-2 border hidden md:flex hover:bg-blue-400 hover:text-white   rounded-md delay-100" onClick={() => { router.push('/environment') }}>Environment</button>
      </div>

      {isOpen === "item" && <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-white z-30"><ItemsCreate setOpen={setIsOpen} /></div>}
    </div>
  )
}
