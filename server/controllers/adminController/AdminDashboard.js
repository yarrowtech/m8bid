const mongoose = require("mongoose");
const Fundraiser = require("../../models/Fundraiser.js");
const User = require("../../models/userSchema.js");

const formatMonthKey = (date) => {
  const d = new Date(date);
  return d.toLocaleString("default", {
    month: "short",
    year: "numeric",
  });
};

const getUserPhone = (user) => user?.profile?.phone || "";
const getUserPhoto = (user) => user?.profile?.photo || "";

const getFundraiserAccessSummary = (user) => {
  const fundraiserAccess = user?.access?.fundraiser || {};
  return {
    enabled: !!fundraiserAccess.enabled,
    type: fundraiserAccess.type || "individual",
    kycStatus: fundraiserAccess.kycStatus || "NONE",
    panStatus: fundraiserAccess.panStatus || "NONE",
    bankStatus: fundraiserAccess.bankStatus || "NONE",
    companyStatus: fundraiserAccess.companyStatus || "NONE",
    documents: fundraiserAccess.documents || {},
  };
};

const getInvestorAccessSummary = (user) => {
  const investorAccess = user?.access?.investor || {};
  return {
    enabled: !!investorAccess.enabled,
    type: investorAccess.type || "individual",
    kycStatus: investorAccess.kycStatus || "NONE",
    panStatus: investorAccess.panStatus || "NONE",
    bankStatus: investorAccess.bankStatus || "NONE",
    documents: investorAccess.documents || {},
  };
};

const AdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFundraisers = await Fundraiser.countDocuments();

    const [users, fundraisers] = await Promise.all([
      User.find({})
        .sort({ createdAt: -1 })
        .select("username name email role profile access activeMode createdAt updatedAt"),
      Fundraiser.find({})
        .populate("userId", "username name email profile access activeMode")
        .sort({ createdAt: -1 }),
    ]);

    const totalMoneyRaised = fundraisers.reduce(
      (sum, item) => sum + Number(item.raisedAmount || 0),
      0
    );

    const totalFundingGoal = fundraisers.reduce(
      (sum, item) => sum + Number(item.moneyToRaise || 0),
      0
    );

    const approvedCampaigns = fundraisers.filter((f) => f.status === "approved").length;
    const pendingCampaigns = fundraisers.filter((f) => f.status === "pending").length;
    const rejectedCampaigns = fundraisers.filter((f) => f.status === "rejected").length;

    const monthlyRaisedMap = {};
    const monthlyUsersMap = {};

    users.forEach((user) => {
      const monthKey = formatMonthKey(user.createdAt);
      monthlyUsersMap[monthKey] = (monthlyUsersMap[monthKey] || 0) + 1;
    });

    fundraisers.forEach((fundraiser) => {
      const monthKey = formatMonthKey(fundraiser.createdAt);
      monthlyRaisedMap[monthKey] =
        (monthlyRaisedMap[monthKey] || 0) + Number(fundraiser.raisedAmount || 0);
    });

    const monthlyRaised = Object.entries(monthlyRaisedMap).map(([month, raised]) => ({
      month,
      raised,
    }));

    const monthlyUsers = Object.entries(monthlyUsersMap).map(([month, count]) => ({
      month,
      users: count,
    }));

    const recentFundraisers = fundraisers.slice(0, 5).map((fundraiser) => ({
      _id: fundraiser._id,
      projectTitle: fundraiser.projectTitle || "Untitled",
      projectCategory: fundraiser.projectCategory || "others",
      status: fundraiser.status || "pending",
      moneyToRaise: Number(fundraiser.moneyToRaise || 0),
      raisedAmount: Number(fundraiser.raisedAmount || 0),
      creator: {
        _id: fundraiser.userId?._id || null,
        name: fundraiser.userId?.name || "Unknown",
        email: fundraiser.userId?.email || "Unknown",
      },
      createdAt: fundraiser.createdAt,
    }));

    const recentUsers = users.slice(0, 5).map((user) => ({
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      activeMode: user.activeMode,
      phone: getUserPhone(user),
      photo: getUserPhoto(user),
      createdAt: user.createdAt,
    }));

    const topFundraisers = [...fundraisers]
      .sort((a, b) => Number(b.raisedAmount || 0) - Number(a.raisedAmount || 0))
      .slice(0, 5)
      .map((fundraiser) => ({
        _id: fundraiser._id,
        projectTitle: fundraiser.projectTitle || "Untitled",
        moneyRaised: Number(fundraiser.raisedAmount || 0),
        moneyToRaise: Number(fundraiser.moneyToRaise || 0),
        status: fundraiser.status || "pending",
      }));

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalFundraisers,
        totalMoneyRaised,
        totalRevenue: totalMoneyRaised,
        totalFundingGoal,
        totalInvestments: 0,
        approvedCampaigns,
        pendingCampaigns,
        rejectedCampaigns,
        activeUsers: users.filter((u) => u.role !== "admin").length,
        activeCampaigns: approvedCampaigns,
        recentFundraisers,
        recentUsers,
        monthlyRaised,
        monthlyUsers,
        topFundraisers,
      },
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching admin stats.",
    });
  }
};

const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .sort({ createdAt: -1 })
      .select("username name email role profile access activeMode createdAt updatedAt");

    const formattedUsers = users.map((user) => ({
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      activeMode: user.activeMode,
      phone: getUserPhone(user),
      photo: getUserPhoto(user),
      investorAccess: getInvestorAccessSummary(user),
      fundraiserAccess: getFundraiserAccessSummary(user),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Get Admin Users Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching users.",
    });
  }
};

