"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Badge, BadgeProps } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Check, Copy, Server } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

interface Props {
  title: string;
  description: string;
  variant: "public" | "admin";
}

const textMap: Record<Props["variant"], string> = {
  public: "Public",
  admin: "Admin",
};

const variantMap: Record<Props["variant"], BadgeProps["variant"]> = {
  public: "secondary",
  admin: "destructive",
};

export const ApiAlert = ({ title, description, variant = "public" }: Props) => {
  // init state
  const [isCopying, setIsCopying] = useState(false);

  // copy to clipboard handler
  const onCopy = () => {
    navigator.clipboard.writeText(description);
    setIsCopying(true);
    toast.success("Api route copied");

    setTimeout(() => {
      setIsCopying(false);
    }, 5000);
  };

  return (
    <Alert>
      <Server className="size-4" />
      <AlertTitle className="flex items-center gap-x-2">
        {title}

        <Badge variant={variantMap[variant]}>{textMap[variant]}</Badge>
      </AlertTitle>
      <AlertDescription className="mt-4 flex items-center justify-between">
        <code className="relative rounded-md bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold">
          {description}
        </code>
        <Button
          disabled={isCopying}
          variant="outline"
          size="icon"
          onClick={onCopy}
        >
          {isCopying ? (
            <Check className="size-4" />
          ) : (
            <Copy className="size-4" />
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
