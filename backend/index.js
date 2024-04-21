const express = require("express");
const cors = require("cors");
const { Room, Booking } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const facilitiesObj = {};
(async function () {
  getFacilities();
})();

async function getFacilities() {
  const findResult = await Room.find({});
  findResult.forEach((room) => {
    room.facilities.forEach((item) => {
      if (!Object.hasOwn(facilitiesObj, item)) {
        facilitiesObj[item] = item;
      }
    });
  });
}

app.get("/v1/facilities", async (req, res) => {
  if (!Object.keys(facilitiesObj).length) {
    getFacilities();
  }
  res.send(facilitiesObj);
});

app.post("/v1/roomsList", async (req, res) => {
  let seatCount = req.body.filters.seatCount;
  let features = req.body.filters.features;
  let searchString = req.body.searchString;
  let tokenArr = [];
  let roomsList;
  const set1 = new Set();

  if (searchString.length) {
    tokenArr = searchString.split(" ");
    tokenArr.forEach((token) => {
      Object.keys(facilitiesObj).forEach((key) => {
        if (key.includes(token)) {
          set1.add(key);
        }
      });
    });
  }
  features.forEach((ele) => set1.add(ele));

  let regexWords = tokenArr.map((e) => {
    return new RegExp(e, "i");
  });
  const combinedFeatures = Array.from(set1);
  if (!combinedFeatures.length && !searchString.length) {
    roomsList = await Room.find({});
  } else {
    roomsList = await Room.find({
      $or: [
        {
          facilities: { $in: combinedFeatures },
          seatCapacity: { $gte: seatCount },
        },
        {
          name: { $in: regexWords },
          seatCapacity: { $gte: seatCount },
        },
      ],
    });
  }
  res.send(roomsList);
});

app.get("/v1/bookings", async (req, res) => {
  const filters = {};
  filters.date = req.query.date;
  filters.roomId = req.query.roomId;
  const bookings = await Booking.find(filters);
  res.send(bookings);
});

app.post("/v1/bookings/update", async (req, res) => {
  const newBookings = req.body.newBookings;
  const deletions = req.body.deletions;
  if (newBookings.length) {
    // create new rows
    Booking.insertMany(newBookings)
      .then(function (docs) {
        // console.log(docs);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }
  if (deletions.length) {
    // delete old rows
    const deleteIds = deletions.map((a) => a._id);
    Booking.deleteMany({ _id: { $in: deleteIds } })
      .then(function (docs) {
        // console.log(docs);
      })
      .catch(function (err) {
        res.status(500).send(err);
      });
  }
  res.send({ msg: "done" });
});

app.get("/v1/nextAvailability", async (req, res) => {
  let { roomId, currentSlot, date } = req.query;
  async function nextAvailable(date) {
    const filters = {};
    filters.date = date;
    filters.roomId = roomId;
    const currentBookings = await Booking.find(filters);
    const slotsArr = Array(18).fill(0);

    currentBookings.forEach((ele) => {
      slotsArr[ele.slot - 1] = 1;
    });

    let nextSlot = -1;
    for (let index = 0; index < slotsArr.length; index++) {
      if (index + 1 >= currentSlot && slotsArr[index] == 0) {
        nextSlot = index + 1;
        break;
      }
    }
    return nextSlot;
  }

  function localISOLogic(param) {
    let monthString =
      param.getMonth() + 1 < 10
        ? `0${param.getMonth() + 1}`
        : `${param.getMonth() + 1}`;
    return `${param.getFullYear()}-${monthString}-${param.getDate()}`;
  }

  const dateItr = new Date(Date.parse(date));
  let nextSlot = await nextAvailable(localISOLogic(dateItr));
  let loopBreaker = 10;
  while (nextSlot == -1 && loopBreaker) {
    dateItr.setDate(dateItr.getDate() + 1);
    currentSlot = 1;
    nextSlot = await nextAvailable(localISOLogic(dateItr));
    loopBreaker--;
  }

  res.send({
    nextAvailableDate: localISOLogic(dateItr),
    nextAvailableSlot: nextSlot,
  });
});

app.listen(3000, () => console.log("Server listening at port 3000"));
