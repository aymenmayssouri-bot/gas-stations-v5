import { FirestoreDataConverter, QueryDocumentSnapshot } from "firebase/firestore";
import { 
  Station, 
  Marque, 
  Commune, 
  Province, 
  Gerant, 
  Proprietaire,
  ProprietairePhysique,
  ProprietaireMorale,
  Autorisation,
  CapaciteStockage,
  Analyse
} from "@/types/station";

// Generic helper
export function createConverter<T extends { [key: string]: any }>(idField: string): FirestoreDataConverter<T> {
  return {
    toFirestore(model: T) {
      // Remove the ID field when writing to Firestore
      const { [idField]: _, ...data } = model;
      return data;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      return {
        ...snapshot.data(),
        [idField]: snapshot.id,
      } as T;
    },
  };
}

// Specific converters
export const stationConverter = createConverter<Station>("StationID");
export const marqueConverter = createConverter<Marque>("MarqueID");
export const communeConverter = createConverter<Commune>("CommuneID");
export const provinceConverter = createConverter<Province>("ProvinceID");
export const gerantConverter = createConverter<Gerant>("GerantID");
export const proprietaireConverter = createConverter<Proprietaire>("ProprietaireID");
export const proprietairePhysiqueConverter = createConverter<ProprietairePhysique>("ProprietaireID");
export const proprietaireMoraleConverter = createConverter<ProprietaireMorale>("ProprietaireID");
export const autorisationConverter = createConverter<Autorisation>("AutorisationID");
export const capaciteConverter = createConverter<CapaciteStockage>("CapaciteID");
export const analyseConverter = createConverter<Analyse>("AnalyseID");