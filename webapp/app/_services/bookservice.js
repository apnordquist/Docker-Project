import { auth } from "../_utils/firebase";

// GET
export async function dbGetItems(itemStateSetter) {
  try {
    // Get the current user's ID token
    const token = await auth.currentUser?.getIdToken();

    if (!token) {
      throw new Error("User not authenticated");
    }
    fetch("http://localhost:8080/get-books", {
      method: "GET",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("failed to fetch books");
        }
        return response.json();
      })
      .then((data) => {
        itemStateSetter(data);
      })
      .catch((error) => {
        console.error("Error fetching books:", error);
      });
  } catch (error) {
    console.log(error);
  }
}
// POST
export async function dbPostItem(itemObj) {
  try {
    // Get the current user's ID token
    const token = await auth.currentUser?.getIdToken();

    if (!token) {
      throw new Error("User not authenticated");
    }
    fetch("http://localhost:8080/post-book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(itemObj),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add book");
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          console.log("Server response", data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } catch (error) {
    console.log(error);
  }
}
// UPDATE
export async function dbPutItem(itemObj) {
  try {
    // Get the current user's ID token
    const token = await auth.currentUser?.getIdToken();

    if (!token) {
      throw new Error("User not authenticated");
    }
    fetch("http://localhost:8080/put-book", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(itemObj),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update book");
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          console.log("Server response", data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } catch (error) {
    console.log(error);
  }
}
// DELETE
export async function dbDeleteItem(itemObj) {
  try {
    // Get the current user's ID token
    const token = await auth.currentUser?.getIdToken();

    if (!token) {
      throw new Error("User not authenticated");
    }
    fetch("http://localhost:8080/delete-book", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(itemObj),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete book");
        }
        return response.json();
      })
      .then((data) => {
        if (data) {
          console.log("Server response", data);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } catch (error) {
    console.log(error);
  }
}
