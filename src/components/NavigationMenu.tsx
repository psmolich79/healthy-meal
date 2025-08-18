import React, { useEffect, useState } from "react";
import { supabaseClient } from "../db/supabase.client";
import type { User } from "@supabase/supabase-js";

export const NavigationMenu: React.FC = () => {
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

  if (isLoading) {
    return null; // Don't show navigation while loading
  }

  // If user is not logged in, don't show navigation items
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation Links */}
      <div className="hidden md:flex md:items-center md:space-x-8">
        <a href="/recipes/generate" className="text-foreground hover:text-primary transition-colors">
          Generuj przepis
        </a>
        <a href="/recipes" className="text-foreground hover:text-primary transition-colors">
          Moje przepisy
        </a>
        <a href="/profile" className="text-foreground hover:text-primary transition-colors">
          Profil
        </a>
        <a href="/ai-usage" className="text-foreground hover:text-primary transition-colors">
          Statystyki AI
        </a>
      </div>

      {/* Mobile Navigation Links */}
      <div className="md:hidden">
        <div className="flex justify-around items-center h-16 px-4">
          <a
            href="/recipes/generate"
            className="flex flex-col items-center text-xs text-foreground hover:text-primary transition-colors"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <span>Generuj</span>
          </a>

          <a
            href="/recipes"
            className="flex flex-col items-center text-xs text-foreground hover:text-primary transition-colors"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
            <span>Przepisy</span>
          </a>

          <a
            href="/profile"
            className="flex flex-col items-center text-xs text-foreground hover:text-primary transition-colors"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span>Profil</span>
          </a>
        </div>
      </div>
    </>
  );
};
