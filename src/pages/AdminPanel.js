// src/pages/AdminPanel.js
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import "../styles/AdminPanel.css";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [isim, setIsim] = useState("");
  const [ozellikler, setOzellikler] = useState("");
  const [fiyat, setFiyat] = useState("");
  const [fotoURL, setFotoURL] = useState("");
  const [arabalar, setArabalar] = useState([]);
  const [duzenlenenId, setDuzenlenenId] = useState(null);
  const arabalarRef = collection(db, "arabalar");

  // Eksik fonksiyon: Çıkış Yap
  const cikisYap = async () => {
    await auth.signOut();
    navigate("/admin");
  };

  // Auth kontrol
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) navigate("/admin");
    });
    return unsubscribe;
  }, [navigate]);

  // Verileri çek ve sırala
  const arabalarıYenile = async () => {
    const snapshot = await getDocs(arabalarRef);
    const sortedCars = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => a.sira - b.sira);
    setArabalar(sortedCars);
  };

  useEffect(() => {
    arabalarıYenile();
  }, []);

  // Drag & Drop Handler
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(arabalar);
    const [movedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, movedItem);

    // Firestore'u güncelle
    const batchUpdates = items.map((araba, index) => 
      updateDoc(doc(db, "arabalar", araba.id), { sira: index })
    );
    await Promise.all(batchUpdates);
    arabalarıYenile();
  };

  // Araba Ekle/Güncelle
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
          fotoURL,
          sira: arabalar.length // Yeni eklenenler için sıra numarası
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

  // Araba Sil
  const arabaSil = async (id) => {
    if (window.confirm("Silmek istediğinize emin misiniz?")) {
      await deleteDoc(doc(db, "arabalar", id));
      arabalarıYenile();
    }
  };

  // Araba Düzenle
  const arabaDuzenle = (araba) => {
    setIsim(araba.isim);
    setOzellikler(araba.ozellikler);
    setFiyat(araba.fiyat.toString());
    setFotoURL(araba.fotoURL);
    setDuzenlenenId(araba.id);
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
  
          {/* Sağ Taraf - Sürükle Bırak Listesi */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="arabalar">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="admin-list-section"
                >
                  <h3>Arabalar ({arabalar.length})</h3>
                  {arabalar.map((araba, index) => (
                    <Draggable 
                      key={araba.id} 
                      draggableId={araba.id} 
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="araba-item-admin"
                        >
                          <div {...provided.dragHandleProps} className="drag-handle">
                            ☰
                          </div>
                          <img src={araba.fotoURL} alt={araba.isim} />
                          <div className="araba-info">
                            <h4>{araba.isim}</h4>
                            <div className="araba-actions">
                              <button onClick={() => arabaDuzenle(araba)}>Düzenle</button>
                              <button onClick={() => arabaSil(araba.id)}>Sil</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    );
  };
  
  export default AdminPanel;