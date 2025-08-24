import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

function Dashboard() {
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Get the current session
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting session:", sessionError);
          return;
        }

        const user = sessionData?.session?.user;

        if (!user) {
          console.warn("No active session found. Please log in.");
          return;
        }

        // Fetch user profile from "users" table
        const { data, error: profileError } = await supabase
          .from("users")
          .select("first_name")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
        } else {
          setFirstName(data.first_name);
        }
      } catch (err) {
        console.error("Unexpected error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  return (
    <div>
      <h1>Hi {firstName || "Guest"}</h1>
      <h1>Dashboard</h1>
    </div>
  );
}

export default Dashboard;
