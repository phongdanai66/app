import { collection, deleteField, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { getStandings } from "./api";

const CACHE_TIME = 10 * 60 * 1000;

let lastFetch = 0;

export const loadStandingsFromDB = async () => {
  const snapshot = await getDocs(collection(db, "standings"));

  return snapshot.docs
    .map((snapshotDoc) => ({
      id: snapshotDoc.id,
      ...snapshotDoc.data(),
    }))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
};

export const fetchAndSaveStandings = async (options = {}) => {
  const { competitionCode = "PL", force = false } = options;
  const now = Date.now();

  if (!force && now - lastFetch < CACHE_TIME) {
    return { usedCache: true, savedCount: 0, standings: [] };
  }

  try {
    const standings = await getStandings(competitionCode);

    for (const standing of standings) {
      await setDoc(doc(db, "standings", String(standing.id)), {
        ...standing,
        form: deleteField(),
      }, {
        merge: true,
      });
    }

    lastFetch = now;

    return {
      usedCache: false,
      savedCount: standings.length,
      standings,
    };
  } catch (error) {
    console.log("Standings sync error:", error);
    return {
      usedCache: false,
      savedCount: 0,
      standings: [],
      error,
    };
  }
};

export const loadAndSyncStandings = async (options = {}) => {
  await fetchAndSaveStandings(options);
  return loadStandingsFromDB();
};
