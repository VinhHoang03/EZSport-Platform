import { Router } from "express";
import coachController from "../controllers/coach.controller";
import { authorizeRoles, verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", coachController.list.bind(coachController));
router.use(verifyToken);
router.get("/me/profile", authorizeRoles("coach"), coachController.myProfile.bind(coachController));
router.put("/me/profile", authorizeRoles("coach"), coachController.saveMyProfile.bind(coachController));
router.put("/me/availability", authorizeRoles("coach"), coachController.saveAvailability.bind(coachController));
router.get("/me/bookings", authorizeRoles("coach"), coachController.coachBookings.bind(coachController));
router.patch("/bookings/:id/transition", authorizeRoles("coach"), coachController.transition.bind(coachController));
router.post("/:id/bookings", authorizeRoles("player"), coachController.createBooking.bind(coachController));
router.get("/player/bookings", authorizeRoles("player"), coachController.playerBookings.bind(coachController));
router.patch("/player/bookings/:id/sync-payment", authorizeRoles("player"), coachController.syncPayment.bind(coachController));
router.delete("/player/bookings/:id", authorizeRoles("player"), coachController.cancel.bind(coachController));
router.get("/:id/slots", coachController.getSlots.bind(coachController));
router.get("/:id", coachController.getProfile.bind(coachController));

export default router;
