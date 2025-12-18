import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            AstraSemi Assistant
          </Link>
          <div className="flex gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors dark:text-gray-100"
            >
              Dashboard
            </Link>
            <Link
              href="/interpreter"
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors dark:text-gray-100"
            >
              Interpreter
            </Link>
            <Link
              href="/image-id"
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors dark:text-gray-100"
            >
              Image ID
            </Link>
            <Link
              href="/optional"
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors dark:text-gray-100"
            >
              Glossary
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

