import { ItemsSearch } from "./components/itemsSearch";
import Tables from "./components/Table";

export default async function Home() {
  return (
    <div className="lg:flex items-start gap-4 mt-16 md:mx-6">
      <Tables />
      {/* <ItemsSearch /> */}
    </div>
  );
}
