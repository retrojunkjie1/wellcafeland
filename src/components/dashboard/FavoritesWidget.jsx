// src/components/dashboard/FavoritesWidget.jsx
// Favorites/pinned practices widget

import React, { useState, useEffect } from "react";
import { Heart, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { listFavorites, removeFavorite } from "@/services/favoritesService";
import { useOSStore } from "@/stores/useOSStore";

const FavoritesWidget = () => {
  const navigate = useNavigate();
  const { openWorkspace } = useOSStore();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await listFavorites();
      setFavorites(data);
    } catch (err) {
      console.error("Failed to load favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteClick = (favorite) => {
    if (favorite.type === "tool") {
      const toolKey = favorite.ref?.toolKey || favorite.id;
      openWorkspace("tool", favorite.label, { toolType: toolKey });
      navigate(`/workspace/${toolKey}`);
    } else if (favorite.type === "directory_resource") {
      const { domain, id } = favorite.ref || {};
      if (domain && id) {
        navigate(`/resources/${encodeURIComponent(id)}`);
      }
    } else {
      // Default: open in chat
      navigate("/chat");
    }
  };

  const handleRemoveFavorite = async (e, favoriteId) => {
    e.stopPropagation();
    try {
      await removeFavorite(favoriteId);
      await loadFavorites();
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-wcGold" />
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-5 w-5 text-white/40" />
          <h3 className="text-sm font-medium text-white">Go-To Practices</h3>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">
          You can pin any practice you want to return to easily.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-wcGold" />
        <h3 className="text-sm font-medium text-white">Go-To Practices</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {favorites.slice(0, 4).map((favorite) => (
          <button
            key={favorite.id}
            type="button"
            onClick={() => handleFavoriteClick(favorite)}
            className="relative group rounded-lg border border-white/10 bg-white/5 p-3 text-left hover:bg-white/10 transition"
            aria-label={`Open ${favorite.label}`}
          >
            <button
              type="button"
              onClick={(e) => handleRemoveFavorite(e, favorite.id)}
              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 rounded p-1 text-white/40 hover:text-white hover:bg-white/10 transition"
              aria-label={`Remove ${favorite.label} from favorites`}
            >
              <X className="h-3 w-3" />
            </button>
            <p className="text-xs font-medium text-white pr-6">{favorite.label}</p>
            {favorite.usageCount > 1 && (
              <p className="text-[10px] text-white/40 mt-1">
                Used {favorite.usageCount} times
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FavoritesWidget;

