
import Header from "./header"

export default function Home() {

  return (
    <div>
      <Header />
      <div className="flex justify-center items-center h-screen">
        <p className="mt-[-300px] text-2xl">Select study or quiz mode</p>
      </div>
    </div>
  );
}
