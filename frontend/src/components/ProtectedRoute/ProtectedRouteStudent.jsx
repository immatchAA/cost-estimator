import React, {useEffect, useState} from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";

function ProtectedRouteStudent ({children}){
    const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      setAuthorized(data?.role === "student");
      setLoading(false);
    };

    checkUserRole();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!authorized) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRouteStudent;