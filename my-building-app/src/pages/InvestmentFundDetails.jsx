



import React, { useState } from "react";
import { useParams } from "react-router-dom";

// Import images
import property1 from "../assets/sample-img1.jpg";
import property2 from "../assets/property2.jpg";
import property3 from "../assets/property3.jpg";

// Import local video
import overviewVideo from "../assets/startup.mp4";

const investmentData = {
  "urban-heights-ventures": {
    title: "Urban Heights Ventures",
    image: property1,
    raised: 59473,
    goal: 280000,
    description: `
Urban Heights Ventures is focused on building sustainable urban housing solutions.
Our mission is to combine modern architecture with eco-friendly materials and provide affordable living spaces.
`,
    policies: [
      "Transparent fund allocation",
      "Quarterly reporting to investors",
      "Verified compliance with local regulations",
    ],
    documents: ["Business License.pdf", "Financial Statement 2024.pdf"],
    gallery: [property1, property2, property3],
    comments: [
      {
        author: "Sneha Bhatt",
        amount: 2500,
        message: "Amazing project! Excited to see it grow.",
      },
      {
        author: "Rohit Bansal",
        amount: 5000,
        message: "Transparency and innovation at its best.",
      },
    ],
  },
};

export default function InvestmentDetail() {
  const { id } = useParams();
  const investment = investmentData[id];
  const [showVideo, setShowVideo] = useState(false); // for modal toggle

  if (!investment) {
    return <div className="p-10 text-center">Investment not found.</div>;
  }

  const progressPercent = (investment.raised / investment.goal) * 100;

  return (
    <section className="bg-white px-4 py-10 relative overflow-hidden">
      {/* Video Button (top-right) */}
      <button
        onClick={() => setShowVideo(true)}
        className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 z-10"
      >
        Company Overview
      </button>

      {/* Modal Video */}
      {showVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 shadow-xl max-w-3xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Company Overview</h2>
              <button
                onClick={() => setShowVideo(false)}
                className="text-gray-600 hover:text-black text-lg"
              >
                ✕
              </button>
            </div>
            <video
              src={overviewVideo}
              controls
              className="w-full rounded-lg max-h-[80vh]"
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          {investment.title}
        </h1>

        {/* First Row: Image, Donation Info, About and Documents */}
        <div className="flex flex-col md:flex-row gap-1 mb-12 items-center justify-between">
          {/* Image */}
          <div className="w-full md:w-1/3 flex justify-center items-center mb-6 md:mb-0">
            <img
              src={investment.image}
              alt={investment.title}
              className="w-full h-100 object-cover rounded-lg"
            />
          </div>

          {/* Donation Info */}
          <div className="w-full md:w-1/4 bg-white border border-gray-200 rounded-xl shadow p-6 mb-6 md:mb-0">
            <p className="text-xl font-semibold mb-1">
              ₹{investment.raised.toLocaleString()} raised
            </p>
            <p className="text-gray-600 mb-4">
              of ₹{investment.goal.toLocaleString()} goal
            </p>

            {/* Circular Progress */}
            <div className="flex justify-center mb-4">
              <div className="relative w-16 h-16">
                <svg className="transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#22c55e"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray="282.743"
                    strokeDashoffset={`${
                      282.743 - (282.743 * progressPercent) / 100
                    }`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                  {Math.round(progressPercent)}%
                </div>
              </div>
            </div>

            {/* Buttons */}
            <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded mb-2">
              Share
            </button>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded mb-4">
              Donate Now
            </button>

            {/* Recent Donors */}
            <div>
              <p className="text-sm font-medium mb-2 text-purple-700">
                {investment.comments.length} people just donated
              </p>
              {investment.comments.map((c, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm mb-1 text-gray-800"
                >
                  <span>{c.author}</span>
                  <span>₹{c.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* About the Project and Documents */}
          <div className="w-full md:w-1/3">
            <h2 className="text-2xl font-semibold mb-4">About the Project</h2>
            <p className="text-gray-700 whitespace-pre-line mb-4">
              {investment.description}
            </p>

            <h2 className="text-2xl font-semibold mb-4">Documents</h2>
            <ul className="text-blue-600">
              {investment.documents.map((doc, i) => (
                <li key={i}>
                  <a href="#">{doc}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Second Row: Gallery */}
        <div className="w-150 mb-10">
          <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {investment.gallery.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Gallery ${i + 1}`}
                className="rounded w-full h-48 object-cover"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


/*
return (
    <section className="bg-white px-4 py-10 relative overflow-hidden">
      
      {campaign.video && (
        <button
          onClick={() => setShowVideo(true)}
          className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 z-10"
        >
          Company Overview
        </button>
      )}

      {/* Video Modal 
      {showVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 shadow-xl max-w-3xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Company Overview</h2>
              <button
                onClick={() => setShowVideo(false)}
                className="text-gray-600 hover:text-black text-lg"
              >
                ✕
              </button>
            </div>
            <video
              src={campaign.video}
              controls
              className="w-full rounded-lg max-h-[80vh]"
            />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Title 
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">
          {campaign.projectTitle}
        </h1>

        {/* Main Grid 
        <div className="flex flex-col md:flex-row gap-6 mb-12">
          {/* Image 
          <div className="w-full md:w-1/3 flex justify-center items-center">
            <img
              src={campaign.photo}
              alt={campaign.projectTitle}
              className="w-full h-[300px] object-cover rounded-lg"
            />
          </div>

          {/* Donation Info 
          <div className="w-full md:w-1/4 bg-white border border-gray-200 rounded-xl shadow p-6">
            <p className="text-xl font-semibold mb-1">
              ₹{campaign.raisedAmount.toLocaleString()} raised
            </p>
            <p className="text-gray-600 mb-4">
              of ₹{campaign.moneyToRaise.toLocaleString()} goal
            </p>

            {/* Circular Progress 
            <div className="flex justify-center mb-4">
              <div className="relative w-16 h-16">
                <svg className="transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="#22c55e"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray="282.743"
                    strokeDashoffset={`${
                      282.743 - (282.743 * progressPercent) / 100
                    }`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                  {Math.round(progressPercent)}%
                </div>
              </div>
            </div>

            {/* Buttons 
            <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded mb-2">
              Share
            </button>
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded">
              Donate Now
            </button>
          </div>

          {/* About Project 
          <div className="w-full md:w-1/3">
            <h2 className="text-2xl font-semibold mb-2">About the Project</h2>
            <p className="text-gray-700 whitespace-pre-line mb-3">
              {campaign.projectOverview || campaign.overview || "No overview provided."}
            </p>

            <p className="mb-2">
              <strong>Company:</strong> {campaign.companyName}
            </p>
            <p className="mb-2">
              <strong>Location:</strong>{" "}
              {campaign.location || `${campaign.city}, ${campaign.state}, ${campaign.pincode}`}
            </p>
            <p className="mb-2">
              <strong>Funding Type:</strong> {campaign.fundingType}
            </p>
            {campaign.fundingType === "Profit Return" && (
              <p className="mb-2">
                <strong>Profit %:</strong> {campaign.profitPercentage}%
              </p>
            )}
            <p className="mb-2">
              <strong>Category:</strong> {campaign.projectCategory}
            </p>
          </div>
        </div>

        {/* Gallery
        {campaign.promoPoster && (
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Gallery</h2>
            <img
              src={campaign.promoPoster}
              alt="Promotional Poster"
              className="rounded w-full h-64 object-cover"
            />
          </div>
        )}

        {/* Back Button 
        <div className="text-center">
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </section>
  );
};

export default InvestmentDetail;
*/