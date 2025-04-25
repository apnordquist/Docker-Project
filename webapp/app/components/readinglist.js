import BookComp from "./book";

export default function ReadingList({ bookList, updateFunc, deleteFunc }) {
  return (
    <div className="flex flex-wrap">
      {bookList.map((book) => (
        <BookComp
          bookObj={book}
          onUpdateFunc={updateFunc}
          key={book.id}
          onDeleteFunc={deleteFunc}
        />
      ))}
    </div>
  );
}
