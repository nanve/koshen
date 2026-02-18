"use client";

import React, { useState } from 'react';

export default function HonouForm() {
  const [loading, setLoading] = useState(false);
  const GAS_URL = "https://script.google.com/macros/s/AKfycbwTFGEBTppH_o_DvXk94PjxARXBozOyGQBfhoFx7vhJ-fH8AwCKWfZc8cXSNz7XbOxeKA/exec";

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      // 1. 画像の圧縮処理 (Canvasを使用)
      const compressedBase64 = await compressImage(file);

      // 2. 送信データの作成
      const payload = {
        userId: "USER_001", // テスト用ID
        shrineName: "居多神社",
        message: "上越の縁に感謝します。",
        imageData: compressedBase64, // 圧縮済みBase64
        points: 10 // 付与ポイント
      };

      // 3. GASへPOST送信
      const response = await fetch(GAS_URL, {
        method: "POST",
        mode: "no-cors", // GASの仕様上、no-corsが必要な場合があります
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      alert("奉納が完了し、徳（Kosh eN）が積まれました！");
    } catch (error) {
      console.error("奉納エラー:", error);
      alert("通信に失敗しました。電波の良い場所で再度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  // 画像圧縮関数 (長辺1200px / 品質0.7)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxSide = 1200;

          if (width > height && width > maxSide) {
            height *= maxSide / width;
            width = maxSide;
          } else if (height > maxSide) {
            width *= maxSide / height;
            height = maxSide;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // Base64で返却
        };
      };
    });
  };

  return (
    <div className="flex flex-col items-center">
      <label className="cursor-pointer bg-[#b22d35] text-white px-8 py-4 rounded-full font-bold shadow-lg">
        {loading ? "徳を積んでいます..." : "写真を撮って奉納する"}
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          onChange={handleFileUpload}
          disabled={loading}
        />
      </label>
    </div>
  );
}