import Setup from "@/components/setup/setup";
import { auth } from "@clerk/nextjs/server";

export default function SetupPage() {
  // get user id
  const { userId } = auth();

  return (
    <>
      <Setup userId={userId} />
    </>
  );
}
