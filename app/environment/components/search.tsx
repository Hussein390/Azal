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
    </div>
  );
}
