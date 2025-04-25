package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"github.com/gorilla/handlers"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"google.golang.org/api/option"
)

// var to hold the mongoDB client
var client *mongo.Client
var firebaseApp *firebase.App
var firebaseAuth *auth.Client

// book format
type Book struct {
	ID        int    `json:"id,omitempty"`
	Author    string `json:"author"`
	Title     string `json:"title"`
	Genre     string `json:"genre"`
	Pages     int    `json:"pages"`
	PagesRead int    `json:"pagesRead"`
	Completed bool   `json:"completed"`
	Current   bool   `json:"current"`
}

func main() {

	var err error

	// Initialize Firebase
	if err := initFirebase(); err != nil {
		log.Fatalf("Firebase initialization error: %v\n", err)
	}

	//creates a mongoDB server API config
	serverAPI := options.ServerAPI(options.ServerAPIVersion1)

	//connects to the mongoDB instance using the connection string and server API options
	client, err = mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://getreading-mongo:27017/").SetServerAPIOptions(serverAPI))

	if err != nil {
		//if connection fails, panic with the error
		panic(err)
	}

	//pings the database to confirm connection
	err = client.Ping(context.Background(), nil)
	if err != nil {
		//if ping fails, panic with the error
		panic(err)
	}

	//log the successful connection to confirm
	fmt.Println("connected to MongoDB")

	//set up route handler for delete book
	http.HandleFunc("/delete-book", firebaseVerify(deleteBook))

	//set up route handler for post book
	http.HandleFunc("/post-book", firebaseVerify(addBook))

	//set up route handler for put book endpoint
	http.HandleFunc("/put-book", firebaseVerify(updateBook))

	//set up route handler for get books endpoint
	http.HandleFunc("/get-books", firebaseVerify(getBooks))

	//start the server on port 8080 with CORS support and log any errors.
	//current cors config allows only requests from the frontend (localhost:3000), and allows delete, get, put, and post methods
	log.Fatal(http.ListenAndServe(":8080", handlers.CORS(
		//allow the frontend
		handlers.AllowedOrigins([]string{"http://localhost:3000", "http://getreading:3000"}),
		//allow the specific http methods (delete and options)
		handlers.AllowedMethods([]string{"DELETE", "PUT", "POST", "GET", "OPTIONS"}),
		//allow specific headers (content-type, since sending json data)
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),
		//allow credentials in messages
		handlers.AllowCredentials(),
	)(http.DefaultServeMux)))
}

// / Initialize Firebase Admin SDK
func initFirebase() error {
	ctx := context.Background()

	opt := option.WithCredentialsFile("get-reading-firebase-adminsdk.json")
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return fmt.Errorf("error initializing app: %v", err)
	}

	// Get Auth client
	authClient, err := app.Auth(ctx)
	if err != nil {
		return fmt.Errorf("error getting Auth client: %v", err)
	}

	firebaseApp = app
	firebaseAuth = authClient
	return nil
}

// firebaseVerify verifies the Firebase ID token
func firebaseVerify(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get the Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header missing", http.StatusUnauthorized)
			return
		}

		// Check that the header is in the correct format
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "Invalid Authorization header format", http.StatusUnauthorized)
			return
		}

		// Verify the Firebase ID token
		token := parts[1]
		_, err := firebaseAuth.VerifyIDToken(context.Background(), token)
		if err != nil {
			http.Error(w, "Invalid Firebase token: "+err.Error(), http.StatusUnauthorized)
			return
		}

		// Token is valid, call the next handler
		next(w, r)
	}
}

