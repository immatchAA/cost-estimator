import React, {useEffect, useState} from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

function ProtectedRouteTeacher ({children}) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

     useEffect(() => {
    const checkUserRole = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      // Fetch user from users table
      const { data, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userError || !data) {
        setAuthorized(false);
      } else {
        setAuthorized(data.role === "teacher");
      }

      setLoading(false);
    };

    checkUserRole();
  }, []);

  if (loading) return <p>Loading...</p>;

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRouteTeacher;