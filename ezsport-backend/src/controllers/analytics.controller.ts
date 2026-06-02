import { Request, Response } from "express";
import Booking from "../models/booking.model";
import Venue from "../models/venue.model";
import Court from "../models/court.model";

/**
 * Lấy thống kê tổng quan cho owner
 */
export const getOwnerStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Lấy tất cả venues của owner
    const venues = await Venue.find({ owner: userId });
    const venueIds = venues.map(v => v._id);

    // Lấy tất cả courts của owner
    const courts = await Court.find({ venue: { $in: venueIds } });
    const courtIds = courts.map(c => c._id);

    // Thống kê bookings
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Tổng số bookings tháng này
    const bookingsThisMonth = await Booking.countDocuments({
      courtId: { $in: courtIds },
      bookingDate: { $gte: startOfMonth },
      status: { $in: ['CONFIRMED', 'COMPLETED'] }
    });

    // Tổng số bookings tháng trước
    const bookingsLastMonth = await Booking.countDocuments({
      courtId: { $in: courtIds },
      bookingDate: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      status: { $in: ['CONFIRMED', 'COMPLETED'] }
    });

    // Tính % thay đổi bookings
    const bookingsChange = bookingsLastMonth > 0 
      ? ((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth * 100).toFixed(1)
      : '0';

    // Tổng doanh thu tháng này
    const revenueThisMonth = await Booking.aggregate([
      {
        $match: {
          courtId: { $in: courtIds },
          bookingDate: { $gte: startOfMonth },
          status: { $in: ['CONFIRMED', 'COMPLETED'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Tổng doanh thu tháng trước
    const revenueLastMonth = await Booking.aggregate([
      {
        $match: {
          courtId: { $in: courtIds },
          bookingDate: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          status: { $in: ['CONFIRMED', 'COMPLETED'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' }
        }
      }
    ]);

    const revenueThisMonthValue = revenueThisMonth[0]?.total || 0;
    const revenueLastMonthValue = revenueLastMonth[0]?.total || 0;

    // Tính % thay đổi revenue
    const revenueChange = revenueLastMonthValue > 0
      ? ((revenueThisMonthValue - revenueLastMonthValue) / revenueLastMonthValue * 100).toFixed(1)
      : '0';

    // Số sân đang hoạt động
    const activeCourts = courts.filter(c => c.isActive).length;

    // Số booking đang chờ xác nhận
    const pendingBookings = await Booking.countDocuments({
      courtId: { $in: courtIds },
      status: 'PENDING'
    });

    res.status(200).json({
      message: "Lấy thống kê thành công",
      data: {
        totalBookings: bookingsThisMonth,
        bookingsChange: parseFloat(bookingsChange),
        totalRevenue: revenueThisMonthValue,
        revenueChange: parseFloat(revenueChange),
        totalVenues: venues.length,
        totalCourts: courts.length,
        activeCourts,
        pendingBookings,
      }
    });
  } catch (error: any) {
    console.error("Error getting owner stats:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * Lấy dữ liệu biểu đồ doanh thu theo ngày
 */
export const getRevenueChart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { days = 7 } = req.query;
    const numDays = parseInt(days as string, 10);

    // Lấy tất cả venues của owner
    const venues = await Venue.find({ owner: userId });
    const venueIds = venues.map(v => v._id);

    // Lấy tất cả courts của owner
    const courts = await Court.find({ venue: { $in: venueIds } });
    const courtIds = courts.map(c => c._id);

    // Tính ngày bắt đầu
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - numDays + 1);
    startDate.setHours(0, 0, 0, 0);

    // Aggregate revenue by date
    const revenueByDate = await Booking.aggregate([
      {
        $match: {
          courtId: { $in: courtIds },
          bookingDate: { $gte: startDate, $lte: endDate },
          status: { $in: ['CONFIRMED', 'COMPLETED'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$bookingDate" }
          },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Tạo array với tất cả các ngày (fill missing dates with 0)
    const chartData = [];
    for (let i = 0; i < numDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = revenueByDate.find(d => d._id === dateStr);
      
      chartData.push({
        date: dateStr,
        label: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: dayData?.revenue || 0,
        bookings: dayData?.bookings || 0
      });
    }

    res.status(200).json({
      message: "Lấy dữ liệu biểu đồ thành công",
      data: chartData
    });
  } catch (error: any) {
    console.error("Error getting revenue chart:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * Lấy top courts theo doanh thu
 */
export const getTopCourts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { limit = 5 } = req.query;

    // Lấy tất cả venues của owner
    const venues = await Venue.find({ owner: userId });
    const venueIds = venues.map(v => v._id);

    // Lấy tất cả courts của owner
    const courts = await Court.find({ venue: { $in: venueIds } });
    const courtIds = courts.map(c => c._id);

    // Aggregate revenue by court
    const topCourts = await Booking.aggregate([
      {
        $match: {
          courtId: { $in: courtIds },
          status: { $in: ['CONFIRMED', 'COMPLETED'] }
        }
      },
      {
        $group: {
          _id: '$courtId',
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      {
        $sort: { revenue: -1 }
      },
      {
        $limit: parseInt(limit as string, 10)
      }
    ]);

    // Populate court details
    const courtsWithDetails = await Promise.all(
      topCourts.map(async (item) => {
        const court = courts.find(c => c._id.toString() === item._id.toString());
        return {
          courtId: item._id,
          courtName: court?.name || 'Unknown',
          revenue: item.revenue,
          bookings: item.bookings
        };
      })
    );

    res.status(200).json({
      message: "Lấy top sân thành công",
      data: courtsWithDetails
    });
  } catch (error: any) {
    console.error("Error getting top courts:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
