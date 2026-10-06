import React from "react";
import LegalPage from "./LegalPage";
import { ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "Acceptance of Terms",
    content:
      "By using the MateBid / M8BID platform, you agree to comply with these terms and conditions. If you do not agree, please discontinue use of the platform.",
  },
  {
    title: "Eligibility",
    content:
      "Users must be at least 18 years of age and provide accurate information during registration. The platform may verify identities and business details where required.",
  },
  {
    title: "Platform Use",
    content: [
      "You agree not to misuse the platform, impersonate others, or share false campaign details.",
      "All campaign content should be accurate, lawful, and respectful of other users and communities.",
    ],
  },
  {
    title: "Payments and Transactions",
    content:
      "Any payments made through the platform are subject to applicable payment processing terms, verification requirements, and platform policies. MateBid may suspend or reverse transactions where required by law or internal review.",
  },
  {
    title: "Limitation of Liability",
    content:
      "MateBid is not liable for indirect, incidental, or consequential damages arising from the use of the platform, except where prohibited by law.",
  },
];

export default function TermsAndConditionsPage({ embedded = false }) {
  return (
    <LegalPage
      seoTitle="Terms and Conditions | MateBid"
      seoDescription="Read the terms and conditions for using the MateBid platform, including account use, payments, and responsibilities."
      keywords="Terms and Conditions MateBid, MateBid terms, platform terms, raising terms, M8BID terms"
      canonical="/terms-and-conditions"
      title="Terms and Conditions"
      intro="These terms outline the rules for using MateBid and the responsibilities of users while interacting with the platform."
      sections={sections}
      icon={ShieldCheck}
      embedded={embedded}
    />
  );
}
