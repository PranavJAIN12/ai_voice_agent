"use client";
import { api } from "@/convex/_generated/api";
import { useUser } from "@stackframe/stack";
import { useMutation } from "convex/react";
import React, { useEffect, useState } from "react";
import { UserContext } from "./_context/UserContext";

const AuthProvider = ({ children }) => {
  const user = useUser();
  const createUser = useMutation(api.users.createUser);
  const[userData, setUserData] = useState();

  const createNewUser = async () => {
    try {
      const result = await createUser({
        name: user?.displayName || "",
        email: user?.primaryEmail || "",
      });
      console.log("User created:", result);
      setUserData(result)
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  useEffect(() => {
    console.log("User from Stack:", user);
    if (user) {
      createNewUser();
    }
  }, [user]);

  return <div><UserContext.Provider value={{userData,setUserData}}>{children}</UserContext.Provider></div>; //using this we can use user data anywehere using user context
};

export default AuthProvider;
