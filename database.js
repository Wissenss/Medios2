let DATABASE;

const indexedDB = 
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webKitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

const request = indexedDB.open("WebLibrary", 1);

request.onerror = function(event) {
  console.log("An error occurred with IndexedDB");
  console.error(event)
}

request.onupgradeneeded = function () {
  const db = request.result;

  const store = db.createObjectStore("files", { autoIncrement: true });

  store.createIndex("files_category", ["category"], { unique: false });
}