// @pca:start
// @id(frontend.hooks.useSocialEngagement)
// @kind(hook)
// @limit(lines: 220)
// @contract(useSocialEngagement(targetKey, initialCounts?))
// @desc(Hook transversal de reacciones, guardados y comentarios sincronizado en localStorage)
// @pca:end
import { useCallback, useEffect, useState } from "react";

export interface SocialComment {
  id: string;
  autor: string;
  verificado?: boolean;
  texto: string;
  fecha: string;
  rating?: number;
  likes: number;
  likedByMe?: boolean;
  esPropio?: boolean;
}

interface TargetSocialRecord {
  liked: boolean;
  saved: boolean;
  baseLikes: number;
  baseSaves: number;
  comments: SocialComment[];
}

type SocialStoreMap = Record<string, TargetSocialRecord>;

const STORAGE_KEY = "pasteleria_social_engagement_v1";
const SYNC_EVENT = "cremeco:social-updated";

const SEED_COMMENTS: Record<string, SocialComment[]> = {
  "blog:secretos-del-bizcocho-esponjoso": [
    { id: "seed-b1-1", autor: "Valentina Rojas", verificado: true, texto: "¡Probé el truco de sacar los huevos y la mantequilla 1 hora antes y el bizcocho subió parejo por primera vez! Se nota la mano pastelera.", fecha: "2026-10-14", likes: 6 },
    { id: "seed-b1-2", autor: "Cristóbal Muñoz", texto: "El paso de alternar secos con movimientos envolventes cambia totalmente la miga. Excelente guía.", fecha: "2026-10-18", likes: 3 },
  ],
  "blog:como-conservar-tortas-frescas": [
    { id: "seed-b2-1", autor: "Camila Silva", verificado: true, texto: "Súper útil saber que hay que sacar la torta de chantilly 30 minutos antes de servir, queda mucho más cremosa.", fecha: "2026-09-25", likes: 5 },
  ],
  "blog:detras-de-nuestras-tartaletas": [
    { id: "seed-b3-1", autor: "Fernanda Lagos", verificado: true, texto: "Las tartaletas de frutos rojos de los miércoles son mis favoritas de Providencia, la masa sablée siempre está crocante.", fecha: "2026-09-12", likes: 8 },
  ],
  "blog:ideas-para-tortas-personalizadas": [
    { id: "seed-b4-1", autor: "Javiera Pizarro", texto: "Pedimos nuestra torta de aniversario con flores prensadas siguiendo este estilo minimalista y quedó soñada.", fecha: "2026-08-30", likes: 4 },
  ],
};

function hashBaseCount(key: string, multiplier: number, offset: number): number {
  let acc = 0;
  for (let i = 0; i < key.length; i += 1) acc = (acc + key.charCodeAt(i) * (i + 1)) % 19;
  return acc + offset + multiplier;
}

function getDefaultComments(targetKey: string): SocialComment[] {
  if (SEED_COMMENTS[targetKey]) return SEED_COMMENTS[targetKey];
  if (targetKey.startsWith("product:")) {
    return [
      { id: `seed-${targetKey}-1`, autor: "Camila Silva", verificado: true, texto: "Frescura increíble y dulzor en su punto justo. Se nota que usan ingredientes 100% naturales.", fecha: "2026-10-20", rating: 5, likes: 4 },
      { id: `seed-${targetKey}-2`, autor: "Andrés Fuentes", verificado: true, texto: "Presentación impecable para celebrar en familia, llegó en perfectas condiciones con cadena de frío.", fecha: "2026-10-11", rating: 5, likes: 2 },
    ];
  }
  return [];
}

function readStore(): SocialStoreMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SocialStoreMap) : {};
  } catch {
    return {};
  }
}

function writeStore(store: SocialStoreMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch { /* ignore */ }
}

function ensureTargetRecord(
  store: SocialStoreMap,
  targetKey: string,
  initialCounts?: { likes?: number; saves?: number }
): TargetSocialRecord {
  if (store[targetKey]) return store[targetKey];
  return {
    liked: false,
    saved: false,
    baseLikes: initialCounts?.likes ?? hashBaseCount(targetKey, 3, 7),
    baseSaves: initialCounts?.saves ?? hashBaseCount(targetKey, 1, 2),
    comments: getDefaultComments(targetKey),
  };
}

export function useSocialEngagement(
  targetKey: string,
  initialCounts?: { likes?: number; saves?: number }
) {
  const [record, setRecord] = useState<TargetSocialRecord>(() =>
    ensureTargetRecord(readStore(), targetKey, initialCounts)
  );

  const syncFromStorage = useCallback(() => {
    setRecord(ensureTargetRecord(readStore(), targetKey, initialCounts));
  }, [targetKey, initialCounts?.likes, initialCounts?.saves]);

  useEffect(() => {
    syncFromStorage();
    window.addEventListener(SYNC_EVENT, syncFromStorage);
    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener(SYNC_EVENT, syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, [syncFromStorage]);

  const updateRecord = useCallback(
    (updater: (current: TargetSocialRecord) => TargetSocialRecord) => {
      const store = readStore();
      const next = updater(ensureTargetRecord(store, targetKey, initialCounts));
      store[targetKey] = next;
      setRecord(next);
      writeStore(store);
    },
    [targetKey, initialCounts]
  );

  const toggleLike = useCallback(() => updateRecord((c) => ({ ...c, liked: !c.liked })), [updateRecord]);
  const toggleSave = useCallback(() => updateRecord((c) => ({ ...c, saved: !c.saved })), [updateRecord]);

  const addComment = useCallback(
    (input: { autor: string; texto: string; rating?: number; verificado?: boolean }) => {
      const textoLimpio = input.texto.trim();
      if (textoLimpio.length < 3) return false;
      const nuevo: SocialComment = {
        id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        autor: input.autor.trim() || "Cliente Crème & Co",
        verificado: input.verificado,
        texto: textoLimpio,
        fecha: new Date().toISOString().split("T")[0],
        rating: input.rating,
        likes: 0,
        likedByMe: false,
        esPropio: true,
      };
      updateRecord((curr) => ({ ...curr, comments: [nuevo, ...curr.comments] }));
      return true;
    },
    [updateRecord]
  );

  const toggleCommentLike = useCallback(
    (commentId: string) => {
      updateRecord((curr) => ({
        ...curr,
        comments: curr.comments.map((c) =>
          c.id === commentId
            ? { ...c, likedByMe: !c.likedByMe, likes: c.likedByMe ? Math.max(0, c.likes - 1) : c.likes + 1 }
            : c
        ),
      }));
    },
    [updateRecord]
  );

  const deleteComment = useCallback(
    (commentId: string) => {
      updateRecord((curr) => ({ ...curr, comments: curr.comments.filter((c) => c.id !== commentId) }));
    },
    [updateRecord]
  );

  const rated = record.comments.filter((c) => typeof c.rating === "number");
  const averageRating =
    rated.length > 0
      ? Number((rated.reduce((sum, item) => sum + (item.rating ?? 5), 0) / rated.length).toFixed(1))
      : 5.0;

  return {
    liked: record.liked,
    saved: record.saved,
    likesCount: record.baseLikes + (record.liked ? 1 : 0),
    savesCount: record.baseSaves + (record.saved ? 1 : 0),
    comments: record.comments,
    commentsCount: record.comments.length,
    averageRating,
    toggleLike,
    toggleSave,
    addComment,
    toggleCommentLike,
    deleteComment,
  };
}
