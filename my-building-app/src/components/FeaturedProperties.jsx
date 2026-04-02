// src/components/FeaturedProperties.jsx
import React from "react";
import property1 from "../assets/property1.jpg";
import property2 from "../assets/property2.jpg";
import property3 from "../assets/property3.jpg";
import property4 from "../assets/property4.jpg";
import property5 from "../assets/property5.jpg";
import property6 from "../assets/property6.jpg";

const properties = [
  {
    name: "Urban Heights Apartments",
    location: "Bangalore",
    return: "6.5% annually",
    status: "Available",
    image: property1,
  },
  {
    name: "Warehouse Hub",
    location: "Mumbai",
    return: "7.2% annually",
    status: "Fully Funded",
    image: property2,
  },
  {
    name: "Green Valley Villas",
    location: "Pune",
    return: "6.8% annually",
    status: "Available",
    image: property3,
  },
  {
    name: "Skyline Office Park",
    location: "Hyderabad",
    return: "7.0% annually",
    status: "Available",
    image: property4,
  },
  {
    name: "Sunrise Retail Center",
    location: "Chennai",
    return: "6.9% annually",
    status: "Fully Funded",
    image: property5,
  },
  {
    name: "Lakeview Residences",
    location: "Kolkata",
    return: "6.7% annually",
    status: "Available",
    image: property6,
  },
];

export default function FeaturedProperties() {
  return (
    <section className="bg-gray-50 px-6 py-16">
      <h2 className="text-3xl font-bold text-center mb-10">Featured Investment Opportunities</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {properties.map((prop) => (
          <div
            key={prop.name}
            className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col"
          >
            <img src={prop.image} alt={prop.name} className="h-48 w-full object-cover" />
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-semibold text-lg mb-1">{prop.name}</h3>
              <p className="text-sm text-gray-600">{prop.location}</p>
              <p className="text-sm mt-2">
                <strong>Estimated Return:</strong> {prop.return}
              </p>
              <span
                className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                  prop.status === "Available"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {prop.status}
              </span>
              <button
                className="mt-auto bg-black text-white text-sm py-2 px-3 rounded mt-4 hover:bg-gray-800"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
