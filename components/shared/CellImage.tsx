"use client";

import Image from "next/image";

interface Props {
  imageUrl: string;
}

const CellImage = ({ imageUrl }: Props) => {
  return (
    <div className="relative h-16 min-h-16 w-32 min-w-32 overflow-hidden rounded-md shadow-md">
      <Image
        fill
        src={imageUrl}
        alt="Billboard Image"
        className="object-cover"
        loading="lazy"
        blurDataURL="data:image/jpeg..."
        placeholder="blur"
        sizes="(min-width: 808px) 50vw, 100vw"
      />
    </div>
  );
};

export default CellImage;
