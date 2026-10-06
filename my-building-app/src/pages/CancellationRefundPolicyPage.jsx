import React from "react";
import LegalPage from "./LegalPage";
import { RefreshCcw } from "lucide-react";

const sections = [
  {
    title: "Cancellation Window",
    content:
      "Cancellations may be requested before a transaction is finalized or before the relevant service is fully processed. Once processing begins, cancellations may no longer be possible.",
  },
  {
    title: "Refund Eligibility",
    content:
      "Refunds are evaluated based on the nature of the transaction, platform policy, payment status, and any applicable laws or agreements.",
  },
  {
    title: "Processing Time",
    content:
      "Approved refunds may take several business days to reflect depending on the payment method and banking partner.",
  },
  {
    title: "Non-Refundable Items",
    content:
      "Certain services, completed transactions, or non-deliverable digital offerings may be non-refundable unless otherwise required by law.",
  },
];

export default function CancellationRefundPolicyPage({ embedded = false }) {
  return (
    <LegalPage
      seoTitle="Cancellation and Refund Policy | MateBid"
      seoDescription="Read MateBid's cancellation and refund policy for transactions and services offered on the platform."
      keywords="Cancellation Refund Policy MateBid, refund policy, cancellation policy, order refund"
      canonical="/cancellation-refund-policy"
      title="Cancellation / Refund Policy"
      intro="This policy explains how cancellations and refunds are handled for eligible transactions and services."
      sections={sections}
      icon={RefreshCcw}
      embedded={embedded}
    />
  );
}
