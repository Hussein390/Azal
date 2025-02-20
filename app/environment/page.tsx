'use client'
import React, { useEffect, useState } from 'react'
import { AddCollaborator } from '../components/AddCollaborator'
import { getEnvironmentById } from '../../backend/envirnoment'

export default function page() {
  const [isOpen, setIsOpen] = useState<string | null>(null)
  const [envirnoment, setEnvironment] = useState<any>()

  async function getEnvirnoment() {
    try {
      const EnvId = localStorage.getItem('envId');
      const envirnoment = await getEnvironmentById({ id: EnvId! });
      setEnvironment(envirnoment)
      console.log(envirnoment)
    } catch (err: unknown) {
      if (err instanceof Error) console.log(err.message)
      else return;
    }
  }
  useEffect(() => {
    getEnvirnoment()
  }, [])
  return (
    <div className='max-w-5xl mx-auto mt-6 relative'>
      <div className="flex items-center gap-x-3 ">
        <button className="p-2 border  hover:bg-blue-400 hover:text-white rounded-md delay-100" onClick={() => { setIsOpen("add") }}>Add</button>
      </div>

      {envirnoment ? <div className="p-6 rounded-md border shadow mt-4 flex items-start justify-between">
        <div className="">
          <p className="my-2 font-sans font-semibold">Envirnoment Name: <span className='ml-1 text-blue-500'>{envirnoment.name}</span></p>
          <p className="my-2 font-sans font-semibold">Envirnoment Owner: <span className='ml-1 text-green-500'>{envirnoment.owner.name}</span></p>
          <p className="my-2 font-sans font-semibold">Envirnoment id: <span className='ml-1 text-lime-600'>{envirnoment.id}</span></p>
          <p className="my-2 font-sans font-semibold">Envirnoment password: <span className='ml-1 text-cyan-600'>{envirnoment.password}</span></p>
        </div>
        <div className="">
          <p className="my-2 font-sans font-semibold">Phones length: <span className='ml-1 text-blue-500'>{envirnoment.phones.length}</span></p>
          <p className="my-2 font-sans font-semibold">Collabroators length: <span className='ml-1 text-green-500'>{envirnoment.collaborators.length}</span></p>
          <p className="my-2 font-sans font-semibold">Items length: <span className='ml-1 text-lime-600'>{envirnoment.items.length}</span></p>
        </div>
      </div> : <p>No Environment</p>}



      {isOpen === "add" && <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-white z-30"><AddCollaborator setIsOpen={setIsOpen} /></div>}
    </div>
  )
}