const getAdminCampaigns = async (req, res) => {
  try {
    const campaigns = await Fundraiser.find({})
      .populate("userId", "username name email profile")
      .sort({ createdAt: -1 });

    const formatted = campaigns.map((campaign) => ({
      _id: campaign._id,
      projectTitle: campaign.projectTitle || "Untitled",
      title: campaign.projectTitle || "Untitled",
      projectCategory: campaign.projectCategory || "others",
      status: campaign.status || "pending",
      creator: {
        _id: campaign.userId?._id || null,
        username: campaign.userId?.username || "",
        name: campaign.userId?.name || "Unknown",
        email: campaign.userId?.email || "Unknown",
      },
      moneyToRaise: Number(campaign.moneyToRaise || 0),
      raisedAmount: Number(campaign.raisedAmount || 0),
      currentFunding: Number(campaign.raisedAmount || 0),
      fundingType: campaign.fundingType || "",
      daysToRaise: Number(campaign.daysToRaise || 0),
      deadline: campaign.deadline || null,
      createdAt: campaign.createdAt,
    }));

    return res.status(200).json({
      success: true,
      campaigns: formatted,
    });
  } catch (error) {
    console.error("Get Admin Campaigns Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching campaigns.",
    });
  }
};

const getAdminTransactions = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      transactions: [],
      message: "Transaction model is not connected to the current admin backend yet.",
    });
  } catch (error) {
    console.error("Get Admin Transactions Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching transactions.",
    });
  }
};

const getAdminAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalFundraisers, fundraisers] = await Promise.all([
      User.countDocuments(),
      Fundraiser.countDocuments(),
      Fundraiser.find({}).sort({ createdAt: -1 }),
    ]);

    const totalRevenue = fundraisers.reduce(
      (sum, item) => sum + Number(item.raisedAmount || 0),
      0
    );

    const approvedCampaigns = fundraisers.filter((f) => f.status === "approved").length;
    const pendingCampaigns = fundraisers.filter((f) => f.status === "pending").length;
    const rejectedCampaigns = fundraisers.filter((f) => f.status === "rejected").length;

    const monthlyRaisedMap = {};

    fundraisers.forEach((fundraiser) => {
      const monthKey = formatMonthKey(fundraiser.createdAt);
      monthlyRaisedMap[monthKey] =
        (monthlyRaisedMap[monthKey] || 0) + Number(fundraiser.raisedAmount || 0);
    });

    const monthlyRaised = Object.entries(monthlyRaisedMap).map(([month, raised]) => ({
      month,
      raised,
    }));

    return res.status(200).json({
      success: true,
      overview: {
        totalUsers,
        totalFundraisers,
        totalInvestments: 0,
        totalRevenue,
        platformFees: 0,
        approvedCampaigns,
        pendingCampaigns,
        rejectedCampaigns,
      },
      monthlyRaised,
    });
  } catch (error) {
    console.error("Get Admin Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching analytics.",
    });
  }
};

const getAdminUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id.",
      });
    }

    const user = await User.findById(userId).select(
      "username name email role profile access activeMode createdAt updatedAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const userFundraisers = await Fundraiser.find({ userId })
      .populate("userId", "username name email")
      .sort({ createdAt: -1 });

    const campaigns = userFundraisers.map((campaign) => ({
      _id: campaign._id,
      projectTitle: campaign.projectTitle || "Fundraiser",
      projectOverview: campaign.projectOverview || "",
      projectCategory: campaign.projectCategory || "",
      status: campaign.status || "pending",
      fundingGoal: Number(campaign.moneyToRaise || 0),
      moneyRaised: Number(campaign.raisedAmount || 0),
      currentFunding: Number(campaign.raisedAmount || 0),
      fundingType: campaign.fundingType || "",
      deadline: campaign.deadline || null,
      createdAt: campaign.createdAt,
      documents: {
        license: campaign.license || "",
        gst: campaign.gst || "",
        companyRegistration: campaign.companyRegistration || "",
        legalDocument: campaign.legalDocument || "",
        photo: campaign.photo || "",
        projectPhotos: campaign.projectPhotos || [],
        video: campaign.video || "",
      },
    }));

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        activeMode: user.activeMode,
        phone: getUserPhone(user),
        photo: getUserPhoto(user),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        investorAccess: getInvestorAccessSummary(user),
        fundraiserAccess: getFundraiserAccessSummary(user),
        campaigns,
        investments: [],
        transactions: [],
      },
    });
  } catch (error) {
    console.error("Get Admin User Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching user details.",
    });
  }
};

const approveCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign id.",
      });
    }

    const campaign = await Fundraiser.findByIdAndUpdate(
      campaignId,
      { status: "approved" },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Campaign approved successfully.",
      campaign,
    });
  } catch (error) {
    console.error("Approve Campaign Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while approving campaign.",
    });
  }
};

const rejectCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign id.",
      });
    }

    const campaign = await Fundraiser.findByIdAndUpdate(
      campaignId,
      { status: "rejected" },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Campaign rejected successfully.",
      campaign,
    });
  } catch (error) {
    console.error("Reject Campaign Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while rejecting campaign.",
    });
  }
};

const deleteCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign id.",
      });
    }

    const campaign = await Fundraiser.findByIdAndDelete(campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Campaign deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Campaign Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting campaign.",
    });
  }
};

module.exports = {
  AdminDashboard,
  getAdminUsers,
  getAdminCampaigns,
  getAdminTransactions,
  getAdminAnalytics,
  getAdminUserDetails,
  approveCampaign,
  rejectCampaign,
  deleteCampaign,
};