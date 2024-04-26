const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FileStorage", function () {
  let FileStorage, fileStorage, owner, addr1;

  beforeEach(async function () {
    // Deploy the contract
    FileStorage = await ethers.getContractFactory("FileStorage");
    fileStorage = await FileStorage.deploy();
    await fileStorage.deployed();

    // Get signers
    [owner, addr1] = await ethers.getSigners();
  });

  describe("storeFile", function () {
    it("should emit a FileStored event after storing a file", async function () {
      const ipfsHash = "Qm...";
      const fileName = "test.txt";
      const fileSize = 1234;

      await expect(fileStorage.storeFile(ipfsHash, fileName, fileSize))
        .to.emit(fileStorage, "FileStored")
        .withArgs(0, ipfsHash, owner.address);
    });

    it("should correctly increment fileIdCounter after storing a file", async function () {
        const ipfsHash = "Qm...";
        const fileName = "test1.txt";
        const fileSize = 1234;
      
        // Store two files and capture the emitted events
        let tx = await fileStorage.storeFile(ipfsHash, fileName, fileSize);
        let receipt = await tx.wait();
        let fileId1 = receipt.events?.filter((x) => { return x.event == "FileStored" })[0].args.fileId;
      
        tx = await fileStorage.storeFile(ipfsHash, fileName, fileSize);
        receipt = await tx.wait();
        let fileId2 = receipt.events?.filter((x) => { return x.event == "FileStored" })[0].args.fileId;
      
        // fileIdCounter should be incremented to 2 after storing two files
        expect(fileId2.toNumber()).to.equal(fileId1.toNumber() + 1);
      });
      
    
      it("should store file data correctly", async function () {
        const ipfsHash = "Qm...";
        const fileName = "test2.txt";
        const fileSize = 5678;
      
        let tx = await fileStorage.storeFile(ipfsHash, fileName, fileSize);
        let receipt = await tx.wait();
        let fileId = receipt.events?.filter((x) => { return x.event == "FileStored" })[0].args.fileId;
      
        const [storedIpfsHash, storedFileName, storedFileSize, storedOwner] = await fileStorage.getFile(fileId);
      
        expect(storedIpfsHash).to.equal(ipfsHash);
        expect(storedFileName).to.equal(fileName);
        expect(storedFileSize).to.equal(fileSize);
        expect(storedOwner).to.equal(owner.address);
      });
      
  });

  describe("getFile", function () {
    it("should allow the owner to retrieve file metadata", async function () {
      const ipfsHash = "Qm...";
      const fileName = "test.txt";
      const fileSize = 1234;

      await fileStorage.storeFile(ipfsHash, fileName, fileSize);

      const [
        returnedIpfsHash,
        returnedFileName,
        returnedFileSize,
        returnedOwner,
      ] = await fileStorage.getFile(0);
      expect(returnedIpfsHash).to.equal(ipfsHash);
      expect(returnedFileName).to.equal(fileName);
      expect(returnedFileSize).to.equal(fileSize);
      expect(returnedOwner).to.equal(owner.address);
    });

    it("should prevent non-owners from retrieving file metadata", async function () {
      const ipfsHash = "Qm...";
      const fileName = "test.txt";
      const fileSize = 1234;

      await fileStorage.storeFile(ipfsHash, fileName, fileSize);

      await expect(fileStorage.connect(addr1).getFile(0)).to.be.revertedWith(
        "Caller is not the owner"
      );
    });

    it("should revert for file ID with zero address owner", async function () {
      // Assuming 1 is a file ID that was never stored (or deleted)
      const nonStoredFileId = 1;
      await expect(fileStorage.getFile(nonStoredFileId))
        .to.be.revertedWith("File does not exist");
    });
  });

  describe("getFile with non-existent file ID", function () {
    it("should revert when a non-existent file ID is requested", async function () {
      const nonExistentFileId = 999; // An ID that is unlikely to exist
      await expect(fileStorage.getFile(nonExistentFileId)).to.be.revertedWith(
        "File does not exist"
      );
    });
  });

  describe("getFile with existent file ID by non-owner", function () {
    it("should revert when a non-owner tries to access existing file metadata", async function () {
      // Store a file first
      const ipfsHash = "Qm...";
      const fileName = "test.txt";
      const fileSize = 1234;
      await fileStorage.storeFile(ipfsHash, fileName, fileSize);

      // A non-owner (addr1) tries to access the file metadata
      const existentFileId = 0; // Assuming this is the first file stored
      await expect(
        fileStorage.connect(addr1).getFile(existentFileId)
      ).to.be.revertedWith("Caller is not the owner");
    });
  });
});
