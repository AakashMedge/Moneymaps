import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox, Bot, Clock, Brain, ScanLine, LayoutGrid } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import NotificationCenter from "./NotificationCenter";

const Header = async () => {
  await checkUser();
  return (
    <div className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <Image
            src={"/logo2.png"}
            alt="Moneymap Logo"
            height={80}
            width={250}
            className="h-12 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center space-x-4">
          <SignedIn>
            <Link href={"/dashboard"} className="text-grey-600 hover:text-blue-600 flex items-center gap-2">
              <Button variant="outline">
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">
                  Dashboard
                </span>
              </Button>
            </Link>

            <Link href={"/advisor"} className="text-grey-600 hover:text-blue-600 flex items-center gap-2">
              <Button variant="outline">
                <Bot size={18} />
                <span className="hidden md:inline">
                  Advisor
                </span>
              </Button>
            </Link>

            <Link href={"/time-machine"} className="text-grey-600 hover:text-purple-600 flex items-center gap-2">
              <Button variant="outline" className="border-purple-200 hover:border-purple-400">
                <Clock size={18} />
                <span className="hidden md:inline">
                  Time Machine
                </span>
              </Button>
            </Link>

            <Link href={"/twin"} className="text-grey-600 hover:text-purple-600 flex items-center gap-2">
              <Button variant="outline" className="border-purple-200 hover:border-purple-400">
                <Brain size={18} />
                <span className="hidden md:inline">
                  Twin
                </span>
              </Button>
            </Link>

            <Link href="/pay">
              <Button variant="outline" className="flex items-center gap-2 border-cyan-500/20 hover:bg-cyan-500/10 hover:text-cyan-500">
                <ScanLine className="h-4 w-4" />
                <span className="hidden md:inline">Scan & Pay</span>
              </Button>
            </Link>

            <Link href={"/tools"}>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-blue-600" title="Smart Tools">
                <LayoutGrid className="h-5 w-5" />
              </Button>
            </Link>

            <Link href={"/transaction/create"}>
              <Button className="flex items-center gap-2">
                <PenBox size={18} />
                <span className="hidden md:inline">
                  Add Transaction
                </span>
              </Button>
            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <NotificationCenter />
            <UserButton appearance={{
              elements: {
                avatarBox: "w-10 h-10",
              },
            }} />
          </SignedIn>
        </div>
      </nav>
    </div>
  );
};

export default Header;