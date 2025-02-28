import { db } from "../_utils/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  query,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

// GET
export async function dbGetItems(userId, itemStateSetter) {
  try {
    const allItems = collection(db, "users", userId, "items");
    const allItemsQuery = query(allItems);
    const querySnapshot = await getDocs(allItemsQuery);
    let itemArray = [];
    querySnapshot.forEach((docSnap) => {
      let item = {
        id: docSnap.id,
        ...docSnap.data(),
      };
      itemArray.push(item);
    });
    itemStateSetter(itemArray);
  } catch (error) {
    console.log(error);
  }
}
// POST
export async function dbPostItem(userId, itemObj) {
  try {
    const newItemReference = collection(db, "users", userId, "items");
    const newItemPromise = await addDoc(newItemReference, itemObj);
    console.log(newItemPromise.id);
  } catch (error) {
    console.log(error);
  }
}
// Update
export async function dbPutItem(userId, itemObj, latestPage) {
  try {
    console.log(typeof latestPage);
    const updateReference = doc(db, "users", userId, "items", itemObj);
    const updatePromise = await updateDoc(updateReference, {
      pagesRead: pageNumber,
    });
    console.log(updatePromise.id);
  } catch (error) {
    console.log(error);
  }
}
// DELETE
export async function dbDeleteItem(userId, itemObj) {
  try {
    const deleteItemReference = collection(db, "users", userId, "items");
    const deleteItemPromise = await deleteDoc(deleteItemReference, itemObj);
    console.log(deleteItemPromise.id);
  } catch (error) {
    console.log(error);
  }
}
