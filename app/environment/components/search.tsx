import { useState, useEffect } from "react";
import { getEnvironment, getItems, getPhone } from "../../../backend/envirnoment";
import { Input } from "@/components/ui/input";
import { DataPhones, ItemProps, PhoneProps } from "../../components/dataProvider";
type envirnomentProps = {
  id: string;
  name: string;
  owner: { name: string };
  collaborators: any
};

export default function Search() {
  const [name, setName] = useState('');

  const [envirnoments, setEnvironments] = useState<envirnomentProps[] | null>(null);
  const { setItems, setPhones, isPhone } = DataPhones();
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

  async function getEnvirnoment() {
    if (!name || name === '' || name === ' ') {
      setEnvironments([])
      return;
    }

    const data = await getEnvironment({ name: name.trim() });

    // Type guard to validate the data structure
    if (typeof data === 'string') {
      console.error(data); // Handle error message if `data` is a string
      setEnvironments(null);
      return;
    }

    if (Array.isArray(data)) {
      setEnvironments(data as envirnomentProps[]); // Explicitly cast to expected type
    } else {
      console.error("Unexpected data format received");
      setEnvironments(null);
    }
  }

  useEffect(() => {
    getEnvirnoment();
  }, [name]);

  return (
    <div className="mt-1 relative">
      <Input
        type="text"
        placeholder="Search for environment"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className=""
      />
      {name !== "" || !name || envirnoments ? (
        <div className="absolute top-16 left-3">
          <ul className="space-y-2">

            {envirnoments && envirnoments!.map((item) => (
              <button onClick={() => {
                localStorage.setItem("envId", item.id);
                setName('')
                getPhones()
                return
              }} key={item.id} className="p-2 border rounded-md">
                <p>
                  <span className="font-bold text-sm text-start">Name:</span> {item.name}
                </p>
                <p>
                  <span className="font-bold text-sm text-start">Owner:</span> {item.owner.name}
                </p>
              </button>
            ))}
          </ul>
        </div>
      ) : (
        <p>No environment found</p>
      )}
      {/* <Table className=''>
        <TableHeader >
          <TableRow className='w-full '>
            <TableHead className='text-nowrap text-black'>المبلغ الكلي</TableHead>
            <TableHead className='text-nowrap text-black'>القطع الشهري</TableHead>
            <TableHead className='text-nowrap text-black'>المبلغ بعد القطع</TableHead>
            <TableHead className='text-nowrap text-black' >الأشهر المتبقية</TableHead>
            <TableHead className='text-nowrap text-black' >تاريخ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: months + 1 }, (_, index) => {
            // Ensure createdAt exists and clone it to avoid mutation
            const date = phone?.createdAt ? new Date(phone.createdAt) : new Date();
            date.setMonth(date.getMonth() + index); // Increment month

            // Calculate remaining amount
            const price = String(Number(phone?.price) + Number(phone?.profit));

            const remainingAmount2 =
              phone?.updatedPrice && phone?.fixedCut
                ? parseInt(phone.updatedPrice) - parseInt(phone.fixedCut) * (index - 1)
                : 150;

            const remainingAmount =
              parseInt(phone?.fixedCut!) > remainingAmount2 ? 0
                : parseInt(phone?.updatedPrice!) - parseInt(phone?.fixedCut!) * index;
            // Determine installment amount
            const installment =
              parseInt(phone?.fixedCut!) > remainingAmount2 ? remainingAmount2 : phone?.fixedCut;

            return (
              <>
                <TableRow key={index} onDoubleClick={() => handlePayment(index)} className='relative '>
                  <TableCell className="text-black text-center">{index === 0 ? price : remainingAmount2}</TableCell>
                  <TableCell className='text-red-700 text-center'>{installment}</TableCell>
                  <TableCell className='text-blue-700 text-center '>{String(remainingAmount)}</TableCell>
                  <TableCell className='text-center text-black'>{months - index}</TableCell>
                  <TableCell className="text-center">
                    {date.toLocaleDateString('en-CA').replaceAll('-', '/')}
                  </TableCell>
                  {isPaid[index] === true && <TableCell className=' bg-white z-20 absolute top-0 right-0 p-2 rounded-md border w-[200px]'>
                    <p className="font-semibold text-center mb-3">هل استلمت المبلغ؟</p>
                    <div className="flex justify-between items-center">
                      <Button className='bg-green-500 delay-100 hover:bg-green-400 font-semibold text-white' onClick={() => handlePayment(index)}>نعم</Button>
                      <Button className='bg-green-500 delay-100 hover:bg-green-400 font-semibold text-white' onClick={() => handlePayment(index)}>لا</Button>
                    </div>
                  </TableCell>}
                </TableRow>
              </>
            );
          })}
        </TableBody>
      </Table> */}
    </div>
  );
}
