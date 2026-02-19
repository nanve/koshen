"use client";

import { useState, useEffect } from 'react';

// あなたのGASのURL
const GAS_URL = "https://script.google.com/macros/s/AKfycby5j25A1FL2Wn0SkZrPxdtawvHsqtbyvKKSWwfc5Bz_aktkZS5C0wDy5HFmePzr4hf9/exec";

export default function KoshenApp() {
  const [status, setStatus] = useState("境内の本殿近くでボタンを押してください");
  const [history, setHistory] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('shrine_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const attemptCheckIn = () => {
    setStatus("位置情報を確認中...");
    if (!navigator.geolocation) {
      setStatus("GPSが使えないブラウザです");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      try {
        const response = await fetch(`${GAS_URL}?lat=${lat}&lng=${lng}&action=checkin`);
        const result = await response.json();
        if (result.success && result.candidates.length > 0) {
          if (result.candidates.length === 1) {
            processCheckIn(result.candidates[0]);
          } else {
            setCandidates(result.candidates);
            setIsModalOpen(true);
          }
          setStatus("聖地が見つかりました");
        } else {
          setStatus("登録エリア外です。");
        }
      } catch (e) {
        setStatus("通信エラーが発生しました");
      }
    }, (err) => {
      setStatus("位置情報を許可してください");
    }, { enableHighAccuracy: true, timeout: 10000 });
  };

  const processCheckIn = (shrine: any) => {
    const messages = ["良い縁が結ばれました", "開拓の時です", "神秘的な力が宿っています", "一歩前へ進みましょう", "心安らかな日々が続きます"];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;
    
    const newVisit = { 
      shrineName: shrine.shrineName, 
      iconUrl: shrine.iconUrl || "https://47siteseeing.com/wp-content/uploads/2026/01/default-icon.png", 
      message: randomMsg, 
      date: dateStr 
    };

    const newHistory = [newVisit, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('shrine_history', JSON.stringify(newHistory));
    setIsModalOpen(false);
    setStatus(`【参拝成功】${shrine.shrineName}`);
  };

  return (
    <div style={{ maxWidth: '450px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* メインカード */}
      <div style={{ backgroundColor: '#fff', borderRadius: '20px', padding: '24px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #eee', marginBottom: '24px' }}>
        <h3 style={{ color: '#2d5a27', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px' }}>聖地巡礼チェックイン</h3>
        <button 
          onClick={attemptCheckIn}
          style={{ 
            width: '100%', padding: '16px', background: 'linear-gradient(135deg, #ff5722 0%, #d84315 100%)', 
            color: '#fff', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,87,34,0.3)'
          }}
        >
          今ここにいることを報告する
        </button>
        <p style={{ marginTop: '16px', fontSize: '0.8rem', color: '#666' }}>{status}</p>
      </div>

      {/* 履歴セクション */}
      <div style={{ marginTop: '32px' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', borderLeft: '5px solid #ff5722', paddingLeft: '12px', marginBottom: '20px' }}>参拝ご縁帳</div>
        {history.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#aaa', padding: '40px 0' }}>まだ参拝記録がありません。</p>
        ) : (
          history.map((item: any, idx: number) => (
            <div key={idx} style={{ backgroundColor: '#fff', borderRadius: '15px', padding: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <img src={item.iconUrl} style={{ width: '60px', height: '60px', borderRadius: '50%', marginRight: '16px', border: '2px solid #eee' }} alt="icon" />
              <div style={{ flexGrow: 1 }}>
                <span style={{ display: 'block', fontWeight: 'bold', color: '#1a73e8', textDecoration: 'underline' }}>{item.shrineName}</span>
                <span style={{ display: 'block', fontSize: '0.7rem', color: '#999', marginTop: '2px' }}>{item.date} 参拝</span>
                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#444', backgroundColor: '#fff9f0', padding: '8px', borderRadius: '8px', borderLeft: '3px solid #ffd180' }}>
                  「{item.message}」
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 選択モーダル */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#fffaf0', padding: '30px', borderRadius: '20px', width: '100%', maxWidth: '300px', textAlign: 'center', border: '2px solid #ffd180' }}>
            <h4 style={{ color: '#d84315', fontWeight: 'bold', marginBottom: '16px' }}>参拝されましたか？</h4>
            {candidates.map((c: any, i: number) => (
              <button key={i} onClick={() => processCheckIn(c)} style={{ width: '100%', padding: '12px', marginBottom: '10px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer' }}>
                {c.shrineName}
              </button>
            ))}
            <button onClick={() => setIsModalOpen(false)} style={{ marginTop: '16px', color: '#666', fontSize: '0.9rem', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>キャンセル</button>
          </div>
        </div>
      )}
    </div>
  );
}