const Share = require("../models/Share");
const mongoose = require("mongoose");

const addShare = async (req, res) => {
  var shareDetails = new Share({
    companyName: req.body.companyName,
    noOfShare: req.body.noOfShare,
    user: req.body.id,
  });
  try {
    const share = await Share.findOne({ companyName: req.body.companyName });
    if (share)
      return res
        .status(409)
        .send({
          message:
            "Share of this Company already exist, please update in order to make changes",
        });
    await shareDetails.save();

    return res.status(201).json(shareDetails);
  } catch (error) {
    return res.status(500).json(error.message);
  }

  // try {
  //   const newCourse = await Course.create({
  //     data: req.body.data,
  //     createdAt: Date.now(),
  //   });

  //   await newCourse.save();

  //   return res.status(200).json(newCourse);
  // } catch (error) {
  //   return res.status(500).json(error.message);
  // }
};

const getAllShare = async (req, res) => {
  const { id } = req.query;
  try {
    const shares = await Share.find({ user: id })
      .sort({ createdAt: -1 })
      .populate("user");

    return res.status(200).json(shares);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const shareDetails = async (req, res) => {
  try {
    const share = await Share.findById(req.params.id);
    return res.status(200).json(share);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

const updateShare = async (req, res) => {
  const { id } = req.params;
  var shareRecords = {
    companyName: req.body.companyName,
    noOfShare: req.body.noOfShare,
    user: req.body.id,
  };

  try {
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No course with id: ${id}`);
    await Share.findByIdAndUpdate(id, shareRecords, { new: true });
    const share = await Share.findById(req.params.id);

    return res.status(200).json(share);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const deleteShare = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No post with id: ${id}`);
    const share = await Share.findByIdAndDelete(id);

    return res.status(200).json(share);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

module.exports = {
  addShare,
  getAllShare,
  shareDetails,
  updateShare,
  deleteShare,
};
