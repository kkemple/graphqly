import React from "react";
import dynamic from "next/dynamic";

const AuthCheck = dynamic(() => import("../components/AuthCheck"), {
  ssr: false,
});

export default function HomePage() {
  return (
    <div>
      <AuthCheck />
    </div>
  );
}
