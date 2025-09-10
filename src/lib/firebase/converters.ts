import { FirestoreDataConverter, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
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

// Generic helper for non-owner collections
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

// Specific converter for Proprietaire to retain ProprietaireID
export const proprietaireConverter: FirestoreDataConverter<Proprietaire> = {
  toFirestore(model: Proprietaire) {
    return {
      ProprietaireID: model.ProprietaireID,
      TypeProprietaire: model.TypeProprietaire,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Proprietaire {
    const data = snapshot.data();
    return {
      ProprietaireID: snapshot.id,
      TypeProprietaire: data.TypeProprietaire,
    };
  },
};

// Specific converter for ProprietairePhysique to retain ProprietaireID
export const proprietairePhysiqueConverter: FirestoreDataConverter<ProprietairePhysique> = {
  toFirestore(model: ProprietairePhysique) {
    return {
      ProprietaireID: model.ProprietaireID,
      NomProprietaire: model.NomProprietaire,
      PrenomProprietaire: model.PrenomProprietaire,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): ProprietairePhysique {
    const data = snapshot.data();
    return {
      ProprietaireID: snapshot.id,
      NomProprietaire: data.NomProprietaire,
      PrenomProprietaire: data.PrenomProprietaire,
    };
  },
};

// Specific converter for ProprietaireMorale to retain ProprietaireID
export const proprietaireMoraleConverter: FirestoreDataConverter<ProprietaireMorale> = {
  toFirestore(model: ProprietaireMorale) {
    return {
      ProprietaireID: model.ProprietaireID,
      NomEntreprise: model.NomEntreprise,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): ProprietaireMorale {
    const data = snapshot.data();
    return {
      ProprietaireID: snapshot.id,
      NomEntreprise: data.NomEntreprise,
    };
  },
};

// Other converters using generic helper
export const stationConverter = createConverter<Station>("StationID");
export const marqueConverter = createConverter<Marque>("MarqueID");
export const communeConverter = createConverter<Commune>("CommuneID");
export const provinceConverter = createConverter<Province>("ProvinceID");
export const gerantConverter = createConverter<Gerant>("GerantID");
export const autorisationConverter = createConverter<Autorisation>("AutorisationID");
export const capaciteConverter = createConverter<CapaciteStockage>("CapaciteID");
export const analyseConverter: FirestoreDataConverter<Analyse> = {
  toFirestore: (analyse: Analyse) => {
    return {
      ...analyse,
      DateAnalyse: analyse.DateAnalyse instanceof Date ? 
        Timestamp.fromDate(analyse.DateAnalyse) : 
        analyse.DateAnalyse
    };
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options
  ): Analyse => {
    const data = snapshot.data(options);
    return {
      ...data,
      DateAnalyse: data.DateAnalyse instanceof Timestamp ? 
        data.DateAnalyse.toDate() : 
        data.DateAnalyse
    } as Analyse;
  },
};