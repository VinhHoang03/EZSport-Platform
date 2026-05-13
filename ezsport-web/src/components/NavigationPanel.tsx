import React, { useState } from 'react';

interface NavigationPanelProps {
  destination: string;
  distance: number;
  time: number;
  onCancel: () => void;
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
  isMinimized,
  onToggleMinimize,
}) => {
  const eta = formatTime(time);

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
          background: '#1a73e8',
          color: 'white',
          borderRadius: '50px',
          padding: '12px 20px',
          boxShadow: '0 4px 20px rgba(26,115,232,0.4)',
          cursor: 'pointer',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
        onClick={onToggleMinimize}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>navigation</span>
        <span style={{ fontWeight: 700, fontSize: 16 }}>
          {eta.value} {eta.unit}
        </span>
        <span style={{ opacity: 0.8, fontSize: 14 }}>·</span>
        <span style={{ opacity: 0.8, fontSize: 14 }}>{formatDistance(distance)}</span>
        <span className="material-symbols-outlined" style={{ fontSize: 18, marginLeft: 4 }}>expand_less</span>
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
        background: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        boxShadow: '0 -4px 30px rgba(0,0,0,0.15)',
        padding: '16px 20px 28px',
      }}
    >
      {/* Drag handle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <div
          style={{
            width: 40, height: 4,
            background: '#e0e0e0',
            borderRadius: 2,
            cursor: 'pointer',
          }}
          onClick={onToggleMinimize}
        />
      </div>

      {/* ETA row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 40, fontWeight: 800, color: '#1a73e8', lineHeight: 1 }}>
              {eta.value}
            </span>
            <span style={{ fontSize: 20, fontWeight: 600, color: '#1a73e8' }}>{eta.unit}</span>
          </div>
          <div style={{ fontSize: 14, color: '#666', marginTop: 2 }}>
            {formatDistance(distance)} · Đến {destination}
          </div>
        </div>
        <button
          onClick={onCancel}
          style={{
            background: '#f5f5f5',
            border: 'none',
            borderRadius: 50,
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined" style={{ color: '#333' }}>close</span>
        </button>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button
          onClick={onToggleMinimize}
          style={{
            flex: 1,
            background: '#1a73e8',
            color: 'white',
            border: 'none',
            borderRadius: 50,
            padding: '12px 0',
            fontWeight: 700,
            fontSize: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-outlined">directions</span>
          Xem bản đồ
        </button>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            background: '#fee2e2',
            color: '#dc2626',
            border: 'none',
            borderRadius: 50,
            padding: '12px 0',
            fontWeight: 700,
            fontSize: 15,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
          }}
        >
          <span className="material-symbols-outlined">close</span>
          Hủy điều hướng
        </button>
      </div>
    </div>
  );
};

export default NavigationPanel;
