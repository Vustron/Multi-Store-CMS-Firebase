"use client";

import { useOrigin } from "@/lib/hooks/misc/useOrigin";
import { useParams } from "next/navigation";
import { ApiAlert } from "./ApiALert";
interface Props {
  entityName: string;
  entityNameId: string;
}

const ApiList = ({ entityName, entityNameId }: Props) => {
  // get origin
  const origin = useOrigin();
  // get params
  const params = useParams();
  // get base url
  const baseUrl = `${origin}/api/stores/${params.storeId}`;

  return (
    <>
      <ApiAlert
        title="GET"
        variant="public"
        description={`${baseUrl}/${entityName}`}
      />
      <ApiAlert
        title="GET"
        variant="public"
        description={`${baseUrl}/${entityName}/${entityNameId}`}
      />
      <ApiAlert
        title="POST"
        variant="admin"
        description={`${baseUrl}/${entityName}`}
      />
      <ApiAlert
        title="PATCH"
        variant="admin"
        description={`${baseUrl}/${entityName}/${entityNameId}`}
      />
      <ApiAlert
        title="DELETE"
        variant="admin"
        description={`${baseUrl}/${entityName}/${entityNameId}`}
      />
    </>
  );
};

export default ApiList;
