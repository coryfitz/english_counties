
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Header() {

  return (
    <div className="bg-gray-100 py-4 px-6 flex justify-between items-center">
      
      <a href="/" className="font-medium text-lg text-base">
        Counties of England
      </a>

      <div className="flex space-x-4">

        <Button asChild>
        <Link href="/study">Study</Link>
        </Button>

        <Button asChild>
          <Link href="/quiz">Quiz</Link>
        </Button>

      </div>
    </div>
  );
}
