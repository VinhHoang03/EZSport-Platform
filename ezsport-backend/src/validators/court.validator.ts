import { body, ValidationChain } from "express-validator";

export const suggestCourtsValidator: ValidationChain[] = [
  body("prompt")
    .notEmpty()
    .withMessage("Bạn vui lòng nhập nội dung cần tìm.")
    .isString()
    .withMessage("Nội dung tìm kiếm phải là chuỗi ký tự.")
    .isLength({ min: 1, max: 500 })
    .withMessage("Nội dung tìm kiếm tối đa 500 ký tự."),

  body("userLat")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Vĩ độ phải là số từ -90 đến 90."),

  body("userLng")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Kinh độ phải là số từ -180 đến 180."),

  body("maxDistance")
    .optional()
    .isFloat({ min: 0.1, max: 100 })
    .withMessage("Khoảng cách tối đa phải từ 0.1 đến 100 km."),

  body("limit")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("Số lượng gợi ý phải từ 1 đến 20."),
];

export const compareCourtsValidator: ValidationChain[] = [
  body("courtIds")
    .isArray({ min: 2, max: 5 })
    .withMessage("Phải cung cấp từ 2 đến 5 ID sân để so sánh.")
    .custom((value) => {
      if (!value.every((id: any) => typeof id === "string")) {
        throw new Error("Tất cả ID phải là chuỗi ký tự.");
      }
      return true;
    }),
];
