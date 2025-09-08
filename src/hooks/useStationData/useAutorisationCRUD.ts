import { useCallback, useEffect, useState } from "react";
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Autorisation } from "@/types/station";
import { autorisationConverter } from "@/lib/firebase/converters";

const COLLECTION = "autorisations";

export function useAutorisationCRUD() {
  const [autorisations, setAutorisations] = useState<Autorisation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAutorisations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await getDocs(
        collection(db, COLLECTION).withConverter(autorisationConverter)
      );
      setAutorisations(snapshot.docs.map((d) => d.data()));
    } catch (err: any) {
      setError(`Failed to fetch autorisations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAutorisations();
  }, [fetchAutorisations]);

  const createAutorisation = useCallback(
    async (data: Omit<Autorisation, "AutorisationID">) => {
      setLoading(true);
      try {
        await addDoc(collection(db, COLLECTION).withConverter(autorisationConverter), data);
        await fetchAutorisations();
      } catch (err: any) {
        setError(`Failed to create autorisation: ${err.message}`);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAutorisations]
  );

  const updateAutorisation = useCallback(
    async (id: string, data: Partial<Autorisation>) => {
      setLoading(true);
      try {
        await updateDoc(doc(db, COLLECTION, id).withConverter(autorisationConverter), data);
        await fetchAutorisations();
      } catch (err: any) {
        setError(`Failed to update autorisation: ${err.message}`);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAutorisations]
  );

  const deleteAutorisation = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await deleteDoc(doc(db, COLLECTION, id).withConverter(autorisationConverter));
        await fetchAutorisations();
      } catch (err: any) {
        setError(`Failed to delete autorisation: ${err.message}`);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAutorisations]
  );

  return { autorisations, loading, error, createAutorisation, updateAutorisation, deleteAutorisation };
}