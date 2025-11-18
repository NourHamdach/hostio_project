// ✅ Updated demoController.js to use new fields
const calendar = require("../services/googleCalendarService");
const Demo = require("../models/Demo");
const { sendDemoConfirmationEmail } = require("../services/emailService");
const { sendCancellationEmail } = require("../services/emailService");
const { Op } = require("sequelize");
const moment = require("moment");
const Company = require("../models/Company");
const StatusDemo = require("../models/demoRelations/StatusDemo");
const User = require("../models/User");
const RecruitmentNeeds = require("../models/demoRelations/RecruitmentNeeds");

const STATUS = {
  PENDING: 1,
  CONFIRMED: 2,
  CANCELLED: 3,
  DONE: 4,
};


const calendarId = process.env.GOOGLE_CALENDAR_ID;
const SLOT_DURATION = 30; // in minutes

exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    const startOfDay = new Date(`${date}T09:00:00`);
    const endOfDay = new Date(`${date}T17:00:00`);

    const events = await calendar.events.list({
      calendarId,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const takenSlots = events.data.items.map(e => ({
      start: new Date(e.start.dateTime),
      end: new Date(e.end.dateTime),
    }));

    const slots = [];
    for (let time = moment(startOfDay); time < moment(endOfDay); time.add(SLOT_DURATION, "minutes")) {
      const slotStart = time.clone();
      const slotEnd = slotStart.clone().add(SLOT_DURATION, "minutes");

      const isTaken = takenSlots.some(
        s => slotStart.toDate() < s.end && slotEnd.toDate() > s.start
      );

      if (!isTaken) {
        slots.push(slotStart.format("HH:mm"));
      }
    }

    res.json({ date, availableSlots: slots });
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).json({ message: "Failed to get available slots", error: error.message });
  }
};

exports.bookDemo = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "company" || !req.user.companyId) {
      return res.status(403).json({ message: "Only companies can book demos" });
    }

    const companyId = req.user.companyId;

    const {
      selectedDate,
      selectedTime,
      email,
      firstName,
      lastName,
      phoneCode,
      phoneNumber,
      recruitmentNeedsId,
      notes,
    } = req.body;

    const datetimeString = `${selectedDate}T${selectedTime}:00`;
    const start = new Date(datetimeString);

    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: "Invalid selectedDate or selectedTime" });
    }
    const now = new Date();
   if (start < now) {
  return res.status(400).json({
    message: "You cannot book a demo in the past.",
  });
}

    const startHour = start.getHours();
    const startMinutes = start.getMinutes();

    // ⛔ Reject times before 9:00 AM or after 4:30 PM
    if (startHour < 9 || (startHour === 16 && startMinutes > 30) || startHour >= 17) {
      return res.status(400).json({
        message: "Demo bookings must be scheduled between 09:00 AM and 04:30 PM.",
      });
    }

    const end = new Date(start.getTime() + SLOT_DURATION * 60000);

    const events = await calendar.events.list({
      calendarId,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const isConflict = events.data.items.some(event => {
      const existingStart = new Date(event.start.dateTime);
      const existingEnd = new Date(event.end.dateTime);
      return start < existingEnd && end > existingStart;
    });

    if (isConflict) {
      return res.status(400).json({ message: "This time slot is already booked." });
    }

    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: `Demo Booking - ${firstName} ${lastName}`,
        description: `Scheduled with ${firstName} ${lastName}`,
        start: { dateTime: start.toISOString(), timeZone: "Asia/Beirut" },
        end: { dateTime: end.toISOString(), timeZone: "Asia/Beirut" },
      },
    });

    const demo = await Demo.create({
      meetingDate: selectedDate,
      meetingTime: selectedTime,
      duration: SLOT_DURATION,
      firstName,
      lastName,
      email,
      phoneCode,
      phoneNumber,
      recruitmentNeedsId,
      notes,
      calendarEventId: event.data.id,
      calendarMeetingLink: null,
      statusId: STATUS.PENDING,
      companyId,
    });

    res.status(201).json({ message: "Demo booked successfully", demo });
  } catch (error) {
    console.error("Booking error:", error);
    console.log("🧪 recruitmentNeedsId:", req.body.recruitmentNeedsId);
    res.status(500).json({ message: "Booking failed", error: error.message });
  }
};



