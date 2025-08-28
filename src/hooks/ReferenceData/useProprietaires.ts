// src/hooks/ReferenceData/useProprietaires.ts
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { 
  Proprietaire, 
  ProprietairePhysique, 
  ProprietaireMorale 
} from '@/types/station';

const COLLECTIONS = {
  PROPRIETAIRES: 'proprietaires',
  PROPRIETAIRES_PHYSIQUES: 'proprietaires_physiques',
  PROPRIETAIRES_MORALES: 'proprietaires_morales',
};

export function useProprietaires() {
  const [proprietaires, setProprietaires] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProprietaires = async () => {
      try {
        const proprietairesSnapshot = await getDocs(
          query(collection(db, COLLECTIONS.PROPRIETAIRES), orderBy('TypeProprietaire'))
        );

        const proprietaireList = await Promise.all(
          proprietairesSnapshot.docs.map(async (proprietaireDoc) => {
            const proprietaire = { id: proprietaireDoc.id, ...proprietaireDoc.data() } as Proprietaire;
            
            let details: ProprietairePhysique | ProprietaireMorale | null = null;
            if (proprietaire.TypeProprietaire === 'Physique') {
              const detailsSnapshot = await getDocs(
                query(collection(db, COLLECTIONS.PROPRIETAIRES_PHYSIQUES),
                  where('ProprietaireID', '==', proprietaire.id))
              );
              if (!detailsSnapshot.empty) {
                details = { id: detailsSnapshot.docs[0].id, ...detailsSnapshot.docs[0].data() } as ProprietairePhysique;
              }
            } else {
              const detailsSnapshot = await getDocs(
                query(collection(db, COLLECTIONS.PROPRIETAIRES_MORALES),
                  where('ProprietaireID', '==', proprietaire.id))
              );
              if (!detailsSnapshot.empty) {
                details = { id: detailsSnapshot.docs[0].id, ...detailsSnapshot.docs[0].data() } as ProprietaireMorale;
              }
            }
            
            return { ...proprietaire, details };
          })
        );
        setProprietaires(proprietaireList);
      } catch (error) {
        console.error('Error fetching proprietaires:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProprietaires();
  }, []);

  return { proprietaires, loading };
}