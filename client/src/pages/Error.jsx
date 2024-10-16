import React from "react";
import { useParams } from "react-router-dom";

export default function Error() {
  const { error } = useParams();
  console.log(error);
  const decodedError = decodeURIComponent(error);
  return (
    <div>
      <h1>error</h1>
      <p>{decodedError}</p>
    </div>
  );
}