exports.confirmDemo = async (req, res) => {
  try {
    const { demoId } = req.params;
    const { meetingUrl } = req.body;

    if (!meetingUrl) {
      return res.status(400).json({ message: "Meeting URL is required for confirmation." });
    }

    const demo = await Demo.findByPk(demoId);
    if (!demo) return res.status(404).json({ message: "Demo not found" });
    // ✅ Combine date and time into one Date object
    const meetingDateTime = new Date(`${demo.meetingDate}T${demo.meetingTime}`);
    const now = new Date();

    // ❌ Prevent confirmation if demo is in the past
    if (meetingDateTime < now) {
      return res.status(400).json({ message: "Cannot confirm a demo scheduled in the past." });
    }

    demo.statusId = STATUS.CONFIRMED;
    demo.calendarMeetingLink = meetingUrl;
    await demo.save();

    await sendDemoConfirmationEmail(
      demo.email,
      `${demo.firstName} ${demo.lastName}`,
      meetingUrl,
      demo.meetingDate,
      demo.meetingTime
    );
    

    res.json({ message: "Demo confirmed and email sent", demo });
  } catch (error) {
    console.error("Confirmation error:", error);
    res.status(500).json({ message: "Confirmation failed", error: error.message });
  }
};

exports.cancelDemo = async (req, res) => {
  try {
    const { demoId } = req.params;
    const { reason } = req.body;

    const demo = await Demo.findByPk(demoId);
    if (!demo) return res.status(404).json({ message: "Demo not found" });

    if (demo.calendarEventId) {
      try {
        await calendar.events.delete({ companyName, eventId: demo.calendarEventId });
      } catch (err) {
        console.error("Failed to delete calendar event:", err.message);
      }
    }

    demo.statusId = STATUS.CANCELLED
    await demo.save();

    await sendCancellationEmail({
      to: demo.email,
      subject: "Your Demo Has Been Cancelled",
      companyName: demo.firstName, // optionally fetch companyName if needed
      meetingTime: `${demo.meetingDate} at ${demo.meetingTime}`,
      reason,
    });

    res.json({ message: "Demo cancelled and calendar event removed" });
  } catch (error) {
    console.error("Cancellation error:", error);
    res.status(500).json({ message: "Failed to cancel demo", error: error.message });
  }
};
exports.markDemoAsDone = async (req, res) => {
  try {
    const { demoId } = req.params;
    const demo = await Demo.findByPk(demoId);

    if (!demo) {
      return res.status(404).json({ message: "Demo not found" });
    }

    // ❌ Only allow if already confirmed
    if (demo.statusId !== STATUS.CONFIRMED) {
      return res.status(400).json({ message: "Only confirmed demos can be marked as done" });
    }

    const now = new Date();
    const [hour, minute] = demo.meetingTime.split(":").map(Number);
    const demoEnd = new Date(demo.meetingDate);
    demoEnd.setHours(hour);
    demoEnd.setMinutes(minute + demo.duration);
    demoEnd.setSeconds(0);

    // if (now < demoEnd) {
    //   return res.status(400).json({ message: "Cannot mark as done before the demo has ended" });
    // }

    demo.statusId = STATUS.DONE;
    await demo.save();

    res.json({ message: "Demo marked as done", demo });
  } catch (error) {
    console.error("Error marking demo as done:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUnverifiedCompaniesWithDoneDemo = async (req, res) => {
  try {
    const companies = await Company.findAll({
      where: { verified: false },
      include: [
        {
          model: Demo,
          required: true,
          where: { statusId: STATUS.DONE },
          attributes: ["demoId", "meetingDate", "meetingTime"]
        },
        {
          model: User, // include this!
          as: "user", // ensure this matches your association
          attributes: ["email", "phoneCode", "phoneNumber"] // ✅ include phone info
        }
      ],
      attributes: ["companyId", "companyName", "verified"]
    });
    

    res.json(companies);
  } catch (error) {
    console.error("Error fetching unverified companies with done demos:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getDemoById = async (req, res) => {
  try {
    const { demoId } = req.params;

    const demo = await Demo.findByPk(demoId, {
      include: [
        {
          model: Company,
          attributes: ["companyId", "companyName", "verified"],
        },
        {
          model: StatusDemo,
          attributes: ["statusId", "statusName"],
        },
        {
          model: RecruitmentNeeds,
          attributes: ["recruitmentNeedsId", "description"],
        }
      ]
    });

    if (!demo) {
      return res.status(404).json({ message: "Demo not found" });
    }

    // Structure response
    const response = {
      demoId: demo.demoId,
      email: demo.email,
      meetingDate: demo.meetingDate,
      meetingTime: demo.meetingTime,
      duration: demo.duration,
      firstName: demo.firstName,
      lastName: demo.lastName,
      phoneCode: demo.phoneCode,
      phoneNumber: demo.phoneNumber,
      notes: demo.notes,
      calendarEventId: demo.calendarEventId,
      calendarMeetingLink: demo.calendarMeetingLink,
      status: demo.StatusDemo,
      recruitmentNeeds: demo.RecruitmentNeed || demo.RecruitmentNeeds, // depending on your alias
      company: demo.Company ? {
        companyId: demo.Company.companyId,
        companyName: demo.Company.companyName,
        verified: demo.Company.verified
      } : null,
      createdAt: demo.createdAt,
      updatedAt: demo.updatedAt
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching demo by ID:", error);
    res.status(500).json({ message: "Failed to retrieve demo", error: error.message });
  }
};
exports.verifyCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Check if company exists
    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Check for at least one demo with status 'done'
    const hasDoneDemo = await Demo.findOne({
      where: { companyId, statusId: STATUS.DONE },
    });

    if (!hasDoneDemo) {
      return res.status(400).json({
        message: "Company cannot be verified without a completed demo",
      });
    }

    // Update the verified flag
    company.verified = true;
    await company.save();

    res.json({ message: "Company verified successfully", company });
  } catch (error) {
    console.error("Error verifying company:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



exports.getDemosByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date || isNaN(new Date(date).getTime())) {
      return res.status(400).json({ message: "Valid date is required (YYYY-MM-DD)" });
    }

    const demos = await Demo.findAll({
      where: { meetingDate: date },
      include: [
        {
          model: Company,
          attributes: ["companyId", "companyName", "verified"]
        },
        {
          model: StatusDemo,
          attributes: ["statusId", "statusName"]
        },
        {
          model: RecruitmentNeeds,
          attributes: ["recruitmentNeedsId", "description"]
        }
      ],
      order: [["meetingTime", "ASC"]]
    });

    res.json(demos);
  } catch (error) {
    console.error("Error fetching demos by date:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



exports.getDemosByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    if (!status) {
      return res.status(400).json({ message: "Status query is required (e.g., ?status=1 or ?status=1,2)" });
    }

    // Support multiple statuses
    const statusArray = status.split(",").map(Number).filter(n => !isNaN(n));

    if (statusArray.length === 0) {
      return res.status(400).json({ message: "Invalid status values" });
    }

    const demos = await Demo.findAll({
      where: { statusId: statusArray },
      include: [
        {
          model: Company,
          attributes: ["companyId", "companyName", "verified"]
        },
        {
          model: StatusDemo,
          attributes: ["statusId", "statusName"]
        },
        {
          model: RecruitmentNeeds,
          attributes: ["recruitmentNeedsId", "description"]
        }
      ],
      order: [["meetingDate", "ASC"], ["meetingTime", "ASC"]]
    });

    res.json(demos);
  } catch (error) {
    console.error("Error fetching demos by status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.blockTimeSlot = async (req, res) => {
  try {
    const { selectedDate, selectedTime } = req.query;

    if (!selectedDate || !selectedTime) {
      return res.status(400).json({ message: "selectedDate and selectedTime are required in query" });
    }

    const start = new Date(`${selectedDate}T${selectedTime}:00`);

    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: "Invalid date or time format" });
    }

    const end = new Date(start.getTime() + SLOT_DURATION * 60000);

    // 🔍 Check for existing events in the selected slot
    const events = await calendar.events.list({
      calendarId,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const isConflict = events.data.items.some(event => {
      const existingStart = new Date(event.start.dateTime || event.start.date);
      const existingEnd = new Date(event.end.dateTime || event.end.date);
      return start < existingEnd && end > existingStart;
    });

    if (isConflict) {
      return res.status(400).json({
        message: "This time slot is already booked or blocked. Cannot overwrite.",
      });
    }

    // ✅ Insert blocked event
    const event = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary: "⛔ Blocked Slot (Admin)",
        description: "This time slot is blocked by admin and unavailable for bookings.",
        start: { dateTime: start.toISOString(), timeZone: "Asia/Beirut" },
        end: { dateTime: end.toISOString(), timeZone: "Asia/Beirut" },
      },
    });

    res.status(201).json({
      message: "Time slot successfully blocked",
      eventId: event.data.id,
      blocked: {
        from: start.toISOString(),
        to: end.toISOString(),
      },
    });
  } catch (error) {
    console.error("🛑 Error blocking time slot:", error.message);
    res.status(500).json({ message: "Failed to block time slot", error: error.message });
  }
};
exports.getAllDemos = async (req, res) => {
  try {
    const demos = await Demo.findAll({
      include: [
        {
          model: Company,
          attributes: ["companyId", "companyName", "verified"]
        },
        {
          model: StatusDemo,
          attributes: ["statusId", "statusName"]
        },
        {
          model: RecruitmentNeeds,
          attributes: ["recruitmentNeedsId", "description"]
        }
      ],
      order: [["meetingDate", "ASC"], ["meetingTime", "ASC"]]
    });

    res.json(demos);
  } catch (error) {
    console.error("Error fetching all demos:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.setJobLimit = async (req, res) => {
  try {
    const { companyId } = req.query;
    const { jobLimit } = req.body;

    if (!jobLimit || isNaN(jobLimit) || jobLimit <= 0) {
      return res.status(400).json({ message: "Invalid job limit" });
    }

    const company = await Company.findByPk(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    if (!company.verified) {
      return res.status(400).json({ message: "Cannot change job limit after verification" });
    }

    company.jobLimit = jobLimit;
    await company.save();

    res.json({ message: "Job limit set successfully", company });
  } catch (error) {
    console.error("Error setting job limit:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllVerifiedCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      where: { verified: true },
      include: [
        {
          model: User,
          attributes: ["email"]
        }
      ],
      attributes: [
        "companyId",
        "companyName",
        "verified",
        "jobLimit",
        "hasPremiumPlan"
      ]
    });

    res.json(companies);
  } catch (error) {
    console.error("Error fetching verified companies:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.getAllRecruitmentNeeds = async (req, res) => {
  try {
    const needs = await RecruitmentNeeds.findAll({
      attributes: ["recruitmentNeedsId", "description"]
    });

    res.json(needs);
  } catch (error) {
    console.error("Error fetching recruitment needs:", error);
    res.status(500).json({ message: "Failed to fetch recruitment needs", error: error.message });
  }
};


exports.getAvailableSlotsForWeek = async (req, res) => {
  try {
    const startDate = req.query.startDate
      ? moment(req.query.startDate)
      : moment();

    const endDate = startDate.clone().add(7, "days");

    const weekSlots = {};

    for (let date = startDate.clone(); date.isBefore(endDate); date.add(1, "day")) {
      const day = date.day();
      // Skip weekends
      if (day === 0 || day === 6) continue;

      const dateStr = date.format("YYYY-MM-DD");
      const startOfDay = date.clone().hour(9).minute(0).second(0);
      const endOfDay = date.clone().hour(16).minute(30).second(0);

      const events = await calendar.events.list({
        calendarId,
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.clone().add(SLOT_DURATION, "minutes").toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      const takenSlots = events.data.items.map(e => ({
        start: new Date(e.start.dateTime),
        end: new Date(e.end.dateTime),
      }));

      const available = [];
      for (
        let time = startOfDay.clone();
        time.isSameOrBefore(endOfDay);
        time.add(SLOT_DURATION, "minutes")
      ) {
        const slotStart = time.clone();
        const slotEnd = slotStart.clone().add(SLOT_DURATION, "minutes");

        const isTaken = takenSlots.some(
          s => slotStart.toDate() < s.end && slotEnd.toDate() > s.start
        );

        if (!isTaken) {
          available.push(slotStart.format("HH:mm"));
        }
      }

      weekSlots[dateStr] = available;
    }

    res.json(weekSlots);
  } catch (error) {
    console.error("Error fetching weekly slots:", error);
    res.status(500).json({ message: "Failed to fetch weekly slots", error: error.message });
  }
};