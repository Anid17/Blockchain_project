import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import LibraryABI from './Library.json'; // Replace with the correct import path
import Navbar from './Navbar';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      books: [],
      isRegistered: false,
      libraryContract: null,
      loading: false,
    };
  }

  componentDidMount() {
    this.connectToBlockchain();
  }

  connectToBlockchain = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      this.setState({ account: accounts[0] });

      const contractAddress = '0xd9e40E89e02Efa70091f0A96D846457E84A9496f'; 
      const contract = new ethers.Contract(
        contractAddress,
        LibraryABI,
        provider.getSigner()
      );
      this.setState({ libraryContract: contract });

      const registered = await contract.users(accounts[0]);
      this.setState({ isRegistered: registered.userAddress !== ethers.constants.AddressZero });

      await this.loadBooks();
    } else {
      alert('Please install MetaMask!');
    }
  };

  loadBooks = async () => {
    const { libraryContract } = this.state;
    if (libraryContract) {
      this.setState({ loading: true });
      try {
        const allBooks = await libraryContract.getAllBooks();
        this.setState({ books: allBooks });
      } catch (error) {
        console.error('Error loading books:', error.message);
      } finally {
        this.setState({ loading: false });
      }
    }
  };

  handleRegister = async () => {
    const { libraryContract } = this.state;
    if (libraryContract) {
      this.setState({ loading: true });
      try {
        const tx = await libraryContract.registerUser();
        await tx.wait();
        this.setState({ isRegistered: true });
        await this.loadBooks();
        alert('Registration successful!');
      } catch (error) {
        console.error('Registration failed:', error.message);
      } finally {
        this.setState({ loading: false });
      }
    }
  };

  borrowBook = async (id) => {
    const { libraryContract } = this.state;
    if (libraryContract) {
      this.setState({ loading: true });
      try {
        const tx = await libraryContract.borrowBook(id);
        await tx.wait();
        alert(`Book ID: ${id} borrowed successfully.`);
        await this.loadBooks();
      } catch (error) {
        console.error('Error borrowing book:', error.message);
      } finally {
        this.setState({ loading: false });
      }
    }
  };

  returnBook = async (id) => {
    const { libraryContract } = this.state;
    if (libraryContract) {
      this.setState({ loading: true });
      try {
        const tx = await libraryContract.returnBook(id);
        await tx.wait();
        alert(`Book ID: ${id} returned successfully.`);
        await this.loadBooks();
      } catch (error) {
        console.error('Error returning book:', error.message);
      } finally {
        this.setState({ loading: false });
      }
    }
  };

  estimateGasForBorrow = async (id) => {
    const { libraryContract } = this.state;
    if (libraryContract) {
      try {
        const gasEstimate = await libraryContract.estimateGas.borrowBook(id);
        alert(`Estimated Gas: ${ethers.utils.formatUnits(gasEstimate, 'gwei')} Gwei`);
      } catch (error) {
        console.error('Error estimating gas:', error.message);
      }
    }
  };

  render() {
    const { account, books, isRegistered, loading } = this.state;

    return (
      <div>
        <Navbar account={account} />
        <div className="container mt-4">
          <header className="d-flex justify-content-between align-items-center">
            <h1>Library Management System</h1>
            <span>Connected: {account || 'Not Connected'}</span>
          </header>

          <div className="mt-3">
            {!isRegistered ? (
              <button className="btn btn-primary" onClick={this.handleRegister} disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={this.loadBooks} disabled={loading}>
                {loading ? 'Loading...' : 'Load Books'}
              </button>
            )}
          </div>

          <div className="row mt-4">
            {loading ? (
              <div className="alert alert-info">Loading books...</div>
            ) : books.length > 0 ? (
              books.map((book, index) => (
                <div className="col-md-4" key={index}>
                  <div className="card mb-4">
                    <div className="card-body">
                      <h5 className="card-title">{book.title}</h5>
                      <p className="card-text">Author: {book.author}</p>
                      <p className="card-text">
                        Status: {book.isBorrowed ? 'Borrowed' : 'Available'}
                      </p>
                      {!book.isBorrowed ? (
                        <button
                          className="btn btn-success"
                          onClick={() => this.borrowBook(index)}
                          disabled={loading}
                        >
                          Borrow
                        </button>
                      ) : (
                        <button
                          className="btn btn-warning"
                          onClick={() => this.returnBook(index)}
                          disabled={loading}
                        >
                          Return
                        </button>
                      )}
                      {!book.isBorrowed && (
                        <button
                          className="btn btn-info ml-2"
                          onClick={() => this.estimateGasForBorrow(index)}
                          disabled={loading}
                        >
                          Estimate Gas
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="alert alert-warning">No books available</div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
