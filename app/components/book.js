"use client";

import { useState } from "react";

export default function BookComp({ bookObj, onUpdateFunc }) {
  let { id, title, author, pagesRead, pages } = bookObj;
  const [latestPage, setLatest] = useState({ pagesRead });
  const handleSubmit = (event) => {
    event.preventDefault();
    onUpdateFunc(bookObj, latestPage);
  };
  const handlePageChange = (event) => setLatest(event.target.value);
  return (
    <li className="flex flex-col w-96 p-2 m-4 bg-teal-950 rounded-md">
      <h3 className="p-2 text-teal-950 bg-slate-50 rounded-md">{title}</h3>
      <h2 className="p-2 ">by {author}</h2>
      <div className="flex flex-row gap-3">
        <input
          type="number"
          onChange={handlePageChange}
          value={latestPage}
          placeholder={pagesRead}
          className="p-4 rounded-md bg-stone-50 text-indigo-950"
          required
        />
        <p className="p-4">of {pages}</p>
      </div>
      <div className="w-48 h-14 m-4 bg-sky-400 text-white text-center rounded-md hover:bg-sky-600 disabled:bg-stone-300">
        <button className="w-full h-full" type="submit" onClick={handleSubmit}>
          update
        </button>
      </div>
    </li>
  );
}
