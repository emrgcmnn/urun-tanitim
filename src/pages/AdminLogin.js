// src/pages/AdminLogin.js
import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/AdminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Firebase Authentication ile giriş yapıyoruz
      // AdminLogin.js'deki handleLogin fonksiyonu
await signInWithEmailAndPassword(auth, email, sifre);
if (auth.currentUser) { // Giriş başarılıysa
  navigate("/admin-panel");
}
    } // AdminLogin.js'deki catch bloğunu güncelleyin
    catch (error) {
      console.error("Giriş Hatası:", error); // Konsolda hatayı görüntüle
      const errorMessages = {
        'auth/wrong-password': 'Yanlış şifre!',
        'auth/user-not-found': 'Bu e-posta ile kayıtlı kullanıcı yok.',
        'auth/invalid-email': 'Geçersiz e-posta formatı!',
        'auth/too-many-requests': 'Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin.'
      };
      setError(errorMessages[error.code] || "Beklenmeyen bir hata oluştu");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Admin Giriş</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            required
          />
          <button type="submit">Giriş Yap</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default AdminLogin;
