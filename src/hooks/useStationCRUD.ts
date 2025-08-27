'use client';

import { useCallback } from 'react';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { formDataToFirestore } from '@/lib/utils/stationTransformers';
import { GasStationFormData } from '@/types/station';

const COLLECTION = 'gasStations';

export function useStationCRUD() {
  const createStation = useCallback(async (form: GasStationFormData) => {
    const payload = formDataToFirestore(form);
    await addDoc(collection(db, COLLECTION), payload);
  }, []);

  const updateStation = useCallback(async (id: string, form: GasStationFormData) => {
    const payload = formDataToFirestore(form);
    await updateDoc(doc(db, COLLECTION, id), payload);
  }, []);

  const deleteStation = useCallback(async (id: string) => {
    await deleteDoc(doc(db, COLLECTION, id));
  }, []);

  return { createStation, updateStation, deleteStation };
}