// controllers/campaign.js
// Using Fundraiser model as "Campaign" (your investor listing is reading fundraisers)
const Campaign = require("../models/Fundraiser");

const getAllCampaigns = async (req, res) => {
  try {
    // ✅ Public page: show only approved if you want
    // const filter = { status: "approved" };
    const filter = {};

    const campaigns = await Campaign.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const data = campaigns.map((c) => {
      // ✅ normalize dates
      const createdAt = c.createdAt ? new Date(c.createdAt) : new Date();

      // ✅ ensure deadline exists
      let deadline = c.deadline ? new Date(c.deadline) : null;
      if (!deadline && c.daysToRaise && createdAt) {
        const ms = Number(c.daysToRaise) * 24 * 60 * 60 * 1000;
        deadline = new Date(createdAt.getTime() + ms);
      }

      // ✅ normalize funding fields (frontend uses moneyToRaise + raisedAmount a lot)
      const moneyToRaise = Number(
        c.moneyToRaise ?? c.goalAmount ?? 0
      );
      const raisedAmount = Number(
        c.raisedAmount ?? c.moneyRaised ?? 0
      );

      // ✅ normalize images (frontend uses photo OR imageUrl sometimes)
      const photo = c.photo ?? c.imageUrl ?? null;
      const imageUrl = c.imageUrl ?? c.photo ?? null;

      // ✅ normalize location safely
      const projectLocation = c.projectLocation ?? {
        city: c.city,
        state: c.state,
        country: c.country,
      };

      // ✅ normalize documents
      // (you can keep your existing keys, this just ensures they exist)
      const docs = {
        license: c.license ?? null,
        kyc: c.kyc ?? null,
        pan: c.pan ?? null,
      };

      return {
        ...c,

        // dates
        createdAt,
        deadline,

        // funding normalization
        moneyToRaise,
        raisedAmount,
        moneyRaised: Number(c.moneyRaised ?? raisedAmount ?? 0),

        // media normalization
        photo,
        imageUrl,

        // location + docs normalization
        projectLocation,
        ...docs,
      };
    });

    return res.status(200).json({ data });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getAllCampaigns };