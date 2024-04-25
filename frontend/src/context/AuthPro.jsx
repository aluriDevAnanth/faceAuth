import React, { createContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const AuthCon = createContext({});

export function AuthPro({ children }) {
  const [auth, setAuth] = useState(Cookies.get("token"));
  const [user, setUser] = useState(null);
  const [matches, setMatches] = useState(localStorage.getItem('dis'));

  async function fetchUser() {
    try {
      const response = await fetch('http://localhost:3000/api/auth', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth}`,
        },
      });
      const res = await response.json();
      //console.log(res);
      setUser(res.data.user)
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }

  useEffect(() => {
    if (auth !== undefined) {
      fetchUser();
    }
  }, [auth]);

  return (
    <AuthCon.Provider value={{ auth, setAuth, user, setUser, matches, setMatches }}>{children}</AuthCon.Provider>
  );
}

export default AuthCon;
