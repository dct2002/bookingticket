const Reservation = require("../models/Reservation.Model");

exports.getAllReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find().populate("author");
    res.status(200).json({
      status: "success",
      results: reservations.length,
      data: { reservations },
    });
  } catch (error) {
    res.json(error);
  }
};

exports.getSummaryReservation = async (req, res) => {
  try {
    const result = await Reservation.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$total" },
          ticket: { $sum: { $size: "$tickets" } },
        },
      },
      {
        $group: {
          _id: "$_id.year",
          total: { $sum: "$total" },
          ticket: { $sum: "$ticket" },
          months: {
            $push: { month: "$_id.month", total: "$total", ticket: "$ticket" },
          },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id",
          total: 1,
          ticket: 1,
          months: 1,
        },
      },
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOneReservation = async (req, res, next) => {
  try {
    const { reservationId } = req.params;
    const reservation = await Reservation.findById(reservationId);
    res.status(200).json(reservation);
  } catch (error) {
    next(error);
  }
};

exports.createReservation = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const reservation = await Reservation.create({
      ...req.body,
      author: userId,
    });
    res.status(200).json({
      status: "success",
      data: { reservation },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateReservation = async (req, res, next) => {
  try {
    const { reservationId } = req.params;
    const reservation = await Reservation.findByIdAndUpdate(
      reservationId,
      { ...req.body },
      { new: true, runValidator: true }
    );
    res.status(200).json({
      status: "success",
      data: { reservation },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteReservation = async (req, res, next) => {
  try {
    const { reservationId } = req.params;
    await Reservation.findByIdAndDelete(reservationId);
    res.status(200).json({
      status: "success",
      message: "Reservation has been deleted",
    });
  } catch (error) {
    next(error);
  }
};
