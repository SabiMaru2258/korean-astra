import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            AstraSemi Assistant
          </Link>
          <div className="flex gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/interpreter"
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              Interpreter
            </Link>
            <Link
              href="/image-id"
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              Image ID
            </Link>
            <Link
              href="/optional"
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              Glossary
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

