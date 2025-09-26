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
  Analyse,
} from "@/types/station";

export function createConverter<T extends { [key: string]: any }>(idField: string): FirestoreDataConverter<T> {
  return {
    toFirestore(model: T) {
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
        analyse.DateAnalyse,
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options): Analyse => {
    const data = snapshot.data(options);
    
    // Better date conversion with more robust handling
    let dateAnalyse: Date | null = null;
    
    if (data.DateAnalyse instanceof Timestamp) {
      dateAnalyse = data.DateAnalyse.toDate();
    } else if (data.DateAnalyse instanceof Date && !isNaN(data.DateAnalyse.getTime())) {
      dateAnalyse = data.DateAnalyse;
    } else if (typeof data.DateAnalyse === 'string' && data.DateAnalyse) {
      const parsed = new Date(data.DateAnalyse);
      if (!isNaN(parsed.getTime())) {
        dateAnalyse = parsed;
      }
    } else if (data.DateAnalyse === null || data.DateAnalyse === undefined) {
      dateAnalyse = null;
    } else {
      console.warn(`Invalid DateAnalyse format in document ${snapshot.id}:`, data.DateAnalyse);
      dateAnalyse = null;
    }
    
    return {
      ...data,
      AnalyseID: snapshot.id,
      DateAnalyse: dateAnalyse,
    } as Analyse;
  },
};