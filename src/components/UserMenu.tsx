import React, { useEffect, useState } from "react";
import { supabaseClient } from "../db/supabase.client";
import type { User } from "@supabase/supabase-js";
import { Button } from "./ui/button";
import { LogOut, User as UserIcon } from "lucide-react";

export const UserMenu: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          setUser(null);
        } else {
          setUser(session?.user || null);
        }
      } catch (error) {
        console.error("Error in checkSession:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      
      // Sign out from Supabase
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        return;
      }

      // Clear localStorage
      localStorage.clear();
      
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });

      // Force page reload to clear all state
      window.location.href = "/";
      
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <a
          href="/login"
          className="text-sm text-foreground hover:text-primary transition-colors"
        >
          Zaloguj się
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <UserIcon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {user.email}
        </span>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        disabled={isLoading}
        className="flex items-center space-x-2"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Wyloguj</span>
      </Button>
    </div>
  );
};
