"use client";

import Image from "next/image";

interface Props {
  data: string[];
}

const OrdersImage = ({ data }: Props) => {
  return (
    <>
      {data.map((url, index) => (
        <div
          key={index}
          className="relative flex aspect-square h-16 w-16 items-center justify-center overflow-hidden rounded-md"
        >
          <Image
            className="object-contain transition hover:scale-110"
            src={url}
            alt={`Order Image ${index + 1}`}
            fill
            loading="lazy"
            sizes="100vw"
          />
        </div>
      ))}
    </>
  );
};

export default OrdersImage;
