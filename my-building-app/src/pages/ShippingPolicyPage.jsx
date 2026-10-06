import React from "react";
import LegalPage from "./LegalPage";
import { Truck } from "lucide-react";

const sections = [
  {
    title: "Shipping Scope",
    content:
      "This policy applies to physical products or merchandise that may be offered through the platform from time to time. Digital services and campaign funding are not shipped goods.",
  },
  {
    title: "Delivery Timelines",
    content:
      "Delivery times depend on the product, location, and shipping partner. Estimated timelines will be shared at the time of purchase or fulfillment.",
  },
  {
    title: "Shipping Charges",
    content:
      "Shipping charges, if applicable, will be displayed before checkout. Additional duties or customs charges may be borne by the recipient where applicable.",
  },
  {
    title: "Delivery Issues",
    content:
      "If a package is delayed, damaged, or lost, please contact our support team so we can assist with the next steps.",
  },
];

export default function ShippingPolicyPage({ embedded = false }) {
  return (
    <LegalPage
      seoTitle="Shipping Policy | MateBid"
      seoDescription="Review MateBid's shipping policy for applicable physical products and delivery terms."
      keywords="Shipping Policy MateBid, MateBid shipping policy, delivery policy, order shipping"
      canonical="/shipping-policy"
      title="Shipping Policy"
      intro="This shipping policy explains how physical orders, where applicable, are handled and delivered."
      sections={sections}
      icon={Truck}
      embedded={embedded}
    />
  );
}
