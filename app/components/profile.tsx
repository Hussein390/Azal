"use client"
import { login, logout } from "@/actions/action"
import { Menubar, MenubarContent, MenubarItem, MenubarMenu } from "@/components/ui/menubar";
import { MenubarTrigger } from "@radix-ui/react-menubar";
import { useSession } from "next-auth/react";
import Image from "next/image";
export default function Profile() {
  const { data: session, status } = useSession();
  const Username = session?.user!.name || '';
  if (status === "loading") {
    return <p className="mr-3 animate-bounce">Loading...</p>;
  }

  if (!session) {
    return (
      <div>
        <button className="p-1 border bg-blue-500 hover:text-stone-300 text-white m-2 rounded" onClick={() => login('google')}>Sign In</button>
      </div>
    );
  }
  return (
    <Menubar className="border-none">
      <MenubarMenu >
        <MenubarTrigger >
          <div className="flex items-center gap-x-3">
            <h2 className="text-sm font-semibold text-black ">{Username!.length > 15 ? Username?.slice(0, 15) : Username}</h2>
            <Image width={26} height={26} className="rounded-full" src={session.user!.image || ''} alt={"Hussein saleem"} />
          </div>
        </MenubarTrigger>
        <MenubarContent className="border-none">
          <MenubarItem className="cursor-pointer " onClick={() => logout()}>Logout</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
} 