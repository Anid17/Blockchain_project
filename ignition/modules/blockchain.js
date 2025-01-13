import { ethers } from "ethers";

const contractAddress = "YOUR_CONTRACT_ADDRESS";
const contractABI = [/* Your Contract ABI */];

export async function connectToContract() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed!");
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
}

export async function getBooks() {
  const contract = await connectToContract();
  const books = await contract.getAllBooks();
  return books.map((book, index) => ({
    id: index,
    title: book.title,
    author: book.author,
    isBorrowed: book.isBorrowed,
  }));
}

export async function registerUser() {
  const contract = await connectToContract();
  const tx = await contract.registerUser();
  await tx.wait();
}

export async function borrowBook(bookId) {
  const contract = await connectToContract();
  const tx = await contract.borrowBook(bookId);
  await tx.wait();
}

export async function returnBook(bookId) {
  const contract = await connectToContract();
  const tx = await contract.returnBook(bookId);
  await tx.wait();
}
