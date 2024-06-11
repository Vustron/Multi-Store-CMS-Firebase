"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/helpers/utils";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Home() {
  const Success = () => {
    console.log("Success!");
    toast.success("Success!");
  };

  const Error = () => {
    console.log("Error!");
    toast.error("Error!");
  };

  const Loading = () => {
    console.log("Loading!");
    toast.loading("Loading!");
  };

  const loading = true;

  return (
    <main className="p-auto m-auto h-full w-full items-end justify-center bg-slate-700">
      <div className="flex flex-row gap-5">
        <Button onClick={Success} className="text-white">
          Success!
        </Button>

        <Button onClick={Error} className="text-white">
          Error!
        </Button>

        <Button onClick={Loading} className="text-white" disabled={loading}>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span className={cn(loading ? "animate-pulse" : "")}>Loading!</span>
        </Button>
      </div>
    </main>
  );
}
