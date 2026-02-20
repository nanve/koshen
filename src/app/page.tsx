"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// ★ 地図コンポーネント：PC/スマホの両方で「ページスクロール」を邪魔しない設定
const MapView = dynamic(
  () => import("react-leaflet").then((mod) => {
    const { MapContainer, TileLayer, Marker, Popup } = mod;
    const L = require("leaflet");
    const shiningIcon = L.divIcon({
      className: "custom-icon",
      html: `<div style="
        width: 15px; height: 15px; background-color: #f97316; 
        border: 2px solid white; border-radius: 50%; 
        box-shadow: 0 0 10px #f97316, 0 0 20px #fb923c;
      "></div>`,
      iconSize: [15, 15],
      iconAnchor: [7, 7],
    });

    return function MapComponent({ markers }: { markers: any[] }) {
      return (
        <MapContainer 
          center={[37.1479, 138.2363]} 
          zoom={11} 
          style={{ height: "100%", width: "100%" }}
          // 指一本でのスクロールを許可し、地図ズームは慎重に行う設定
          scrollWheelZoom={false}
          dragging={!L.Browser.mobile} // スマホでは指二本操作を促し、スクロールを優先
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {markers.map((m, i) => (
            <Marker key={i} position={[m.lat, m.lng]} icon={shiningIcon}>
              <Popup>
                <div className="font-bold text-orange-600">【{m.name}】</div>
                <div className="text-xs text-gray-500">高度: {m.alt ? Math.round(m.alt) : "--"} m</div>
                <div className="text-[10px] text-gray-400">{new Date(m.time).toLocaleString()}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      );
    };
  }),
  { ssr: false, loading: () => <div className="h-full w-full bg-orange-50 flex items-center justify-center text-orange-400">地図を召喚中...</div> }
);

const GAS_URL = "https://script.google.com/macros/s/AKfycbxHmdw2RgGyZcaUH8iPfy9CVQrqAe-N-IwpZUkN6VnafwrYrgxAxoHigDmeqlvZeJHEfQ/exec";

export default function KoshenProject() {
  const [markers, setMarkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMarkers = async () => {
    try {
      const res = await fetch(GAS_URL);
      const data = await res.json();
      setMarkers(data);
    } catch (e) { console.error("データ取得失敗", e); }
  };

  useEffect(() => { fetchMarkers(); }, []);

  const handleKagayaki = () => {
    if (!navigator.geolocation) return alert("GPSが使えません");
    setLoading(true);

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude, altitude } = pos.coords;
      try {
        await fetch(GAS_URL, {
          method: "POST",
          body: JSON.stringify({ 
            lat: latitude, 
            lng: longitude, 
            alt: altitude, 
            name: "新規開拓地" 
          }),
        });
        fetchMarkers();
      } catch (e) { alert("記録に失敗しました"); }
      finally { setLoading(false); }
    }, (err) => {
      alert("位置情報の取得に失敗しました");
      setLoading(false);
    }, { enableHighAccuracy: true });
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center font-sans p-4 pb-20">
      <header className="py-8 text-center shrink-0">
        <h1 className="text-4xl font-black text-orange-600 tracking-tighter">越-縁巡り</h1>
        <p className="text-orange-400 text-sm mt-1 font-bold">上越 聖地開拓記録</p>
      </header>
      
      {/* 輝ボタン：参拝を最優先に配置 */}
      <button 
        onClick={handleKagayaki} 
        disabled={loading}
        className={`
          mb-10 w-32 h-32 rounded-full bg-orange-500 text-white font-black text-3xl 
          shadow-[0_10px_40px_rgba(249,115,22,0.4)] 
          active:scale-95 transition-all flex items-center justify-center border-4 border-white
          ${loading ? 'animate-pulse opacity-50' : ''}
        `}
      >
        {loading ? "..." : "輝"}
      </button>

      {/* 地図エリア：PCで見やすく、スマホでスクロールを邪魔しないサイズ */}
      <div className="w-full max-w-2xl h-[450px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-white relative shrink-0">
        <MapView markers={markers} />
      </div>

      <footer className="mt-12 flex flex-col items-center space-y-4">
        <div className="px-6 py-2 bg-white rounded-full shadow-md text-orange-600 font-bold text-sm border border-orange-100">
          現在開拓された「輝」: {markers.length} 柱
        </div>
        <p className="text-orange-200 text-[10px] tracking-widest">© Koshen Project - Sacred Site Spirit Card</p>
      </footer>
    </div>
  );
}