"use client";

import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { ImagePlus, Loader, Trash } from "lucide-react";
import useMounted from "@/lib/hooks/misc/useMounted";
import { storage } from "@/lib/services/firebase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import toast from "react-hot-toast";
import { useState } from "react";
import Image from "next/image";

interface Props {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
}

const ImageUpload = ({ disabled, onChange, onRemove, value }: Props) => {
  // hydration fix
  const isMounted = useMounted();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  if (!isMounted) {
    return null;
  }

  const onUpload = async (e: any) => {
    const file = e.target.files[0];
    setIsLoading(true);

    const uploadTask = uploadBytesResumable(
      ref(storage, `Images/${Date.now()}-${file.name}`),
      file,
      { contentType: file.type },
    );

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      },
      (error) => {
        toast.error(`${error.message}`);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          onChange(downloadURL);
          setIsLoading(false);
        });
      },
    );
  };

  return (
    <div>
      {value && value.length > 0 ? (
        <>
          <div className="mb-4 flex items-center gap-4">
            {value.map((url) => (
              <div
                className="relative size-52 overflow-hidden rounded-md"
                key={url}
              >
                <Image
                  fill
                  className="object-cover"
                  alt="Billboard Image"
                  src={url}
                  loading="lazy"
                  blurDataURL="data:image/jpeg..."
                  placeholder="blur"
                />

                <div className="absolute right-2 top-2 z-10">
                  <Button
                    className="hover:scale-110 hover:transform"
                    variant="destructive"
                    size="icon"
                    onClick={() => {}}
                  >
                    <Trash className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex size-52 flex-col items-center justify-center gap-3 overflow-hidden rounded-md border-dashed border-gray-200">
            {isLoading ? (
              <>
                <Loader className="size-6 animate-spin" />
                <span>{`${progress.toFixed(2)}%`}</span>
              </>
            ) : (
              <>
                <Label>
                  <div className="flex size-full cursor-pointer flex-col items-center justify-center gap-2">
                    <ImagePlus className="size-6" />
                    <span>Upload an Image</span>
                  </div>
                  <Input
                    type="file"
                    onChange={onUpload}
                    accept="image/*"
                    className="size-0"
                  />
                </Label>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageUpload;
