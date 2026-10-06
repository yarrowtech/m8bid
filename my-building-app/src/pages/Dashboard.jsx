/*
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardData } from "../api/user";
import heroImg from "../assets/fundraising-example.jpg";
import {
 LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
  Label
} from "recharts";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [raisers, setRaisers] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [totalRaisedMoney, setTotalRaisedMoney] = useState(0);
  const navigate = useNavigate();

  const fetchRaisers = async () => {
    try {
      const userId = user?._id || user?.id;
if (!userId) return; // Safeguard

const data = await getDashboardData(userId);
      console.log("data", data);
      setRaisers(data.data);
      
      setTotalRaisedMoney(
        data.data.reduce((total, raiser) => {
          return total + raiser.moneyToRaise;
        }, 0)
      );
    } catch (error) {
      console.error("Error fetching raisers:", error);
    }
  };

const campaignAnalyticsData = [
  { name: "Campaign A", raised: 50000, contributeed: 30000, profitReturned: 7000 },
  { name: " B", raised: 80000, contributeed: 50000, profitReturned: 12000 },
  { name: "C", raised: 60000, contributeed: 20000, profitReturned: 3000 },
  { name: "D", raised: 90000, contributeed: 60000, profitReturned: 15000 }, 
];
  useEffect(() => {
    fetchRaisers();
    console.log("first", raisers);
  }, []);

  const handleViewDetails = (campaign) => {
    navigate(`/contribution-detail`, { state: { campaign } });
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedCampaign(null);
  };

  return (
    <section className="flex min-h-screen bg-gray-100">
     
      <div className="w-64 bg-gray-700 text-white p-6 flex flex-col justify-between shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center mb-6">CrowdFundX</h2>
          <ul className="space-y-4">
            {[
              ["dashboard", "📊", "Dashboard"],
              ["profile", "👤", "My Profile"],
              ["projects", "🚀", "My Campaigns"],
              ["contributions", "💸", "My Contributions"],
              ["analytics", "📈", "Campaign Analytics"],
            ].map(([key, emoji, label]) => (
              <li key={key}>
                <a
                  href="#"
                  className={`flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-[#343a40] hover:text-white transition-all duration-300 ${
                    activeTab === key
                      ? "bg-[#3c4b64] text-white"
                      : "text-gray-400"
                  }`}
                  onClick={() => {
                    if (key === "profile") {
                      navigate("/my-profile");
                    } else {
                      setActiveTab(key);
                    }
                  }}
                >
                  <span role="img" aria-label={label}>
                    {emoji}
                  </span>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-center mt-6">
          <button
            className="bg-[#F8D388] py-2 px-4 rounded-lg w-full text-gray-700 hover:bg-[#F8E1A1] transition-all duration-300"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              navigate("/login");
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="flex-1 p-8">
        {activeTab === "dashboard" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">
              Welcome to Your Dashboard
            </h2>

           
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-6 bg-[#6f42c1] text-white rounded-lg shadow-lg">
                <h3 className="font-semibold text-lg">Total Fund to be Raised</h3>
                <p className="text-2xl">{totalRaisedMoney}</p>
              </div>
               <div className="p-6 bg-[#17a2b8] text-white rounded-lg shadow-lg">
                <h3 className="font-semibold text-lg">Money Raised</h3>
                <p className="text-xl">₹{raisers?.moneyRaised || 0}</p>
              </div>
              <div className="p-6 bg-[#28a745] text-white rounded-lg shadow-lg">
                <h3 className="font-semibold text-lg">Contributions Made</h3>
                <p className="text-2xl">{raisers?.moneyContributeed || 0}</p>
              </div>
              <div className="p-6 bg-[#ffc107] text-white rounded-lg shadow-lg">
                <h3 className="font-semibold text-lg">Active Campaigns</h3>
                <p className="text-xl">{raisers?.length} Campaigns</p>
              </div>
             
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">
                My Raising Projects
              </h3>
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {Array.isArray(raisers) && raisers.length > 0 ? (
                  raisers.map((raiser) => (
                    <div
                      key={raiser._id}
                      className="bg-white rounded-lg shadow-md overflow-hidden w-full"
                    >
                      <div className="relative">
                        <img
                          src={raiser.photo} // Fallback to hero image if no photo is available}
                          alt={raiser.projectTitle}
                          className="w-full h-52 object-cover"
                        />
                        <span className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-sm px-3 py-2 rounded-full">
                          {raiser.state } , {raiser.country} , {raiser.city}
                        </span>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-lg leading-snug">
                          {raiser.projectTitle}
                        </h4>
                        <p className="text-gray-600 mb-2">by {raiser?.userId?.name}</p>
                            <p className="text-xl font-semibold mb-1">
                            Target Amount :  ₹{raiser.moneyToRaise?.toLocaleString() || 0} 
                          </p>
                           <p className="text-sm text-gray-700 font-medium">
                ₹{raiser.raisedAmount || 0} raised
              </p>
                        <div className="mt-4 mb-2">
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-green-500 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (raiser.raisedAmount /
                                    raiser.moneyToRaise) *
                                    100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                      
                        </p>
                        <button
                          onClick={() => handleViewDetails(raiser)}
                          className="mt-4 w-full bg-[#F8D388] text-gray-800 font-medium py-2 rounded-lg transition hover:bg-[#f4c66d]"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No raisers created yet. Start a raiser!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div>
            <h3 className="text-xl font-semibold mb-4">My Raising Projects</h3>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {Array.isArray(raisers) && raisers.length > 0 ? (
                raisers.map((raiser) => (
                  <div
                    key={raiser._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden w-full"
                  >
                    <div className="relative">
                      <img
                        src={raiser.photo || heroImg} // Fallback to hero image if no photo is available
                        alt={raiser.projectTitle}
                        className="w-full h-52 object-cover"
                      />
                      <span className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded-full">
                        {raiser.state}
                      </span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-lg">{raiser.projectTitle}</h4>
                      <p className="text-sm text-gray-700 mt-1">
                        {raiser.projectOverview || "Help us reach our goal!"}
                      </p>
                      <div className="mt-4 mb-2">
                        <div className="h-2 bg-gray-200 rounded-full">
                          <p className="text-sm text-gray-700 font-medium">
                Target Amount : ₹{raiser.moneyToRaise || 0} 
              </p>
              <p className="text-sm text-gray-700 font-medium">
                ₹{raiser.moneyRaised || 0} raised
              </p>

                          <div
                            className="h-2 bg-green-500 rounded-full"
                            style={{
                              width: `${Math.min(
                                (raiser.raisedAmount / raiser.moneyToRaise) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewDetails(raiser)}
                        className="mt-4 w-full bg-[#F8D388] text-gray-800 font-medium py-2 rounded-lg transition hover:bg-[#f4c66d]"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No raisers created yet. Start a raiser!</p>
              )}
            </div>
          </div>
        )}

 {activeTab === "contributions" && (
          <div>
            <h3 className="text-xl font-semibold mb-4">My Contributions</h3>
            <p className="text-gray-600">[💸 Contributions listing goes here]</p>
          </div>
        )}


        {activeTab === "analytics" && (
         <div className="mt-12 space-y-16">
  <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
    📊 Campaign Analytics
  </h3>

  
  <div className="flex flex-col gap-6">
    <h4 className="text-lg font-semibold text-gray-700 text-center">
      💰 Money Raised from Campaigns
    </h4>
    <div className="flex flex-col md:flex-row items-center gap-8">
     
      <div className="w-full md:w-[60%] bg-white rounded-lg shadow-md p-4">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={campaignAnalyticsData}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis dataKey="name">
              <Label value="Campaigns" position="insideBottom" offset={-5} />
            </XAxis>
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="raised"
              stroke="#fbbf24"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full md:w-[35%] bg-white rounded-lg shadow-md p-4">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={campaignAnalyticsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="raised" fill="#fbbf24" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="text-sm text-gray-600 mt-2 text-center">
      Total Raised: ₹{campaignAnalyticsData.reduce((sum, d) => sum + d.raised, 0)}
    </div>
  </div>


  <div className="flex flex-col gap-6">
    <h4 className="text-lg font-semibold text-gray-700 text-center">
      💸 Contributions Made by You
    </h4>
    <div className="flex flex-col md:flex-row items-center gap-8">
      <div className="w-full md:w-[60%] bg-white rounded-lg shadow-md p-4">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={campaignAnalyticsData}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="contributeed"
              stroke="#38bdf8"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full md:w-[35%] bg-white rounded-lg shadow-md p-4">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={campaignAnalyticsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="contributeed" fill="#38bdf8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="text-sm text-gray-600 mt-2 text-center">
      Total Contributeed: ₹{campaignAnalyticsData.reduce((sum, d) => sum + d.contributeed, 0)}
    </div>
  </div>


  <div className="flex flex-col gap-6">
    <h4 className="text-lg font-semibold text-gray-700 text-center">
      📈 Profit Returned to Contributors
    </h4>
    <div className="flex flex-col md:flex-row items-center gap-8">
      <div className="w-full md:w-[60%] bg-white rounded-lg shadow-md p-4">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={campaignAnalyticsData}>
            <CartesianGrid strokeDasharray="4 4" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="profitReturned"
              stroke="#34d399"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full md:w-[35%] bg-white rounded-lg shadow-md p-4">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={campaignAnalyticsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="profitReturned" fill="#34d399" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="text-sm text-gray-600 mt-2 text-center">
      Total Profit Returned: ₹
      {campaignAnalyticsData.reduce((sum, d) => sum + d.profitReturned, 0)}
    </div>
  </div>
</div>
        )}
        </div>

    </section>
  );
}
*/