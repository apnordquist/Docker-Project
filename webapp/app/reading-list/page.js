"use client";

import { useEffect, useState } from "react";
import AddButton from "../components/addbook";
import ReadingList from "../components/readinglist";
import { useUserAuth } from "../_utils/auth-context";
import {
  dbPostItem,
  dbGetItems,
  dbPutItem,
  dbDeleteItem,
} from "../_services/bookservice";

export default function Home() {
  const [bookList, setBookList] = useState([]);
  const { user, firebaseSignOut } = useUserAuth();

  const handleNewBook = (newItemObj) => {
    dbPostItem(newItemObj);
    dbGetItems(setBookList);
  };

  const handleUpdateBook = (existItemObj) => {
    dbPutItem(existItemObj);
  };

  const handleDeleteBook = (existItemObj) => {
    dbDeleteItem(existItemObj);
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
      dbGetItems(setBookList);
    }
  }, [user]);

  return (
    <main>
      <div className="flex flex-col w-full items-center">
        <div>
          <AddButton onAddFunc={handleNewBook} />
        </div>
        <div>
          <ReadingList
            bookList={bookList}
            updateFunc={handleUpdateBook}
            deleteFunc={handleDeleteBook}
          />
        </div>
      </div>
      <button
        type="button"
        className="text-lg rounded-3xl bg-red-600 text-slate-300 p-2 m-4 w-48 fixed bottom-4 right-4"
        onClick={HandleSignOut}
      >
        Sign Out
      </button>
    </main>
  );
}
