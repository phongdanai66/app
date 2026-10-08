import {
  collection,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { getMatches } from "./api";

// ⏱️ กันยิง API ถี่ (10 นาที)
const CACHE_TIME = 10 * 60 * 1000;

let lastFetch = 0;

// โหลดจาก Firebase
export const loadMatchesFromDB = async () => {
  const snapshot = await getDocs(collection(db, "matches"));

  return snapshot.docs
    .map((snapshotDoc) => ({
      id: snapshotDoc.id,
      ...snapshotDoc.data(),
    }))
    .sort((a, b) => {
      const getGroup = (match) => {
        if (match.status === "FINISHED") return 0;
        if (["IN_PLAY", "PAUSED", "LIVE"].includes(match.status)) return 1;
        return 2;
      };
      const groupDiff = getGroup(a) - getGroup(b);

      if (groupDiff !== 0) {
        return groupDiff;
      }

      const aTime = Date.parse(a.utcDate || 0);
      const bTime = Date.parse(b.utcDate || 0);

      if (getGroup(a) === 2) {
        return aTime - bTime;
      }

      return bTime - aTime;
    });
};

// ดึง API แล้วเซฟ
export const fetchAndSaveMatches = async (options = {}) => {
  const { competitionCode = "PL", force = false } = options;
  const now = Date.now();

  // ❗ กันยิง API ถี่
  if (!force && now - lastFetch < CACHE_TIME) {
    console.log("⏳ ใช้ cache ไม่เรียก API");
    return { usedCache: true, savedCount: 0, matches: [] };
  }

  try {
    console.log("🌐 Fetch API...");

    const matches = await getMatches(competitionCode);

    for (const match of matches) {
      await setDoc(doc(db, "matches", String(match.id)), match, { merge: true });
    }

    lastFetch = now;
    return {
      usedCache: false,
      savedCount: matches.length,
      matches,
    };
  } catch (error) {
    console.log("API error:", error);
    return {
      usedCache: false,
      savedCount: 0,
      matches: [],
      error,
    };
  }
};

// โหลด + sync (ใช้ในหน้า)
export const loadAndSyncMatches = async () => {
  // โหลดก่อน
  let data = await loadMatchesFromDB();

  // ยิง API แล้วอัปเดต
  await fetchAndSaveMatches();

  // โหลดใหม่หลังอัปเดต
  data = await loadMatchesFromDB();

  return data;
};
