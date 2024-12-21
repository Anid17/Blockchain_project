// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LibraryManagementSystem {

    //Structs 
    struct User {
        address userAddress;
        uint[] borrowedBooks;
    }
    struct Book {
        string title;
        string author;
        bool isBorrowed;
    }
    struct BorrowHistory {
        uint BookID;
        address user;
        uint borrowDate;
        uint returnDate;
    }
}