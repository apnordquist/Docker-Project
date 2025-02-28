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
      {user ? (
        <div>
          <div>
            <img className="w-20 h-20 rounded-full m-2" src={user.photoURL} />
          </div>
          <div>
            <p className="text-lg m-2">Welcome {user.displayName}!</p>
          </div>
          <div>
            <Link href="/reading-list/" className="text-lg m-2">
              Go to reading list.
            </Link>
          </div>
          <div>
            <button
              type="button"
              className="text-lg rounded bg-red-600 text-slate-300 p-2 m-4"
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
            className="text-lg rounded bg-green-600 text-slate-300 p-2 m-4"
            onClick={HandleSignIn}
          >
            Sign In
          </button>
        </div>
      )}
    </main>
  );
}
