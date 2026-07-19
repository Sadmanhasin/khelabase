import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-surface shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-lg py-sm max-w-container-max mx-auto h-16">
          <Link href="/" className="text-headline-md font-extrabold text-primary">
            Khelabase
          </Link>
          <Link
            href="/"
            className="text-label-md font-bold text-on-surface-variant hover:text-primary transition-colors"
          >
            Back to Website
          </Link>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center px-margin-mobile py-2xl">
        {children}
      </main>
      <div className="fixed bottom-0 left-0 w-full h-1/3 pointer-events-none -z-10 opacity-30 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-[300px] border-2 border-outline-variant rounded-[100%]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[150px] border-2 border-outline-variant rounded-[100%]" />
      </div>
    </div>
  );
}
