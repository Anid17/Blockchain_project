// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LibraryManagementSystem {
    // Owner Address --> The owner is the administrator for the system, He also can perform actions assigning rols/updeting contract setting/Scalability:
    //Other roles like librarians are *dynamically assigned via mappings*
    address public owner;

    //Book count
    uint public bookCount;

    //Constractor 
    constructor(){
        owner=msg.sender;
    }

    //Structs --> 
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
        uint BookId;
        address user;
        uint borrowDate;
        uint returnDate;
    }
    //Mappings -->
    mapping (uint => Book) public books; //BookID => Book
    mapping(address => bool) public librarians; //address=>isLibrarian
    mapping(address => User) public users; //userAddress => User
    mapping(uint => BorrowHistory) public borrowHistory; // bookId =>BorrowHistory

    //Events
    event UserRegisterd (address userAddress);
    event LibrarianAdded (address librarian);
    event BookAdded (uint bookId,string newTitle,string newAuthour);
    event BookDetailsUpdated (uint bookId, string newTitle, string NewAuthor);
    event BorrowHistoryUpdated (uint bookId, address user, uint borrowDate,uint returnDate);

    //Modifiers

    modifier onlyOwner(){
        require(msg.sender ==owner,"Sorry, Only the owner can perform this action!");
        _;
    }
    modifier onlyLibrarian(){
        require(librarians[msg.sender],"Sorry, Only librarians can perform this action");
        _;
    }
    modifier onlyRegisteredUser(){
        require(users[msg.sender].userAddress !=address(0),"User is not registerd");
        _;
    }
    modifier ValidBookId(uint _bookId){
        require(_bookId < bookCount,"Invalid book ID!");
        _;
    }
    modifier notBorrowed(uint _bookId){
        require(!books[_bookId].isBorrowed,"Sorry, Book is already borrowed");
        _;
    }
    /*
     Modifier: onlyBorrower
     Ensures that only the user who borrowed the book can perform certain actions, 
     such as returning the book. Provides security by validating the borrower.
     */
    modifier onlyBorrower(uint _bookId){
        require(borrowHistory[_bookId].user == msg.sender,"You did not borrow this book");
        _;
    }

    //Functions

    // Add librarian (Owner only) -->The *onlyOwner* modifier restricts the execution of this function to the owner.
    function addLibrarian(address _librarian) public onlyOwner{
        librarians[_librarian] = true;
        emit LibrarianAdded(_librarian);
    }

    //






}