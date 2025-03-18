'use client'
import React, { useEffect, useState } from 'react'
import { AddCollaborator } from '../components/AddCollaborator'
import { getEnvironmentById } from '../../backend/envirnoment'
import Image from 'next/image'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type collaboratorsProps = {
  role: string,
  user: {
    id: string,
    name: string,
    image: string
  }
}
type envirnomentProps = {
  id: string,
  name: string,
  owner: { name: string },
  password: string,
  phones: { creatorId: string, profit: string, price: string }[],
  items: any,
  collaborators: collaboratorsProps[],
}

export default function Page() {
  const [isOpen, setIsOpen] = useState<string | null>(null);
  const [envirnoment, setEnvironment] = useState<envirnomentProps>();
  const [collaborators, setCollaborators] = useState<string>();
  const [envId, setEnvId] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("envId") : null
  );

  useEffect(() => {

    async function fetchEnvironment() {
      try {
        const data = await getEnvironmentById({ id: envId! });
        setEnvironment(data as envirnomentProps);
        console.log(data)
      } catch (err) {
        console.error(err);
      }
    }
    fetchEnvironment();
  }, [envId]);

  return (
    <div className='max-w-5xl mx-auto mt-6 relative'>
      <div className="flex items-center gap-x-3">
        <button className="p-2 border hover:bg-blue-400 hover:text-white rounded-md delay-100"
          onClick={() => setIsOpen("add")}>Add</button>
      </div>

      {envirnoment ? (
        <div className="p-6 rounded-md border shadow mt-4 flex items-start justify-between">
          <div>
            <p className="my-2 font-sans font-semibold">
              Envirnoment Name: <span className='ml-1 text-blue-500'>{envirnoment.name}</span>
            </p>
            <p className="my-2 font-sans font-semibold">
              Owner: <span className='ml-1 text-green-500'>{envirnoment.owner.name}</span>
            </p>
            <p className="my-2 font-sans font-semibold">
              ID: <span className='ml-1 text-lime-600'>{envirnoment.id}</span>
            </p>
            <p className="my-2 font-sans font-semibold">
              Password: <span className='ml-1 text-cyan-600'>{envirnoment.password}</span>
            </p>
          </div>
          <div>
            <p className="my-2 font-sans font-semibold">
              Phones: <span className='ml-1 text-blue-500'>{envirnoment.phones.length}</span>
            </p>
            <p className="my-2 font-sans font-semibold">
              Collaborators: <span className='ml-1 text-green-500'>{envirnoment.collaborators.length}</span>
            </p>
            <p className="my-2 font-sans font-semibold">
              Items: <span className='ml-1 text-lime-600'>{envirnoment.items.length}</span>
            </p>
          </div>
        </div>
      ) : <p>No Environment</p>}

      <div className="p-3 rounded-md border mt-2 flex items-start justify-between">
        <div>
          <Image
            src={envirnoment?.collaborators?.find(item => item.user.name === (collaborators || "Hussein Salim"))?.user.image || "/azal.png"}
            width={150}
            height={150}
            alt={envirnoment?.collaborators?.[0]?.user?.name || "Missing"}
            className='rounded-md shadow'
          />
          <h2 className="text-lg  mt-2 font-semibold">
            {envirnoment?.collaborators?.find(item => item.user.name === (collaborators || "Hussein Salim"))?.user.name || "Missing"}
          </h2>
        </div>
        <div className="flex justify-between items-start gap-x-5 ">
          <div className="w-20 mt-1">
            <p className="text-nowrap">
              invested money: <span className='text-green-600 font-semibold'>{
                envirnoment?.phones
                  ?.filter(item => item.creatorId === envirnoment?.collaborators?.find(collab => collab.user.name === (collaborators ?? "Hussein Salim"))?.user.id)
                  ?.reduce((total, item) => total + Number(item.price || 0), 0) // Summing profit
              }
              </span>
            </p>
            <p className="text-nowrap mt-2">
              profit: <span className='text-green-600 font-semibold'>{
                envirnoment?.phones
                  ?.filter(item => item.creatorId === envirnoment?.collaborators?.find(collab => collab.user.name === (collaborators ?? "Hussein Salim"))?.user.id)
                  ?.reduce((total, item) => total + Number(item.profit || 0), 0) // Summing profit
              }
              </span>
            </p>
            <p className="text-nowrap mt-2">
              phones: <span className='text-green-600 font-semibold'>{
                envirnoment?.phones
                  ?.filter(item => item.creatorId === envirnoment?.collaborators?.find(collab => collab.user.name === (collaborators ?? "Hussein Salim"))?.user.id).length
              }
              </span>
            </p>
          </div>
        </div>
        <div className="w-[200px]">
          <Select onValueChange={value => setCollaborators(value)}>
            <SelectTrigger id="framework">
              <SelectValue className='placeholder:font-semibold' placeholder="اختر مستثمر  " />
            </SelectTrigger>
            <SelectContent position="popper">
              {envirnoment?.collaborators.map(item => (
                <SelectItem key={item.user.id} value={item.user.name}>{item.user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </div>

      {isOpen === "add" && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-white z-30 border">
          <AddCollaborator setIsOpen={setIsOpen} />
        </div>
      )}
    </div>
  )
}
