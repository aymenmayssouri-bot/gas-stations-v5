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

// Helper to generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Generic converter that stores ID as a field in the document
export function createConverter<T extends { [key: string]: any }>(idField: string): FirestoreDataConverter<T> {
  return {
    toFirestore(model: T) {
      // Include the ID field in the stored document
      return { ...model };
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      const data = snapshot.data();
      // Read ID from the field, not from document ID
      return {
        ...data,
        [idField]: data[idField] || snapshot.id, // Fallback to document ID if field doesn't exist
      } as T;
    },
  };
}

export const proprietaireConverter: FirestoreDataConverter<Proprietaire> = {
  toFirestore(model: Proprietaire) {
    // Store ProprietaireID as a field
    return {
      ProprietaireID: model.ProprietaireID,
      TypeProprietaire: model.TypeProprietaire,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Proprietaire {
    const data = snapshot.data();
    return {
      ProprietaireID: data.ProprietaireID || snapshot.id,
      TypeProprietaire: data.TypeProprietaire,
    };
  },
};

export const proprietairePhysiqueConverter: FirestoreDataConverter<ProprietairePhysique> = {
  toFirestore(model: ProprietairePhysique) {
    // Store ProprietaireID as a field since it references the proprietaires collection
    return {
      ProprietaireID: model.ProprietaireID,
      NomProprietaire: model.NomProprietaire,
      PrenomProprietaire: model.PrenomProprietaire,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): ProprietairePhysique {
    const data = snapshot.data();
    return {
      ProprietaireID: data.ProprietaireID, // Read from field, not document ID
      NomProprietaire: data.NomProprietaire,
      PrenomProprietaire: data.PrenomProprietaire,
    };
  },
};

export const proprietaireMoraleConverter: FirestoreDataConverter<ProprietaireMorale> = {
  toFirestore(model: ProprietaireMorale) {
    // Store ProprietaireID as a field since it references the proprietaires collection
    return {
      ProprietaireID: model.ProprietaireID,
      NomEntreprise: model.NomEntreprise,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): ProprietaireMorale {
    const data = snapshot.data();
    return {
      ProprietaireID: data.ProprietaireID, // Read from field, not document ID
      NomEntreprise: data.NomEntreprise,
    };
  },
};

// Special converter for Station that generates UUID if not provided
export const stationConverter: FirestoreDataConverter<Station> = {
  toFirestore(model: Station) {
    return {
      ...model,
      StationID: model.StationID || generateUUID(),
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Station {
    const data = snapshot.data();
    return {
      ...data,
      StationID: data.StationID || snapshot.id,
    } as Station;
  },
};

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
      AnalyseID: analyse.AnalyseID,
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
      AnalyseID: data.AnalyseID || snapshot.id,
      DateAnalyse: dateAnalyse,
    } as Analyse;
  },
};