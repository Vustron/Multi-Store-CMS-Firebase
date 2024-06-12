"use client";

import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/helpers/utils";
import Link from "next/link";

const MainNav = ({ ...props }: React.HtmlHTMLAttributes<HTMLElement>) => {
  // init pathname
  const pathName = usePathname();
  // init params
  const params = useParams();
  // init routes
  const routes = [
    {
      href: `/${params.storeId}`,
      label: "Overview",
      active: pathName === `/${params.storeId}`,
    },
    {
      href: `/${params.storeId}/billboards`,
      label: "Billboards",
      active: pathName === `/${params.storeId}/billboards`,
    },
    {
      href: `/${params.storeId}/settings`,
      label: "Settings",
      active: pathName === `/${params.storeId}/settings`,
    },
  ];

  return (
    <nav className={cn("flex items-center space-x-4 pl-6 lg:space-x-6")}>
      {routes.map((route) => {
        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              route.active
                ? "text-black dark:text-white"
                : "text-muted-foreground",
            )}
          >
            {route.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default MainNav;
