import React from "react";
import LegalPage from "./LegalPage";
import { PhoneCall } from "lucide-react";

const sections = [
  {
    title: "Support Channels",
    content: [
      "Email us at support@matebid.com for assistance with campaigns, payments, or account issues.",
      "Call our support team at +91 98765 43210 for direct help during business hours.",
    ],
  },
  {
    title: "Business Inquiries",
    content:
      "For partnerships, verification requests, or platform-related proposals, please reach out through our support email and our team will respond promptly.",
  },
  {
    title: "Response Time",
    content:
      "We aim to respond to all inquiries as quickly as possible, though response times may vary during high-volume periods.",
  },
];

export default function ContactUsPage({ embedded = false }) {
  return (
    <LegalPage
      seoTitle="Contact Us | MateBid"
      seoDescription="Get in touch with MateBid for support, partnerships, and general questions about the platform."
      keywords="Contact MateBid, MateBid support, raising support, contact us, M8BID support"
      canonical="/contact-us"
      title="Contact Us"
      intro="Need help or want to learn more about MateBid? Reach out through the contact options below."
      sections={sections}
      icon={PhoneCall}
      embedded={embedded}
    />
  );
}
