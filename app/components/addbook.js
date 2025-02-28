"use client";

import { useState } from "react";

export default function AddButton({ onAddFunc }) {
  const [id, setId] = useState(Math.random() * 1000);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("fiction");
  const [pages, setPages] = useState(1);
  const [current, setCurrent] = useState(false);
  const [pagesRead, setRead] = useState(0);
  const [completed, setComplete] = useState(false);

  const handleTitleChange = (event) => setTitle(event.target.value);
  const handleAuthorChange = (event) => setAuthor(event.target.value);
  const handlePageChange = (event) => setPages(event.target.value);
  const handleGenreChange = (event) => setGenre(event.target.value);
  const handleSubmit = (event) => {
    event.preventDefault();

    let newBook = {
      id: id,
      title: title,
      author: author,
      genre: genre,
      pagesRead: pagesRead,
      pages: pages,
      current: current,
      completed: completed,
    };

    onAddFunc(newBook);

    setId(Math.random() * 1000);
    setTitle("");
    setAuthor("");
    setGenre("fiction");
    setPages(1);
    setCurrent(false);
    setRead(0);
    setComplete(false);
  };

  return (
    <form className="w-fit p-2 m-4 bg-teal-950 rounded-md">
      <div className="flex flex-wrap">
        <div className="w-96">
          <div className="mx-4 my-9">
            <input
              type="text"
              onChange={handleTitleChange}
              value={title}
              placeholder="Title"
              className="w-full p-4 rounded-md bg-stone-50 text-indigo-950"
              required
            />
          </div>
          <div className="mx-4 my-9">
            <input
              type="text"
              onChange={handleAuthorChange}
              value={author}
              placeholder="Author"
              className="w-full p-4 rounded-md bg-stone-50 text-indigo-950"
              required
            />
          </div>
        </div>
        <div className="w-96">
          <div className="m-4">
            <label>Genre:</label>
            <select
              onChange={handleGenreChange}
              value={genre}
              className="p-4 rounded-md bg-stone-50 text-indigo-950 w-full"
            >
              <option value="fiction">Fiction</option>
              <option value="nonfiction">Non-Fiction</option>
              <option value="poetry">Poetry</option>
              <option value="drama">Drama</option>
              <option value="graphic">Graphic Novels</option>
              <option value="humour">Humour</option>
              <option value="other">other</option>
            </select>
          </div>
          <div className="m-4">
            <label># of Pages:</label>
            <input
              type="number"
              onChange={handlePageChange}
              value={pages}
              placeholder="Pages"
              className="w-full p-4 rounded-md bg-stone-50 text-indigo-950"
              required
            />
          </div>
        </div>
      </div>
      <div className="w-48 h-14 m-4 bg-sky-400 text-white text-center rounded-md hover:bg-sky-600 disabled:bg-stone-300">
        <button className="w-full h-full" type="submit" onClick={handleSubmit}>
          Add to list
        </button>
      </div>
    </form>
  );
}
