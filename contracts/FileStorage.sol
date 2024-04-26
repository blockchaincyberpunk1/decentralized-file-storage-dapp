// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FileStorage {
    // Struct to hold file metadata
    struct File {
        string ipfsHash;
        string fileName;
        uint256 fileSize;
        address owner;
    }

    // Mapping from file ID to File metadata
    mapping(uint256 => File) private files;

    // Counter for file IDs
    uint256 private fileIdCounter;

    // Event to be emitted when a file is stored
    event FileStored(uint256 fileId, string ipfsHash, address owner);

    // Modifier to check if the caller is the owner of the file
    modifier isOwner(uint256 _fileId) {
        require(msg.sender == files[_fileId].owner, "Caller is not the owner");
        _;
    }

    // Function to store file metadata
    function storeFile(
        string memory _ipfsHash,
        string memory _fileName,
        uint256 _fileSize
    ) public returns (uint256) {
        uint256 newFileId = fileIdCounter++;
        files[newFileId] = File(_ipfsHash, _fileName, _fileSize, msg.sender);

        emit FileStored(newFileId, _ipfsHash, msg.sender);

        return newFileId;
    }

    // Function to retrieve file metadata
function getFile(uint256 _fileId) public view returns (string memory, string memory, uint256, address) {
    require(_fileId < fileIdCounter, "File does not exist"); // Check if file exists
    File memory file = files[_fileId];
    require(file.owner != address(0), "File does not exist"); // Check if file was actually stored
    require(msg.sender == file.owner, "Caller is not the owner"); // Check if caller is the owner

    return (file.ipfsHash, file.fileName, file.fileSize, file.owner);
}

}
