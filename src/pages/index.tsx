import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

import { Wallet } from "@/components/home/Wallet";

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-4 ${inter.className}`}
    >
      <Wallet />
    </main>
  );
}
