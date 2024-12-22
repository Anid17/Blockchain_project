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
    event LibrarianRemoved(address librarian);
    event GasFeeEstimated(uint gas);

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
    modifier validBookId(uint _bookId){
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

    //1. Add librarian (Owner only) -->The *onlyOwner* modifier restricts the execution of this function to the owner.
    function addLibrarian(address _librarian) public onlyOwner{
        librarians[_librarian] = true;
        emit LibrarianAdded(_librarian);
    }

    //2. Remove librarian (Owner only) 
    function removeLibrarian(address _librarian) public onlyOwner{
        require(librarians[_librarian],"Address is not a librarian");
        librarians[_librarian]=false;
        emit LibrarianRemoved(_librarian);
    } 
    //3. Register user 
    function registerUser() public{
        require(users[msg.sender].userAddress == address(0), "User already registered");
        users[msg.sender] = User(msg.sender,new uint[](0));
        emit UserRegisterd(msg.sender);
    }
    //4. Add a new book (Librarian only)
    function addBook(string memory _title, string memory _author) public onlyLibrarian{
        books[bookCount] = Book(_title, _author, false);
        emit BookAdded(bookCount, _title, _author);
        bookCount++;
    }
    //5. Update book details (Librarian only)
    function updateBookDetails(uint _bookId, string memory _newTitle, string memory _newAuthor)
        public onlyLibrarian validBookId(_bookId) {
        books[_bookId].title = _newTitle;
        books[_bookId].author = _newAuthor;
        emit BookDetailsUpdated(_bookId, _newTitle, _newAuthor);
    }
    //6. Borrow a book (Registered users only)
    function borrowBook(uint _bookId) public onlyRegisteredUser validBookId(_bookId) notBorrowed(_bookId) {
        books[_bookId].isBorrowed = true;
        borrowHistory[_bookId] = BorrowHistory(_bookId, msg.sender, block.timestamp, 0);
        users[msg.sender].borrowedBooks.push(_bookId);
        emit BorrowHistoryUpdated(_bookId, msg.sender, block.timestamp, 0);
    }

    //7. Return a book (Only the borrower)
    function returnBook(uint _bookId) public onlyBorrower(_bookId) validBookId(_bookId) {
        books[_bookId].isBorrowed = false;
        borrowHistory[_bookId].returnDate = block.timestamp;
        emit BorrowHistoryUpdated(_bookId, msg.sender, borrowHistory[_bookId].borrowDate, block.timestamp);
    }
    //8. View borrowed books for a user
    function getBorrowedBooks(address _user) public view returns (uint[] memory) {
        return users[_user].borrowedBooks;
    }
    //9. search for a book by title
    function searchBookByTitle(string memory _title) public view returns (uint[] memory){
        uint[] memory matchingBooks = new uint[](bookCount);
        uint counter = 0;
        for(uint i=0;i< bookCount;i++){
            if(keccak256(abi.encodePacked(books[i].title)) == keccak256(abi.encodePacked(_title))){
                matchingBooks[counter] = i;
                counter++;
            }

        }
        uint[] memory results = new uint[](counter);
        for(uint j=0;j<counter;j++){
            results[j]= matchingBooks[j];
        }
        return results;
    }
    //10. Filter books by availability
    function filterAvailableBooks() public view returns (uint[] memory) {
        uint[] memory availableBooks = new uint[](bookCount);
        uint counter = 0;

        for (uint i = 0; i < bookCount; i++) {
            if (!books[i].isBorrowed) {
                availableBooks[counter] = i;
                counter++;
            }
        }

        uint[] memory results = new uint[](counter);
        for (uint j = 0; j < counter; j++) {
            results[j] = availableBooks[j];
        }

        return results;
    }
    //11. // Estimate gas fees for borrowing a book
    function estimateGasForBorrow(uint _bookId) public validBookId(_bookId) returns (uint) {
        uint gasStart = gasleft();
        uint gasUsed = gasStart - gasleft();
        emit GasFeeEstimated(gasUsed);
        return gasUsed;
    }
    //12. View all books
    function getAllBooks() public view returns (Book[] memory) {
        Book[] memory allBooks = new Book[](bookCount);
        for (uint i = 0; i < bookCount; i++) {
            allBooks[i] = books[i];
        }
        return allBooks;
    }
    //13. View borrower details for a book
    function getBorrowerDetails(uint _bookId) public view validBookId(_bookId) returns (BorrowHistory memory) {
        return borrowHistory[_bookId];
    }
}