// Delete handler to remove books
func deleteBook(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		//if not delete request, respond with method not allowed and error message
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	//variable to hold the list of books (by ID)
	var delBook Book

	//decode the json request into the book ids
	err := json.NewDecoder(r.Body).Decode(&delBook)
	if err != nil {
		//if json decoding fails, respond with bad request and message
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	//gets the mongodb collection (change this to the actual database and collection after)
	collection := client.Database("local").Collection("books")

	//creates a mongoDB filter to match documents where the "name" field is in the list of book ID's
	filter := bson.M{"title": delBook.Title}
	//perform the delete using the mongoDB filter (will delete all documents matching the filter)
	result, err := collection.DeleteMany(context.Background(), filter)
	if err != nil {
		//if delete fails, respond with error
		http.Error(w, "failed to delete books", http.StatusInternalServerError)
		log.Println("Delete error:", err)
		return
	}

	//returns an error if no items were deleted, could be left out and handled on frontend side instead possibly
	if result.DeletedCount == 0 {
		//if no items were deleted, respond with error 404 not found
		http.Error(w, "No books found to delete", http.StatusNotFound)
		return
	}

	//set response to 200 (OK) since operation was successful
	w.WriteHeader(http.StatusOK)
	//create a response message of how many books were deleted
	response := fmt.Sprintf("Deleted %v books", result.DeletedCount)
	//encode the response message as JSON and send it back to the client
	json.NewEncoder(w).Encode(response)
}

// Get handler to return list of books
func getBooks(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var books []Book
	//need to correct for final build
	collection := client.Database("local").Collection("books")

	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		// If the query fails, respond with an internal server error
		http.Error(w, "Failed to retrieve reading list", http.StatusInternalServerError)
		log.Println("Find error:", err)
		return
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var book Book
		if err := cursor.Decode(&book); err != nil {
			http.Error(w, "Failed to decode books", http.StatusInternalServerError)
			log.Println("Decode error:", err)
			return
		}
		books = append(books, book)
	}

	// If no documents are found, respond with a 404 (Not Found)
	if len(books) == 0 {
		http.Error(w, "No books found", http.StatusNotFound)
		return
	}

	// Respond with the books in JSON format
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(books)
	if err != nil {
		// If encoding fails, respond with an internal server error
		http.Error(w, "Failed to encode books", http.StatusInternalServerError)
		log.Println("JSON encoding error:", err)
	}
}

// Post handler to add new books
func addBook(w http.ResponseWriter, r *http.Request) {
	// Handle only POST requests
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var newBook Book

	//decode the json request into the book struct
	err := json.NewDecoder(r.Body).Decode(&newBook)
	if err != nil {
		//if json decoding fails, respond with bad request and message
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get the MongoDB collection
	collection := client.Database("local").Collection("books")

	// creates a mongoDB filter to match documents where the same title
	filter := bson.M{"title": newBook.Title}

	// container for old doc
	var oldDoc bson.M

	// Check if new or existing book
	err = collection.FindOne(context.Background(), filter).Decode(&oldDoc)
	// if existing
	if err != nil {
		// add new book
		result, err := collection.InsertOne(context.Background(), newBook)
		if err != nil {
			http.Error(w, "failed to insert book", http.StatusInternalServerError)
		}
		// Respond with success
		log.Printf("book inserted successfully:  %v\n", result.InsertedID)
		// else new
	} else {
		// Respond with failure
		http.Error(w, "book already exists", http.StatusInternalServerError)
	}

	// Respond with success
	w.WriteHeader(http.StatusCreated)
	//create a response message of how many books were deleted
	response := fmt.Sprintf("%v inserted successfully", newBook.Title)
	//encode the response message as JSON and send it back to the client
	json.NewEncoder(w).Encode(response)
}

// Put handler to update books
func updateBook(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var upBook Book

	//decode the json request into the book
	err := json.NewDecoder(r.Body).Decode(&upBook)
	if err != nil {
		//if json decoding fails, respond with bad request and message
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get the MongoDB collection
	collection := client.Database("local").Collection("books")

	// creates a mongoDB filter to match documents with the same title
	filter := bson.M{"title": upBook.Title}

	// update book
	result, err := collection.ReplaceOne(context.Background(), filter, upBook)
	if err != nil {
		http.Error(w, "failed to update book", http.StatusInternalServerError)
	}
	// Respond with success
	log.Printf("document updated successfully:  %v\n", result.UpsertedID)
	// else new

	w.WriteHeader(http.StatusOK)
	//create a response message
	response := fmt.Sprintf("%v updated successfully", upBook.Title)
	//encode the response message as JSON and send it back to the client
	json.NewEncoder(w).Encode(response)
}
