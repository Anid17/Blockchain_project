import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import LibraryABI from './Library.json';

const App = () => {
  const [account, setAccount] = useState("");
  const [books, setBooks] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [libraryContract, setLibraryContract] = useState(null);

  useEffect(() => {
    const connectToBlockchain = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);

        // Initialize contract
        const contractAddress = "0xd9e40E89e02Efa70091f0A96D846457E84A9496f"; 
        const contract = new ethers.Contract(contractAddress, LibraryABI, provider.getSigner());
        setLibraryContract(contract);

        // Check registration status
        const registered = await contract.users(accounts[0]);
        setIsRegistered(registered.userAddress !== ethers.constants.AddressZero);

        // Fetch books (Available and All Books)
        const availableBooks = await contract.filterAvailableBooks();
        const allBooks = await contract.getAllBooks();
        setBooks(allBooks);
      } else {
        alert("Please install MetaMask!");
      }
    };

    connectToBlockchain();
  }, []);

  const handleRegister = async () => {
    if (libraryContract) {
      const tx = await libraryContract.registerUser();
      await tx.wait();
      setIsRegistered(true);
    }
  };

  const borrowBook = async (id) => {
    if (libraryContract) {
      const tx = await libraryContract.borrowBook(id);
      await tx.wait();
      alert(`Book ID: ${id} borrowed successfully.`);
      setBooks(await libraryContract.getAllBooks()); // Refresh the book list
    }
  };

  const returnBook = async (id) => {
    if (libraryContract) {
      const tx = await libraryContract.returnBook(id);
      await tx.wait();
      alert(`Book ID: ${id} returned successfully.`);
      setBooks(await libraryContract.getAllBooks()); // Refresh the book list
    }
  };

  return (
    <div className="container mt-4">
      <header className="d-flex justify-content-between align-items-center">
        <h1>Library Management System</h1>
        <span>Connected: {account || "Not Connected"}</span>
      </header>

      <div className="mt-3">
        {!isRegistered ? (
          <button className="btn btn-primary" onClick={handleRegister}>
            Register
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={() => setBooks([])}>
            Load Books
          </button>
        )}
      </div>

      <div className="row mt-4">
        {books.map((book, index) => (
          <div className="col-md-4" key={index}>
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">{book.title}</h5>
                <p className="card-text">Author: {book.author}</p>
                <p className="card-text">
                  Status: {book.isBorrowed ? "Borrowed" : "Available"}
                </p>
                {!book.isBorrowed ? (
                  <button
                    className="btn btn-success"
                    onClick={() => borrowBook(index)}
                  >
                    Borrow
                  </button>
                ) : (
                  <button
                    className="btn btn-warning"
                    onClick={() => returnBook(index)}
                  >
                    Return
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

