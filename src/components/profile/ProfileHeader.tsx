import React from "react";
import { User, Calendar } from "lucide-react";
import { CardHeader } from "@/components/ui/card";
import type { ProfileDto } from "@/types";

interface ProfileHeaderProps {
  userProfile?: ProfileDto | null;
  className?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userProfile, className = "" }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <CardHeader className={className}>
      <div className="text-center space-y-4">
        {/* Avatar */}
        <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-10 w-10 text-primary" />
        </div>

        {/* Title and Description */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Twój Profil</h1>
          <p className="text-muted-foreground">
            Ustaw swoje preferencje żywieniowe, aby otrzymywać spersonalizowane przepisy
          </p>
        </div>

        {/* Profile Info */}
        {userProfile && (
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Utworzono {formatDate(userProfile.created_at)}</span>
            </div>
            {userProfile.updated_at !== userProfile.created_at && (
              <div className="flex items-center space-x-1">
                <span>•</span>
                <span>Zaktualizowano {formatDate(userProfile.updated_at)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </CardHeader>
  );
};
