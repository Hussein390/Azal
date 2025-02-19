import { ItemsSearch } from "./components/itemsSearch";
import Tables from "./components/Table";

export default async function Home() {
  return (
    <div className="flex items-start gap-x-4 mt-16 md:mx-6">
      <ItemsSearch />
      <Tables />
    </div>
  );
}
