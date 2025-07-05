import React from "react";
import { Metadata } from "next";
import { generateMetadata } from "@/lib/seo-config";
import PoliciesClient from "./policies-client";

export const metadata: Metadata = generateMetadata({
  title: "EU Green Policies & Regulations - Comprehensive Guide",
  description: "Explore comprehensive EU Green Deal policies including CBAM, Farm to Fork Strategy, Climate Law, and more. Get expert guidance on environmental regulations and compliance deadlines.",
  keywords: ["EU policies", "Green Deal", "CBAM", "Farm to Fork", "Climate Law", "Environmental regulations", "EU compliance"],
  canonical: "https://verdana.emmi.zone/policies"
});

export default function PoliciesPage() {
  return <PoliciesClient />;
}