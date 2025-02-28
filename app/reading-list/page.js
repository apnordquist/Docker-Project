"use client";

import { useEffect, useState } from "react";
import AddButton from "../components/addbook";
import ReadingList from "../components/readinglist";
import { useUserAuth } from "../_utils/auth-context";
import { dbPostItem, dbGetItems, dbPutItem } from "../_services/bookservice";

export default function Home() {
  const [bookList, setBookList] = useState([]);
  const { user, firebaseSignOut } = useUserAuth();

  const handleNewBook = (newItemObj) => {
    dbPostItem(user.uid, newItemObj);
    setBookList([...bookList, newItemObj]);
  };

  const handleUpdateBook = (existItemObj, latestPage) => {
    dbPutItem(user.uid, existItemObj, latestPage);
  };

  async function HandleSignOut() {
    try {
      await firebaseSignOut();
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (user) {
      dbGetItems(user.uid, setBookList);
    }
  }, [user]);

  return (
    <main>
      <AddButton onAddFunc={handleNewBook} />
      <ReadingList bookList={bookList} updateFunc={handleUpdateBook} />
      <button
        type="button"
        className="text-lg rounded bg-red-600 text-slate-300 p-2 m-4"
        onClick={HandleSignOut}
      >
        Sign Out
      </button>
    </main>
  );
}
