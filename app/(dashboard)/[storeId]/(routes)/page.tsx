"use client";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/Select";

import { useTotalRevenueByCategory } from "@/lib/hooks/misc/useTotalRevenueByCategory";
import { useTotalPaymentStatus } from "@/lib/hooks/misc/useTotalPaymentStatus";
import { DollarSign, ShoppingCart, PackageSearch, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useTotalGraphRevenue } from "@/lib/hooks/misc/useTotalGraphRevenue";
import { useTotalOrderStatus } from "@/lib/hooks/misc/useTotalOrderStatus";
import { useTotalProducts } from "@/lib/hooks/misc/useTotalProducts";
import { useTotalRevenue } from "@/lib/hooks/misc/useTotalRevenue";
import { useTotalSales } from "@/lib/hooks/misc/useTotalSales";
import { Separator } from "@/components/ui/Separator";
import Overview from "@/components/setup/overview";
import Heading from "@/components/shared/Heading";
import { formatter } from "@/lib/helpers/utils";
import { useState } from "react";

interface Props {
  params: {
    storeId: string;
  };
}

export default function OverviewPage({ params }: Props) {
  // chart type init
  const [chartType, setChartType] = useState("Month");

  // chart type change handler
  const onChangeType = (type: string) => {
    setChartType(type);
  };

  // get total revenue
  const {
    data: revenue,
    isLoading: loadingRevenue,
    error: errorRevenue,
  } = useTotalRevenue(params.storeId);

  // get total sales
  const {
    data: sales,
    isLoading: loadingSales,
    error: errorSales,
  } = useTotalSales(params.storeId);

  // get total products
  const {
    data: products,
    isLoading: loadingProducts,
    error: productError,
  } = useTotalProducts(params.storeId);

  // get graph revenue
  const {
    data: graphRevenue,
    isLoading: graphRevenueLoading,
    error: graphRevenueError,
  } = useTotalGraphRevenue(params.storeId);

  // get graph revenue2
  const {
    data: graphRevenue2,
    isLoading: graphRevenueLoading2,
    error: graphRevenueError2,
  } = useTotalPaymentStatus(params.storeId);

  // get graph revenue3
  const {
    data: graphRevenue3,
    isLoading: graphRevenueLoading3,
    error: graphRevenueError3,
  } = useTotalRevenueByCategory(params.storeId);

  // get graph revenue4
  const {
    data: graphRevenue4,
    isLoading: graphRevenueLoading4,
    error: graphRevenueError4,
  } = useTotalOrderStatus(params.storeId);

  // graph loader
  const graphLoading =
    graphRevenueLoading ||
    graphRevenueLoading2 ||
    graphRevenueLoading3 ||
    graphRevenueLoading4;

  // graph error
  const graphError =
    graphRevenueError ||
    graphRevenueError2 ||
    graphRevenueError3 ||
    graphRevenueError4;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Dashboard" description="Overview of your store" />

        <Separator />

        <div className="grid grid-cols-4 gap-4">
          <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="size-6 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">
                {loadingRevenue ? (
                  <>
                    <Loader2 className="size-6 animate-spin" />
                  </>
                ) : errorRevenue ? (
                  <span>Something went wrong</span>
                ) : (
                  <>{formatter.format(revenue!)}</>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <ShoppingCart className="size-6 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">
                {loadingSales ? (
                  <>
                    <Loader2 className="size-6 animate-spin" />
                  </>
                ) : errorSales ? (
                  <span>Something went wrong</span>
                ) : (
                  <>+{sales!}</>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <PackageSearch className="size-6 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">
                {loadingProducts ? (
                  <>
                    <Loader2 className="size-6 animate-spin" />
                  </>
                ) : productError ? (
                  <span>Something went wrong</span>
                ) : (
                  <>+{products!}</>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-4">
            <CardHeader className="flex justify-between space-y-2 lg:flex-row lg:items-center lg:space-y-0">
              <CardTitle className="line-clamp-1 text-2xl font-bold">
                Revenue By {chartType}
              </CardTitle>

              <Select defaultValue={chartType} onValueChange={onChangeType}>
                <SelectTrigger className="h-9 rounded-md px-3 lg:w-auto">
                  <SelectValue placeholder={chartType} />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Month">
                    <div className="flex items-center">
                      <p className="line-clamp-1">Month</p>
                    </div>
                  </SelectItem>

                  <SelectItem value="Payment Status">
                    <div className="flex items-center">
                      <p className="line-clamp-1">Payment Status</p>
                    </div>
                  </SelectItem>

                  <SelectItem value="Category">
                    <div className="flex items-center">
                      <p className="line-clamp-1">Category</p>
                    </div>
                  </SelectItem>

                  <SelectItem value="Order Status">
                    <div className="flex items-center">
                      <p className="line-clamp-1">Order Status</p>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>

            <CardContent>
              <div className="text-2xl font-bold">
                {graphLoading ? (
                  <>
                    <Loader2 className="size-6 animate-spin" />
                  </>
                ) : graphError ? (
                  <span>Something went wrong</span>
                ) : (
                  <>
                    {chartType === "Month" && <Overview data={graphRevenue} />}
                    {chartType === "Payment Status" && (
                      <Overview data={graphRevenue2} />
                    )}
                    {chartType === "Category" && (
                      <Overview data={graphRevenue3} />
                    )}
                    {chartType === "Order Status" && (
                      <Overview data={graphRevenue4} />
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
