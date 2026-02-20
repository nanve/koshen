"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// ★ 地図コンポーネント
const MapView = dynamic(
  () => import("react-leaflet").then((mod) => {
    const { MapContainer, TileLayer, Marker, Popup } = mod;
    const L = require("leaflet");
    const shiningIcon = L.divIcon({
      className: "custom-icon",
      html: `<div style="width: 15px; height: 15px; background-color: #f97316; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px #f97316, 0 0 20px #fb923c;"></div>`,
      iconSize: [15, 15],
      iconAnchor: [7, 7],
    });

    return function MapComponent({ markers }: { markers: any[] }) {
      return (
        <MapContainer center={[37.1479, 138.2363]} zoom={11} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false} dragging={!L.Browser.mobile}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {markers.map((m, i) => (
            <Marker key={i} position={[m.lat, m.lng]} icon={shiningIcon}>
              <Popup>
                <div className="font-bold text-orange-600">【{m.name}】</div>
                <div className="text-xs text-gray-500">高度: {m.alt ? Math.round(m.alt) : "--"} m</div>
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
  const [currentSite, setCurrentSite] = useState<string | null>(null);

  const fetchMarkers = async () => {
    try {
      const res = await fetch(GAS_URL);
      const data = await res.json();
      // 新しい順に並び替えて保存
      const sortedData = data.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setMarkers(sortedData);
    } catch (e) { console.error("データ取得失敗", e); }
  };

  useEffect(() => {
    fetchMarkers();
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        const nearby = markers.find(m => {
          const dist = Math.sqrt(Math.pow(m.lat - latitude, 2) + Math.pow(m.lng - longitude, 2));
          return dist < 0.0005; // 約50m以内
        });
        setCurrentSite(nearby ? nearby.name : null);
      });
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [markers.length]);

  const handleKagayaki = () => {
    if (!navigator.geolocation) return alert("GPSが使えません");
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude, altitude } = pos.coords;
      try {
        await fetch(GAS_URL, {
          method: "POST",
          body: JSON.stringify({ lat: latitude, lng: longitude, alt: altitude, name: currentSite || "新規開拓地" }),
        });
        await fetchMarkers();
      } catch (e) { alert("記録に失敗しました"); }
      finally { setLoading(false); }
    }, (err) => { setLoading(false); }, { enableHighAccuracy: true });
  };

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center font-sans p-4 pb-20">
      <header className="py-8 text-center shrink-0">
        <h1 className="text-4xl font-black text-orange-600 tracking-tighter italic">越-縁めぐり</h1>
        <p className="text-orange-400 text-sm mt-1 font-bold tracking-widest">越-縁巡り 聖地に輝きを</p>
      </header>
      
      {/* 操作エリア */}
      <div className="flex flex-col items-center mb-10 w-full max-w-md bg-white p-6 rounded-[2.5rem] shadow-xl border-2 border-orange-100">
        <p className="text-orange-600 text-[20px] font-bold mb-4 tracking-widest uppercase">聖地巡礼チェックイン</p>
        
        <button 
          onClick={handleKagayaki} 
          disabled={loading}
          className={`w-32 h-32 rounded-full bg-orange-500 text-white font-black text-3xl shadow-[0_10px_40px_rgba(249,115,22,0.4)] active:scale-95 transition-all flex items-center justify-center border-4 border-white ${loading ? 'animate-pulse opacity-50' : ''}`}
        >
          {loading ? "..." : "輝"}
        </button>
        
        <p className="text-gray-400 text-[20px] mt-6 font-medium">
          本殿の近くで <span className="text-orange-500 font-bold">輝</span> ボタンを<br>押してください</br>
        </p>
      </div>

      {/* 地図エリア */}
      <div className="w-full max-w-2xl h-[400px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-white relative shrink-0">
        <MapView markers={markers} />
      </div>

      {/* 参拝状況・履歴エリア */}
      <div className="w-full max-w-2xl mt-8 space-y-6">
        <section>
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
            <h2 className="text-lg font-bold text-gray-700">参拝記録：</h2>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white flex items-center justify-center min-h-[60px] shadow-sm">
            {currentSite ? (
              <p className="text-orange-600 font-black tracking-wider text-lg animate-pulse">【{currentSite}】に参拝中</p>
            ) : (
              <p className="text-gray-400 text-xs">周囲に登録済みの聖地はありません。新しい「輝」を掲げましょう。</p>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-1 h-4 bg-orange-300 rounded-full"></div>
            <h2 className="text-lg font-bold text-gray-700">これまでの輝き：</h2>
          </div>
          <div className="space-y-3">
            {markers.length > 0 ? (
              markers.map((m, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-orange-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{m.name}</h3>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(m.time).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-orange-400 bg-orange-50 px-2 py-1 rounded-full">
                      高度: {Math.round(m.alt)}m
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-300 py-10 text-xs italic">まだアーカイブされた輝きはありません。</p>
            )}
          </div>
        </section>
      </div>

      <footer className="mt-16 flex flex-col items-center space-y-4">
        <div className="px-6 py-2 bg-white rounded-full shadow-md text-orange-600 font-bold text-[10px] border border-orange-100 uppercase tracking-[0.2em]">
          総開拓数: {markers.length} 柱
        </div>
        <p className="text-orange-200 text-[9px] tracking-[0.3em]">© 47SITESEEING - KOSH-EN PROJECT</p>
      </footer>
    </div>
  );
}