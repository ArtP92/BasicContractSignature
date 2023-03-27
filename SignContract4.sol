// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Контракт для управления подписями простого документа
contract SimpleDocumentSignature {
    
    // Отображение для хранения хешей подписанных документов по адресам
    mapping(address => mapping(bytes32 => bool)) private _signatures;
     // Массив для хранения адресов в белом списке
    address[] private _whitelist; // Белый список разрешенных адресов

     // Определение события для отслеживания подписи документа
    event DocumentSigned(address indexed signer, bytes32 indexed documentHash);

    constructor() {
    }

    // Внутренняя функция для проверки, находится ли указанный адрес в белом списке
    function isWhitelisted(address addr) private view returns (bool) {
        for (uint256 i = 0; i < _whitelist.length; i++) {
            if (_whitelist[i] == addr) {
                return true;
            }
        }
        return false;
    }

    // Внутренняя функция для подписания документа указанным подписантом
    function _signDocument(address signer, bytes32 documentHash) private {
        require(isWhitelisted(signer), "Caller is not in the whitelist");
        _signatures[signer][documentHash] = true;
        emit DocumentSigned(signer, documentHash);
    }

    // Функция для подписи документа внешним аккаунтом
    function signDocument(bytes32 documentHash) external {
        _signDocument(msg.sender, documentHash);
    }

    // Функция для проверки подписи всех адресов в белом списке для указанного хеша документа
    function allAddressesSignedDocument(bytes32 documentHash) external view returns (bool) {
        for (uint256 i = 0; i < _whitelist.length; i++) {
            if (!_signatures[_whitelist[i]][documentHash]) {
                return false;
            }
        }
        return true;
    }

    // Функция для добавления адреса в белый список
    function addToWhitelist(address addr) external {
        require(!isWhitelisted(addr), "Address is already in the whitelist");
        _whitelist.push(addr);
    }

    // Функция для удаления адреса из белого списка
    function removeFromWhitelist(address addr) external {
        require(isWhitelisted(addr), "Address is not in the whitelist");

        for (uint256 i = 0; i < _whitelist.length; i++) {
            if (_whitelist[i] == addr) {
                _whitelist[i] = _whitelist[_whitelist.length - 1];
                _whitelist.pop();
                break;
            }
        }
    }

    // Функция для получения списка адресов в белом списке
    function getWhitelist() external view returns (address[] memory) {
    return _whitelist;
    }


    // Функция для указания хеша документа аккаунтом из белого списка
    function setDocumentHash(bytes32 documentHash) external {
        require(isWhitelisted(msg.sender), "Caller is not in the whitelist");
        _signDocument(msg.sender, documentHash);
    }

    // Функция для получения количества голосов за указанный хеш документа
    function getVoteCount(bytes32 documentHash) external view returns (uint256) {
        uint256 voteCount = 0;

        for (uint256 i = 0; i < _whitelist.length; i++) {
            if (_signatures[_whitelist[i]][documentHash]) {
                voteCount++;
            }
        }
            return voteCount;
    }
}
   
