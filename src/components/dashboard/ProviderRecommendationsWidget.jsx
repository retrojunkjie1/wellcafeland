// src/components/dashboard/ProviderRecommendationsWidget.jsx
// Widget to display provider recommendations

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, DollarSign, Briefcase, Users, UserCheck } from "lucide-react";
// import { getClientRecommendations } from "@/services/providerService"; // TODO: Implement if needed
import { useSessionIdentity } from "@/hooks/useSessionIdentity";

const ProviderRecommendationsWidget = () => {
  const navigate = useNavigate();
  const { userId } = useSessionIdentity();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadRecommendations = async () => {
      try {
        // TODO: Implement getClientRecommendations service
        // const recs = await getClientRecommendations(userId);
        setRecommendations([]);
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [userId]);

  if (loading) {
    return null;
  }

  if (recommendations.length === 0) {
    return null;
  }

  const getIcon = (type) => {
    switch (type) {
      case "housing":
        return <Home className="h-4 w-4" />;
      case "funding":
        return <DollarSign className="h-4 w-4" />;
      case "program":
        return <Briefcase className="h-4 w-4" />;
      case "circle":
        return <Users className="h-4 w-4" />;
      default:
        return <UserCheck className="h-4 w-4" />;
    }
  };

  const handleClick = (rec) => {
    if (rec.type === "circle") {
      navigate("/circles");
    } else {
      navigate(`/assistance?priority=${rec.type}`);
    }
  };

  return (
    <div className="lux-card p-6 border border-white/10 bg-white/5">
      <div className="flex items-center gap-3 mb-4">
        <UserCheck className="h-5 w-5 text-white/70" />
        <h2 className="text-lg font-medium text-white">Provider Recommendations</h2>
      </div>
      <div className="space-y-2">
        {recommendations.slice(0, 5).map((rec) => (
          <button
            key={rec.id}
            onClick={() => handleClick(rec)}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition text-left"
          >
            {getIcon(rec.type)}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white">{rec.itemName}</div>
              {rec.notes && (
                <div className="text-xs text-white/50 mt-1 line-clamp-1">{rec.notes}</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProviderRecommendationsWidget;

