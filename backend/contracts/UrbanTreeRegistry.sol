// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title UrbanTreeRegistry
 * @dev Hợp đồng thông minh bảo chứng toàn vẹn dữ liệu cây xanh và nhật ký hiện trường (CNTT2311)
 * @author Tran Quang Lam (Blockchain Lead)
 */
contract UrbanTreeRegistry {
    // ==========================================
    // 1. CẤU TRÚC DỮ LIỆU (STRUCTS)
    // ==========================================
    struct Record {
        string recordId;       // Mã định danh nghiệp vụ (VD: "TREE-001", "CARE-2026-1024", "INC-88")
        string recordType;     // Phân loại: "TREE_PROFILE", "CARE_LOG", "INCIDENT_REPORT"
        string dataHash;       // Mã băm SHA-256 của nội dung dữ liệu off-chain (64 hex characters)
        uint256 timestamp;     // Thời điểm ghi nhận bất biến trên mạng Blockchain (block.timestamp)
        address recorder;      // Địa chỉ ví của nhân viên hoặc máy chủ backend thực hiện ghi dấu
        bool exists;           // Cờ đánh dấu bản ghi đã tồn tại (chống ghi đè/sửa đổi hồi tố)
    }

    // ==========================================
    // 2. BIẾN TRẠNG THÁI (STATE VARIABLES)
    // ==========================================
    address public owner;                                      // Quản trị viên tối cao của hợp đồng
    mapping(address => bool) public authorizedRecorders;       // Danh sách địa chỉ ví được cấp quyền ghi
    mapping(string => Record) private records;                 // Tra cứu bản ghi theo mã: recordId => Record
    string[] private recordIds;                                // Danh sách lưu tất cả mã để phục vụ Explorer

    // ==========================================
    // 3. SỰ KIỆN (EVENTS)
    // ==========================================
    event RecordAnchored(
        string indexed recordId,
        string recordType,
        string dataHash,
        uint256 timestamp,
        address indexed recorder
    );

    event RecorderAuthorized(address indexed account);
    event RecorderRevoked(address indexed account);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ==========================================
    // 4. BỘ ĐIỀU KIỆN (MODIFIERS)
    // ==========================================
    modifier onlyOwner() {
        require(msg.sender == owner, "UrbanTree: Caller is not the contract owner");
        _;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner || authorizedRecorders[msg.sender],
            "UrbanTree: Caller is not authorized to anchor records"
        );
        _;
    }

    // ==========================================
    // 5. KHỞI TẠO (CONSTRUCTOR)
    // ==========================================
    constructor() {
        owner = msg.sender;
        authorizedRecorders[msg.sender] = true; // Mặc định người deploy có quyền ghi dữ liệu
        emit OwnershipTransferred(address(0), msg.sender);
        emit RecorderAuthorized(msg.sender);
    }

    // ==========================================
    // 6. QUẢN LÝ PHÂN QUYỀN (ACCESS CONTROL)
    // ==========================================
    function authorizeRecorder(address _account) external onlyOwner {
        require(_account != address(0), "UrbanTree: Invalid address");
        require(!authorizedRecorders[_account], "UrbanTree: Account already authorized");
        authorizedRecorders[_account] = true;
        emit RecorderAuthorized(_account);
    }

    function revokeRecorder(address _account) external onlyOwner {
        require(authorizedRecorders[_account], "UrbanTree: Account is not authorized");
        authorizedRecorders[_account] = false;
        emit RecorderRevoked(_account);
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "UrbanTree: New owner is zero address");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }

    // ==========================================
    // 7. CHỨC NĂNG CỐT LÕI (CORE FUNCTIONS)
    // ==========================================

    /**
     * @notice Ghi dấu mã băm dữ liệu lên Blockchain (Anchor Record)
     * @dev Chỉ người được cấp quyền mới có thể gọi. Không cho phép ghi đè recordId đã có.
     */
    function anchorRecord(
        string memory _recordId,
        string memory _recordType,
        string memory _dataHash
    ) external onlyAuthorized {
        require(bytes(_recordId).length > 0, "UrbanTree: recordId cannot be empty");
        require(bytes(_recordType).length > 0, "UrbanTree: recordType cannot be empty");
        require(bytes(_dataHash).length > 0, "UrbanTree: dataHash cannot be empty");
        
        // CHỐNG GIAN LẬN: Nếu mã ID này đã được ghi, TUYỆT ĐỐI không cho ghi đè!
        require(!records[_recordId].exists, "UrbanTree: Record already anchored (Tampering prevented)");

        Record memory newRecord = Record({
            recordId: _recordId,
            recordType: _recordType,
            dataHash: _dataHash,
            timestamp: block.timestamp,
            recorder: msg.sender,
            exists: true
        });

        records[_recordId] = newRecord;
        recordIds.push(_recordId);

        emit RecordAnchored(
            _recordId,
            _recordType,
            _dataHash,
            block.timestamp,
            msg.sender
        );
    }

    /**
     * @notice Xác minh tính toàn vẹn của một bản ghi đối chiếu với Blockchain (Dùng cho Cổng A19)
     * @param _recordId Mã bản ghi cần kiểm tra
     * @param _currentHash Mã băm hiện tại của dữ liệu từ Database
     * @return isValid Khớp 100% hay không
     * @return isExisted Bản ghi có tồn tại trên chuỗi không
     * @return timestamp Thời điểm đã neo lên chuỗi
     * @return recorder Ví đã thực hiện neo
     * @return storedHash Mã băm gốc được lưu trên chuỗi
     */
    function verifyRecord(
        string memory _recordId,
        string memory _currentHash
    ) external view returns (
        bool isValid,
        bool isExisted,
        uint256 timestamp,
        address recorder,
        string memory storedHash
    ) {
        Record memory rec = records[_recordId];
        if (!rec.exists) {
            return (false, false, 0, address(0), "");
        }

        bool matchHash = keccak256(bytes(rec.dataHash)) == keccak256(bytes(_currentHash));
        return (matchHash, true, rec.timestamp, rec.recorder, rec.dataHash);
    }

    /**
     * @notice Lấy thông tin chi tiết một bản ghi
     */
    function getRecord(string memory _recordId) external view returns (Record memory) {
        require(records[_recordId].exists, "UrbanTree: Record does not exist");
        return records[_recordId];
    }

    /**
     * @notice Lấy tổng số lượng bản ghi đã được ghi dấu (Dùng cho Dashboard & Explorer A18)
     */
    function getRecordCount() external view returns (uint256) {
        return recordIds.length;
    }

    /**
     * @notice Lấy toàn bộ danh sách recordId
     */
    function getAllRecordIds() external view returns (string[] memory) {
        return recordIds;
    }
}