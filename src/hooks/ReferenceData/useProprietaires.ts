'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, onSnapshot, orderBy, where, getDocs, FirestoreError } from 'firebase/firestore';
import { Proprietaire, ProprietairePhysique, ProprietaireMorale } from '@/types/station';

const COLLECTIONS = {
  PROPRIETAIRES: 'proprietaires',
  PROPRIETAIRES_PHYSIQUES: 'proprietaires_physiques',
  PROPRIETAIRES_MORALES: 'proprietaires_morales',
};

export function useProprietaires() {
  const [proprietaires, setProprietaires] = useState<(Proprietaire & { details: ProprietairePhysique | ProprietaireMorale | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.PROPRIETAIRES), orderBy('TypeProprietaire'));
    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const proprietaireList = await Promise.all(
            snapshot.docs.map(async (proprietaireDoc) => {
              const proprietaireData = proprietaireDoc.data();
              const proprietaire: Proprietaire = {
                ProprietaireID: proprietaireDoc.id,
                TypeProprietaire: proprietaireData.TypeProprietaire || 'Physique',
              };
              let details: ProprietairePhysique | ProprietaireMorale | null = null;

              if (proprietaire.TypeProprietaire === 'Physique') {
                const detailsSnapshot = await getDocs(
                  query(collection(db, COLLECTIONS.PROPRIETAIRES_PHYSIQUES), where('ProprietaireID', '==', proprietaire.ProprietaireID))
                );
                if (!detailsSnapshot.empty) {
                  const detailsData = detailsSnapshot.docs[0].data();
                  // Validate required fields for ProprietairePhysique
                  if ('ProprietaireID' in detailsData && 'NomProprietaire' in detailsData && 'PrenomProprietaire' in detailsData) {
                    details = {
                      id: detailsSnapshot.docs[0].id,
                      ProprietaireID: detailsData.ProprietaireID,
                      NomProprietaire: detailsData.NomProprietaire || '',
                      PrenomProprietaire: detailsData.PrenomProprietaire || '',
                    } as ProprietairePhysique;
                  } else {
                    console.warn(`Invalid ProprietairePhysique data for ID ${proprietaire.ProprietaireID}:`, detailsData);
                  }
                }
              } else if (proprietaire.TypeProprietaire === 'Morale') {
                const detailsSnapshot = await getDocs(
                  query(collection(db, COLLECTIONS.PROPRIETAIRES_MORALES), where('ProprietaireID', '==', proprietaire.ProprietaireID))
                );
                if (!detailsSnapshot.empty) {
                  const detailsData = detailsSnapshot.docs[0].data();
                  // Validate required fields for ProprietaireMorale
                  if ('ProprietaireID' in detailsData && 'NomEntreprise' in detailsData) {
                    details = {
                      id: detailsSnapshot.docs[0].id,
                      ProprietaireID: detailsData.ProprietaireID,
                      NomEntreprise: detailsData.NomEntreprise || '',
                    } as ProprietaireMorale;
                  } else {
                    console.warn(`Invalid ProprietaireMorale data for ID ${proprietaire.ProprietaireID}:`, detailsData);
                  }
                }
              }

              return { ...proprietaire, details };
            })
          );
          setProprietaires(proprietaireList);
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error('Error processing proprietaires:', err);
          setError(err instanceof Error ? err.message : 'Unknown error processing proprietaires');
          setLoading(false);
        }
      },
      (err: FirestoreError) => {
        console.error('Firestore error:', err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { proprietaires, loading, error };
}