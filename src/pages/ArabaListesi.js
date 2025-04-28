// src/pages/ArabaListesi.js
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "../styles/ArabaListesi.css";
const ArabaListesi = () => {
  const [arabalar, setArabalar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const arabalarRef = collection(db, "arabalar");

  // ArabaListesi.js ve AdminPanel.js'deki verileri çekme kısmını güncelleyin
  useEffect(() => {
    const verileriCek = async () => {
      const snapshot = await getDocs(arabalarRef);
      const arabaListesi = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.sira - b.sira); // Sıralamayı burada yap
      setArabalar(arabaListesi);
      setYukleniyor(false);
    };

    verileriCek();
  }, []);

  return (
    <div className="araba-container">
      <h2>Arabalar</h2>

      {yukleniyor ? (
        <p>Yükleniyor...</p>
      ) : (
        <div className="araba-grid">
          {arabalar.map((araba) => (
            <div key={araba.id} className="araba-card">
              <img
                src={araba.fotoURL || "https://via.placeholder.com/200x120?text=No+Image"}
                alt={araba.isim}
              />
              <h3>{araba.isim}</h3>
              <p className="araba-ozellikler">{araba.ozellikler}</p>
              <p><strong>{araba.fiyat} ₺</strong></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArabaListesi;
