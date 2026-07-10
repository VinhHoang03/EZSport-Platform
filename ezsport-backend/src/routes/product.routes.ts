import express from "express";
import {
  getProductsByVenue,
  getProductsByVenueAll,
  getProductsByShop,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/venue/:venueId", getProductsByVenue);
router.get("/venue/:venueId/all", verifyToken, authorizeRoles("shop", "owner", "admin"), getProductsByVenueAll);
router.get("/shop/:shopId", getProductsByShop);
router.post("/venue/:venueId", verifyToken, authorizeRoles("shop", "owner", "admin"), createProduct);
router.put("/:productId", verifyToken, authorizeRoles("shop", "owner", "admin"), updateProduct);
router.delete("/:productId", verifyToken, authorizeRoles("shop", "owner", "admin"), deleteProduct);

export default router;
