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
          className="flex aspect-square size-16 min-h-16 min-w-16 items-center justify-center overflow-hidden rounded-md"
        >
          <Image
            className="object-contain"
            src={url}
            alt="image"
            fill
            loading="lazy"
            blurDataURL="data:image/jpeg..."
            placeholder="blur"
            sizes="(min-width: 808px) 50vw, 100vw"
          />
        </div>
      ))}
    </>
  );
};

export default OrdersImage;
