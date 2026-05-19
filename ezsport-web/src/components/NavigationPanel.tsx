import React from 'react';

interface NavigationPanelProps {
  destination: string;
  distance: number;
  time: number;
  onCancel: () => void;
  onCheckIn?: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

const formatTime = (seconds: number) => {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return { value: mins, unit: 'phút' };
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return { value: hrs, unit: `giờ ${remainingMins} phút` };
};

const formatDistance = (meters: number) => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

const NavigationPanel: React.FC<NavigationPanelProps> = ({
  destination,
  distance,
  time,
  onCancel,
  onCheckIn,
  isMinimized,
  onToggleMinimize,
}) => {
  const eta = formatTime(time);
  const isClose = distance < 200; // 200 meters

  if (isMinimized) {
    // Mini pill shown at bottom while navigating
    return (
      <div
        style={{
          position: 'absolute',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: isClose ? '#1a6b3c' : '#0f172a',
          color: 'white',
          borderRadius: '50px',
          padding: '14px 24px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
          cursor: 'pointer',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          fontFamily: "'Inter', sans-serif",
          border: '1px solid rgba(255,255,255,0.15)'
        }}
        onClick={onToggleMinimize}
      >
        <span className="material-symbols-outlined fs-5 animate-pulse" style={{ color: '#86efac' }}>
          {isClose ? 'check_circle' : 'navigation'}
        </span>
        <span style={{ fontWeight: 800, fontSize: '14.5px', letterSpacing: '-0.3px' }}>
          {isClose ? 'Đã đến nơi' : `${eta.value} ${eta.unit}`}
        </span>
        <span style={{ opacity: 0.4, fontSize: 14 }}>·</span>
        <span style={{ opacity: 0.8, fontSize: '13.5px', fontWeight: 600 }}>{formatDistance(distance)}</span>
        <span className="material-symbols-outlined" style={{ fontSize: 18, marginLeft: 4, color: 'rgba(255,255,255,0.6)' }}>expand_less</span>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        background: 'rgba(255, 255, 255, 0.90)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        boxShadow: '0 -10px 40px rgba(0,0,0,0.12)',
        padding: '18px 24px 28px',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Drag handle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }} onClick={onToggleMinimize}>
        <div
          style={{
            width: 44, height: 5,
            background: 'rgba(0,0,0,0.1)',
            borderRadius: 3,
            cursor: 'pointer',
          }}
        />
      </div>

      {/* ETA row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 44, fontWeight: 900, color: isClose ? '#1a6b3c' : '#0f172a', lineHeight: 1, letterSpacing: '-1.5px' }}>
              {isClose ? '0' : eta.value}
            </span>
            <span style={{ fontSize: 19, fontWeight: 700, color: isClose ? '#1a6b3c' : '#64748b' }}>
              {isClose ? 'm' : eta.unit}
            </span>
          </div>
          <div style={{ fontSize: '13.5px', color: '#64748b', marginTop: 6, fontWeight: 500 }}>
            {isClose ? '📍 Bạn đã ở trong phạm vi sân' : `🚗 ${formatDistance(distance)} · Đến ${destination}`}
          </div>
        </div>
        <button
          onClick={onCancel}
          style={{
            background: 'rgba(0,0,0,0.05)',
            border: 'none',
            borderRadius: 50,
            width: 44,
            height: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s'
          }}
        >
          <span className="material-symbols-outlined" style={{ color: '#0f172a', fontSize: '20px' }}>close</span>
        </button>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        {isClose ? (
          <button
            onClick={onCheckIn}
            style={{
              flex: 2,
              background: '#1a6b3c',
              color: 'white',
              border: 'none',
              borderRadius: 50,
              padding: '14px 0',
              fontWeight: 800,
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(26,107,60,0.3)',
            }}
          >
            <span className="material-symbols-outlined fs-5">check_circle</span>
            Check-in & Nhận điểm
          </button>
        ) : (
          <button
            onClick={onToggleMinimize}
            style={{
              flex: 2,
              background: '#1a6b3c',
              color: 'white',
              border: 'none',
              borderRadius: 50,
              padding: '14px 0',
              fontWeight: 800,
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(26,107,60,0.3)',
            }}
          >
            <span className="material-symbols-outlined fs-5">directions</span>
            Xem bản đồ
          </button>
        )}
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#ef4444',
            border: 'none',
            borderRadius: 50,
            padding: '14px 0',
            fontWeight: 800,
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <span className="material-symbols-outlined fs-5">close</span>
          {isClose ? 'Xong' : 'Hủy'}
        </button>
      </div>
    </div>
  );
};

export default NavigationPanel;

