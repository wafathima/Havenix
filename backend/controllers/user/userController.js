const User = require("../../models/User");

const getSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: "seller" })
      .select("name email phoneNo profilePic bio city")
      .sort({ name: 1 });

    res.json({
      success: true,
      sellers: sellers
    });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sellers"
    });
  }
};


const getBuilders = async (req, res) => {
  try {
    const builders = await User.find({ role: "builder" })
      .select("name email phoneNo profilePic bio city")
      .sort({ name: 1 });

    res.json({
      success: true,
      builders: builders
    });
  } catch (error) {
    console.error("Error fetching builders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch builders"
    });
  }
};

module.exports = {
  getSellers,
  getBuilders
};