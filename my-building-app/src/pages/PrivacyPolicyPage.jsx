import React from "react";
import LegalPage from "./LegalPage";
import { Lock } from "lucide-react";

const sections = [
  {
    title: "Information We Collect",
    content:
      "We collect information such as your name, contact details, account credentials, project details, and transaction records needed to provide the platform services.",
  },
  {
    title: "How We Use Your Information",
    content: [
      "To create and manage your account.",
      "To process payments, verify campaigns, and provide customer support.",
      "To improve platform security, transparency, and user experience.",
    ],
  },
  {
    title: "Data Protection",
    content:
      "MateBid uses reasonable security measures to protect your information. However, no digital platform can guarantee absolute security.",
  },
  {
    title: "Sharing of Information",
    content:
      "We may share limited information with payment processors, verification providers, and regulatory authorities when required by law or necessary to deliver the service.",
  },
  {
    title: "Your Choices",
    content:
      "Users may request access, correction, or deletion of their personal data where applicable and as permitted by law.",
  },
];

export default function PrivacyPolicyPage({ embedded = false }) {
  return (
    <LegalPage
      seoTitle="Privacy Policy | MateBid"
      seoDescription="Understand how MateBid collects, uses, and protects your personal information on the platform."
      keywords="Privacy Policy MateBid, MateBid privacy, raiser privacy, campaign privacy, M8BID privacy"
      canonical="/privacy-policy"
      title="Privacy Policy"
      intro="This Privacy Policy explains what information MateBid collects, how it is used, and how it is protected."
      sections={sections}
      icon={Lock}
      embedded={embedded}
    />
  );
}
