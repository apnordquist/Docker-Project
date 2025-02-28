import BookComp from "./book";

export default function ReadingList({ bookList, updateFunc }) {
  return (
    <ul>
      {bookList.map((book) => (
        <BookComp bookObj={book} onUpdateFunc={updateFunc} key={book.id} />
      ))}
    </ul>
  );
}
