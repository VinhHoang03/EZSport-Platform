import express, { NextFunction, Request, Response, Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import route from "./routes/index.routes";


const app: Application = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Xử lý lỗi parse JSON (ví dụ: Body đặt JSON nhưng nội dung rỗng/không hợp lệ)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'JSON không hợp lệ', error: err.message });
  }
  next(err);
});
route(app);


app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({
    message: "Lỗi máy chủ nội bộ",
    error: err.message || err,
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app