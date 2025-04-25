"use client";

import Link from "next/link";
import { useUserAuth } from "./_utils/auth-context";

export default function SignInPage() {
  const { user, googleSignIn, firebaseSignOut } = useUserAuth();

  async function HandleSignIn() {
    try {
      await googleSignIn();
    } catch (error) {
      console.log(error);
    }
  }

  async function HandleSignOut() {
    try {
      await firebaseSignOut();
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <main>
      <div className="w-72 p-5 mx-auto my-10 bg-teal-950 rounded-md">
        {user ? (
          <div className="flex flex-col justify-center items-center">
            <div>
              <img className="w-75 h-75 rounded-full m-4" src={user.photoURL} />
            </div>
            <div>
              <p className="text-lg m-4">Welcome {user.displayName}!</p>
            </div>
            <div>
              <Link
                href="/reading-list/"
                className="text-lg rounded bg-sky-400 text-white p-2 m-4 inline-block w-64 text-center"
              >
                Go to Reading List
              </Link>
            </div>
            <div>
              <button
                type="button"
                className="text-lg rounded bg-red-600 text-slate-300 p-2 m-4 w-64"
                onClick={HandleSignOut}
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div>
            <button
              type="button"
              className="text-lg rounded bg-green-600 text-slate-300 p-2 m-8"
              onClick={HandleSignIn}
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
