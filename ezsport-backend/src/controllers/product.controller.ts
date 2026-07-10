import { Request, Response } from "express";
import Product from "../models/product.model";
import Venue from "../models/venue.model";
import { User } from "../models/user.model";

// GET /api/venues/:venueId/products
// Fetch active products/services (sell or rent) for customers
export const getProductsByVenue = async (req: Request, res: Response) => {
  try {
    const { venueId } = req.params;
    const products = await Product.find({ venueId, isActive: true });
    res.status(200).json({ message: "Fetch active products success", data: products });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/venues/:venueId/products/all
// Fetch all products (including inactive/out of stock) for shop owners
export const getProductsByVenueAll = async (req: Request, res: Response) => {
  try {
    const { venueId } = req.params;
    const userId = req.user?.id || req.id;

    // Check authorization: requesting user must have this venue in their venueIds or be admin/owner
    const requestingUser = await User.findById(userId);
    if (!requestingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAuthorized = 
      requestingUser.role === 'admin' ||
      (requestingUser.role === 'shop' && requestingUser.venueIds?.some(id => id.toString() === venueId)) ||
      (requestingUser.role === 'owner' && (await Venue.findById(venueId))?.owner.toString() === userId);

    if (!isAuthorized) {
      return res.status(403).json({ message: "Access denied" });
    }

    const products = await Product.find({ venueId });
    res.status(200).json({ message: "Fetch all products success", data: products });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/venues/:venueId/products
// Create product for a venue
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { venueId } = req.params;
    const userId = req.user?.id || req.id;

    // Check authorization
    const requestingUser = await User.findById(userId);
    if (!requestingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAuthorized = 
      requestingUser.role === 'admin' ||
      (requestingUser.role === 'shop' && requestingUser.venueIds?.some(id => id.toString() === venueId)) ||
      (requestingUser.role === 'owner' && (await Venue.findById(venueId))?.owner.toString() === userId);

    if (!isAuthorized) {
      return res.status(403).json({ message: "Access denied" });
    }

    const productData = {
      ...req.body,
      venueId,
      owner: userId
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({ message: "Create product success", data: product });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/products/:productId
// Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id || req.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check authorization
    const requestingUser = await User.findById(userId);
    if (!requestingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAuthorized = 
      requestingUser.role === 'admin' ||
      product.owner.toString() === userId ||
      (requestingUser.role === 'shop' && requestingUser.venueIds?.some(id => id.toString() === product.venueId.toString())) ||
      (requestingUser.role === 'owner' && (await Venue.findById(product.venueId))?.owner.toString() === userId);

    if (!isAuthorized) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Update product success", data: updatedProduct });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/products/:productId
// Delete / Deactivate product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const userId = req.user?.id || req.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check authorization
    const requestingUser = await User.findById(userId);
    if (!requestingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAuthorized = 
      requestingUser.role === 'admin' ||
      product.owner.toString() === userId ||
      (requestingUser.role === 'shop' && requestingUser.venueIds?.some(id => id.toString() === product.venueId.toString()));

    if (!isAuthorized) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Soft delete by deactivating
    product.isActive = false;
    await product.save();

    res.status(200).json({ message: "Delete product success" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/products/shop/:shopId
export const getProductsByShop = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;
    const products = await Product.find({ owner: shopId, isActive: true });
    res.status(200).json({ message: "Fetch active products for shop success", data: products });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
