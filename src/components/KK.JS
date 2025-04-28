import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "../styles/AdminPanel.css";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';;

const AdminPanel = () => {
  const navigate = useNavigate();
  const [isim, setIsim] = useState("");
  const [ozellikler, setOzellikler] = useState("");
  const [fiyat, setFiyat] = useState("");
  const [fotoURL, setFotoURL] = useState("");
  const [arabalar, setArabalar] = useState([]);
  const [duzenlenenId, setDuzenlenenId] = useState(null);
  const arabalarRef = collection(db, "arabalar");

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(arabalar);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Sıralamayı güncelle
    const batchUpdates = items.map((araba, index) => {
      return updateDoc(doc(db, "arabalar", araba.id), {
        sira: index
      });
    });

    await Promise.all(batchUpdates);
    arabalarıYenile();
  };
  // Oturum kontrolü
  useEffect(() => {
    const authControl = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/admin");
      }
    });
    return () => authControl();
  }, [navigate]);

  // Veri çekme
  useEffect(() => {
    const arabalarıYenile = async () => {
      try {
        const snapshot = await getDocs(arabalarRef);
        const arabaListesi = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setArabalar(arabaListesi);
      } catch (error) {
        console.error("Veri çekme hatası:", error);
      }
    };
    arabalarıYenile();
  }, []);

  const arabaEkle = async (e) => {
    e.preventDefault();
    try {
      if (duzenlenenId) {
        await updateDoc(doc(db, "arabalar", duzenlenenId), {
          isim,
          ozellikler,
          fiyat: Number(fiyat),
          fotoURL
        });
      } else {
        await addDoc(arabalarRef, {
          isim,
          ozellikler,
          fiyat: Number(fiyat),
          fotoURL
        });
      }
      setIsim("");
      setOzellikler("");
      setFiyat("");
      setFotoURL("");
      setDuzenlenenId(null);
      arabalarıYenile();
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const arabalarıYenile = async () => {
    const snapshot = await getDocs(arabalarRef);
    const arabaListesi = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => a.sira - b.sira); // Sıralama burada yapılıyor
    setArabalar(arabaListesi);
  };
  

  const arabaSil = async (id) => {
    if (window.confirm("Silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(db, "arabalar", id));
      arabalarıYenile();
    }
  };

  const arabaDuzenle = (araba) => {
    setIsim(araba.isim);
    setOzellikler(araba.ozellikler);
    setFiyat(araba.fiyat.toString());
    setFotoURL(araba.fotoURL);
    setDuzenlenenId(araba.id);
  };

  const cikisYap = async () => {
    await auth.signOut();
    navigate("/admin");
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Paneli</h2>
        <button onClick={cikisYap} className="cikis-btn">Çıkış Yap</button>
      </div>

      <div className="admin-panel-layout">
        {/* Sol Taraf - Form */}
        <div className="admin-form-section">
          <h3>{duzenlenenId ? "Araba Düzenle" : "Yeni Araba Ekle"}</h3>
          <form onSubmit={arabaEkle}>
            <div className="form-group">
              <label>Araba İsmi</label>
              <input
                type="text"
                value={isim}
                onChange={(e) => setIsim(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Özellikler</label>
              <textarea
                value={ozellikler}
                onChange={(e) => setOzellikler(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Fiyat (₺)</label>
              <input
                type="number"
                value={fiyat}
                onChange={(e) => setFiyat(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Fotoğraf URL</label>
              <input
                type="text"
                value={fotoURL}
                onChange={(e) => setFotoURL(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="submit-btn">
              {duzenlenenId ? "Güncelle" : "Kaydet"}
            </button>
          </form>
        </div>

        {/* Sağ Taraf - Liste */}
        <div className="admin-list-section">
          <h3>Mevcut Arabalar ({arabalar.length})</h3>
          <div className="araba-listesi-admin">
            {arabalar.map((araba) => (
              <div key={araba.id} className="araba-item-admin">
                <img 
                  src={araba.fotoURL || "https://via.placeholder.com/80x60"} 
                  alt={araba.isim} 
                />
                <div className="araba-info">
                  <h4>{araba.isim}</h4>
                  <div className="araba-actions">
                    <button 
                      onClick={() => arabaDuzenle(araba)}
                      className="edit-btn"
                    >
                      Düzenle
                    </button>
                    <button 
                      onClick={() => arabaSil(araba.id)}
                      className="delete-btn"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;