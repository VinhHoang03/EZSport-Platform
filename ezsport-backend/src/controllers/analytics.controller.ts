import { Request, Response } from "express";
import Booking from "../models/booking.model";
import Venue from "../models/venue.model";
import Court from "../models/court.model";
import { User } from "../models/user.model";

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

/**
 * Lấy lịch sử giao dịch/đặt sân cho owner
 */
export const getOwnerTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || "";

    // Lấy tất cả venues của owner
    const venues = await Venue.find({ owner: userId });
    const venueIds = venues.map(v => v._id);

    // Lấy tất cả courts của owner
    const courts = await Court.find({ venue: { $in: venueIds } });
    const courtIds = courts.map(c => c._id);

    // Xây dựng query tìm kiếm
    const query: any = {
      courtId: { $in: courtIds }
    };

    // Nếu tìm kiếm
    if (search) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(search);
      const searchConditions: any[] = [
        { bookerName: { $regex: search, $options: "i" } },
        { bookerPhone: { $regex: search, $options: "i" } },
        { sport: { $regex: search, $options: "i" } }
      ];

      if (isObjectId) {
        searchConditions.push({ _id: search });
      } else if (search.length >= 4) {
        // Hỗ trợ tìm kiếm theo đuôi ID (Mã GD)
        searchConditions.push({
          $expr: {
            $regexMatch: {
              input: { $toString: "$_id" },
              regex: search,
              options: "i"
            }
          }
        });
      }

      // Tìm các sân khớp với tên sân
      const matchingCourts = courts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
      if (matchingCourts.length > 0) {
        searchConditions.push({ courtId: { $in: matchingCourts.map(c => c._id) } });
      }

      query.$or = searchConditions;
    }

    // Lấy tổng số lượng và tổng cộng tiền cho toàn bộ danh sách khớp query (không phân trang)
    const statsResult = await Booking.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" }
        }
      }
    ]);

    const totalCount = statsResult[0]?.totalCount || 0;
    const totalRevenue = statsResult[0]?.totalRevenue || 0;

    // Lấy danh sách bookings có phân trang
    const bookings = await Booking.find(query)
      .populate("userId", "name email avatar")
      .populate({
        path: "courtId",
        populate: {
          path: "venue",
          select: "name"
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "Lấy lịch sử giao dịch thành công",
      data: {
        bookings,
        total: totalCount,
        totalRevenue,
        page,
        limit
      }
    });
  } catch (error: any) {
    console.error("Error getting owner transactions:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * Lấy thống kê tổng quan cho admin
 */
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const allBookings = await Booking.find({});
    
    const validBookings = allBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED');
    const totalBookings = validBookings.length;
    const totalRevenue = validBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalCommissions = Math.round(totalRevenue * 0.1); // 10% commission

    const totalAllStatus = allBookings.length;
    const cancelledCount = allBookings.filter(b => b.status === 'CANCELLED').length;
    const cancellationRate = totalAllStatus > 0 ? ((cancelledCount / totalAllStatus) * 100).toFixed(1) : '0';

    const pendingOwnersCount = await User.countDocuments({ role: 'owner', status: 'inactive' });
    const pendingBookingsCount = await Booking.countDocuments({ status: 'PENDING' });

    // Aggregate top booking locations
    const bookingsForLocations = await Booking.find({ status: { $in: ['CONFIRMED', 'COMPLETED'] } })
      .populate({
        path: "courtId",
        populate: { path: "venue", select: "location" }
      });

    const locationCounts: Record<string, number> = {};
    bookingsForLocations.forEach(b => {
      const venueLocation = (b.courtId as any)?.venue?.location;
      if (venueLocation) {
        const parts = venueLocation.split(',');
        let area = venueLocation.trim();
        if (parts.length >= 2) {
          const district = parts[parts.length - 2]?.trim() || '';
          const city = parts[parts.length - 1]?.trim() || '';
          if (district && city) {
            area = `${district}, ${city}`;
          } else if (district) {
            area = district;
          }
        }
        locationCounts[area] = (locationCounts[area] || 0) + 1;
      }
    });

    const topAreas = Object.keys(locationCounts)
      .map(area => ({
        name: area,
        count: locationCounts[area]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const totalDiscount = validBookings.reduce((sum, b) => sum + (b.discount || 0), 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const discountThisMonth = validBookings
      .filter(b => b.bookingDate && new Date(b.bookingDate) >= startOfMonth)
      .reduce((sum, b) => sum + (b.discount || 0), 0);

    const discountLastMonth = validBookings
      .filter(b => b.bookingDate && new Date(b.bookingDate) >= startOfLastMonth && new Date(b.bookingDate) <= endOfLastMonth)
      .reduce((sum, b) => sum + (b.discount || 0), 0);

    let discountGrowth = 0;
    if (discountLastMonth > 0) {
      discountGrowth = Math.round(((discountThisMonth - discountLastMonth) / discountLastMonth) * 100);
    } else if (discountThisMonth > 0) {
      discountGrowth = 100;
    }

    res.status(200).json({
      message: "Lấy thống kê admin thành công",
      data: {
        totalRevenue,
        totalCommissions,
        totalBookings,
        cancellationRate: parseFloat(cancellationRate),
        pendingOwners: pendingOwnersCount,
        pendingBookings: pendingBookingsCount,
        topAreas,
        totalDiscount,
        discountGrowth,
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * Lấy biểu đồ doanh thu hàng tháng cho admin
 */
export const getAdminRevenueChart = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const chartData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const bookings = await Booking.find({
        bookingDate: { $gte: startOfMonth, $lte: endOfMonth },
        status: { $in: ['CONFIRMED', 'COMPLETED'] }
      });

      const revenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      const label = `Th${String(d.getMonth() + 1).padStart(2, '0')}`;

      chartData.push({
        month: label,
        revenue,
        bookings: bookings.length
      });
    }

    res.status(200).json({
      message: "Lấy biểu đồ doanh thu admin thành công",
      data: chartData
    });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * Lấy danh sách 5 hoạt động đặt sân gần đây nhất
 */
export const getAdminRecentActivities = async (req: Request, res: Response) => {
  try {
    const recentBookings = await Booking.find({})
      .populate({
        path: "courtId",
        populate: { path: "venue", select: "name" }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    const activities = recentBookings.map(b => {
      const courtName = (b.courtId as any)?.name || 'sân';
      const venueName = (b.courtId as any)?.venue?.name || 'cơ sở';
      return {
        id: b._id,
        user: b.bookerName || 'Khách',
        action: `vừa đặt sân tại ${venueName} (${courtName})`,
        time: b.createdAt ? new Date(b.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
        status: b.status,
      };
    });

    res.status(200).json({
      message: "Lấy hoạt động gần đây thành công",
      data: activities
    });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * Lấy tỉ lệ cơ cấu môn thể thao trong các đặt sân
 */
export const getAdminSportMix = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({ status: { $in: ['CONFIRMED', 'COMPLETED'] } })
      .populate("courtId", "sportTypes");

    const counts: Record<string, number> = {};
    let total = 0;

    bookings.forEach(b => {
      const sportTypes = (b.courtId as any)?.sportTypes || ['Bóng đá'];
      sportTypes.forEach((sport: string) => {
        counts[sport] = (counts[sport] || 0) + 1;
        total += 1;
      });
    });

    const percentages = Object.keys(counts).map(sport => ({
      sport,
      count: counts[sport],
      percent: total > 0 ? Math.round((counts[sport] / total) * 100) : 0
    }));

    res.status(200).json({
      message: "Lấy cơ cấu loại hình thành công",
      data: percentages
    });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * Lấy lịch sử giao dịch/đặt sân cho admin
 */
export const getAdminTransactions = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const skip = (page - 1) * limit;

    const totalCount = await Booking.countDocuments({});

    const bookings = await Booking.find({})
      .populate("userId", "fullName email avatar")
      .populate({
        path: "courtId",
        populate: {
          path: "venue",
          select: "name owner image",
          populate: {
            path: "owner",
            select: "fullName"
          }
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const formattedBookings = bookings.map(b => {
      const court = b.courtId as any;
      const venue = court?.venue;
      const owner = venue?.owner;
      return {
        id: b._id.toString(),
        venue: venue?.name || 'Sân vận động',
        owner: owner?.fullName || 'Chủ sân',
        value: b.totalPrice || 0,
        rate: 10,
        commission: Math.round((b.totalPrice || 0) * 0.1),
        status: b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'paid' : b.status === 'PENDING' ? 'processing' : 'pending',
        img: venue?.image || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=80&auto=format&fit=crop&q=60'
      };
    });

    res.status(200).json({
      message: "Lấy lịch sử giao dịch admin thành công",
      data: {
        bookings: formattedBookings,
        total: totalCount,
        page,
        limit
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
