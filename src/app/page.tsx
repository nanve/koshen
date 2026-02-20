"use client";
import { useState, useEffect } from "react";

// ※ ここにデプロイしたGASのURLを貼ってください
const GAS_URL = "https://script.google.com/macros/s/AKfycbyo8ukzk1zhDT8846Q-16hFTZSsQ_qvRT6g8QSYgUWbdlYFgHHgWVLmYQngIeJLRY_D0A/exec";

export default function KoshenDemo() {
  const [markers, setMarkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. 地図データ（柱）を取得
  const fetchMarkers = async () => {
    const res = await fetch(GAS_URL);
    const data = await res.json();
    setMarkers(data);
  };

  useEffect(() => { fetchMarkers(); }, []);

  // 2. 「輝（かがやき）」を掲げる（GPS取得 & 送信）
  const handleKagayaki = () => {
    if (!navigator.geolocation) return alert("GPSが使えません");
    setLoading(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      
      await fetch(GAS_URL, {
        method: "POST",
        body: JSON.stringify({ lat: latitude, lng: longitude, name: "開拓地" }),
      });

      alert("輝を掲げました！");
      setLoading(false);
      fetchMarkers(); // 地図を更新
    });
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center p-4 font-sans">
      <header className="w-full text-center py-8">
        <h1 className="text-3xl font-bold text-orange-600 tracking-widest">越-縁巡り</h1>
        <p className="text-orange-400 text-sm">上越 聖地開拓プロトタイプ</p>
      </header>

      <main className="flex-1 w-full max-w-md flex flex-col gap-6">
        {/* メインボタン */}
        <button
          onClick={handleKagayaki}
          disabled={loading}
          className={`w-40 h-40 rounded-full border-8 border-orange-200 bg-orange-500 text-white font-bold text-2xl shadow-xl active:scale-95 transition-all mx-auto ${loading ? 'animate-pulse' : ''}`}
        >
          {loading ? "交信中..." : "輝"}
        </button>

        {/* 簡易地図（リスト形式で代用） */}
        <div className="bg-white rounded-2xl p-6 shadow-inner border border-orange-100">
          <h2 className="text-lg font-bold text-orange-800 mb-4 border-b border-orange-100 pb-2">現在の「光の柱」</h2>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {markers.length === 0 && <p className="text-gray-400 text-sm">まだ柱が立っていません。</p>}
            {markers.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-8 bg-orange-400 rounded-full animate-bounce" />
                <div>
                  <p className="font-bold text-gray-700 text-sm">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.lat.toFixed(4)}, {m.lng.toFixed(4)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="py-8 text-orange-300 text-xs">
        &copy; 2026 越-縁巡り部 / Pioneer Edition
      </footer>
    </div>
  );
}