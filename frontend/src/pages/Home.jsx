import React, { useContext } from 'react';
import AuthCon from '../context/AuthPro';

export default function Home() {
  const { auth, user, matches } = useContext(AuthCon);

  return (
    <div className='container mt-5'>
      {auth && user && matches &&
        <div>
          <p>Email: {user.email}</p>
          <p>Id: {user._id}</p>
          <p>Photo Path: {user.photoPath}</p>
          {<p>Dismatch between faces: {matches}</p>}
        </div>
      }

    </div>
  );
}
