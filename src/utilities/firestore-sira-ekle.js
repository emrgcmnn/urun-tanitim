import { db } from '../firebase'; // Firebase konfigürasyonunuzun olduğu dosya
import { collection, getDocs, updateDoc } from 'firebase/firestore';

const addSiraField = async () => {
  try {
    const arabalarRef = collection(db, 'arabalar');
    const snapshot = await getDocs(arabalarRef);
    
    snapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, { 
        sira: doc.data().sira || 0 
      });
      console.log(`✅ ${doc.id} güncellendi`);
    });
    
    console.log('Tüm arabalara sira alanı eklendi!');
  } catch (error) {
    console.error('Hata:', error);
  }
};

addSiraField();