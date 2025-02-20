"use client"
import { useEffect, useState } from "react"
import Profile from "./profile"
import { SessionProvider } from "next-auth/react"
import Search from "../environment/components/search"
import { ItemsCreate } from "./itemsCreate"
import { useRouter } from 'next/navigation'
import { JoinEnvironment } from "./joinEvironment"
import { getCollaborators } from "@/backend/envirnoment"
import { CreateEnvironment } from "../environment/components/createEnvirnoment"

export default function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<string | null>(null);
  const [role, setRole] = useState<"VIEWER" | "ADMIN">("VIEWER");
  async function getRole() {
    const EnvId = localStorage.getItem('envId');
    if (!EnvId) {
      console.error('Environment ID is missing!');
      return;
    }
    const res = await getCollaborators(EnvId);
    if (res instanceof Error) return "Error happened"
    if (typeof res === "object" && res !== null && "role" in res) {
      setRole(res.role);
    } else {
      console.log("Failed to fetch role:", res);
    }
    return
  }
  useEffect(() => {
    getRole()
  }, [])
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
        <button className="p-2 border  hover:bg-blue-400 hover:text-white rounded-md delay-100" onClick={() => { setIsOpen("join") }}>Join</button>
        <button className="p-2 border hidden md:flex hover:bg-blue-400 hover:text-white   rounded-md delay-100" onClick={() => { setIsOpen("env") }}>Create Environment</button>
        {role !== "VIEWER" &&
          < button className="p-2 border hidden md:flex hover:bg-blue-400 hover:text-white   rounded-md delay-100" onClick={() => { router.push('/environment') }}>Environment</button>
        }
      </div>
      {isOpen === "env" && <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-white z-30"><CreateEnvironment setIsOpen={setIsOpen} /></div>}
      {isOpen === "item" && <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-white z-30"><ItemsCreate setOpen={setIsOpen} /></div>}
      {isOpen === "join" && <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-white z-30"><JoinEnvironment setIsOpen={setIsOpen} /></div>}
    </div>
  )
}