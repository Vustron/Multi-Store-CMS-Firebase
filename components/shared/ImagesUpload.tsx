"use client";

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
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
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  value: string[];
}

const ImagesUpload = ({ disabled, onChange, onRemove, value }: Props) => {
  // hydration fix
  const isMounted = useMounted();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  if (!isMounted) {
    return null;
  }

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    setIsLoading(true);

    // create array to store urls
    const newUrls: string[] = [];

    // counter to track the uploaded images
    let completedUploads = 0;

    files.forEach((file: File) => {
      const uploadTask = uploadBytesResumable(
        ref(storage, `Images/Products/${Date.now()}-${file.name}`),
        file,
        { contentType: file.type },
      );

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        },
        (error) => {
          toast.error(error.message);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
            // store the newly uploaded url
            newUrls.push(downloadUrl);

            // increment the completed uploads
            completedUploads++;

            // if all uploads are are completed, update the state with new urls
            if (completedUploads === files.length) {
              setIsLoading(false);

              // combine all the new urls with the existing urls
              onChange([...value, ...newUrls]);
            }
          });
        },
      );
    });
  };

  const onDelete = (url: string) => {
    const newValue = value.filter((imageUrl) => imageUrl !== url);
    onRemove(url);
    onChange(newValue);
    deleteObject(ref(storage, url)).then(() => {
      toast.success("Image removed");
    });
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
                  sizes="(min-width: 808px) 50vw, 100vw"
                />

                <div className="absolute right-2 top-2 z-10">
                  <Button
                    className="hover:scale-110 hover:transform"
                    variant="destructive"
                    size="icon"
                    onClick={() => onDelete(url)}
                    type="button"
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
                    <span>Upload Images</span>
                  </div>
                  <Input
                    type="file"
                    onChange={onUpload}
                    accept="image/*"
                    className="size-0"
                    multiple
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

export default ImagesUpload;
