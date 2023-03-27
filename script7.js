// Код ABI контракта
// ABI (Application Binary Interface) - это интерфейс, который описывает функции и переменные контракта для взаимодействия с ним.
// Этот код содержит описание функций, переменных и их типов для контракта.
const contractAbi = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "addr",
				"type": "address"
			}
		],
		"name": "addToWhitelist",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "addr",
				"type": "address"
			}
		],
		"name": "removeFromWhitelist",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "signer",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "documentHash",
				"type": "bytes32"
			}
		],
		"name": "DocumentSigned",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "documentHash",
				"type": "bytes32"
			}
		],
		"name": "setDocumentHash",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "documentHash",
				"type": "bytes32"
			}
		],
		"name": "signDocument",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "documentHash",
				"type": "bytes32"
			}
		],
		"name": "allAddressesSignedDocument",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "documentHash",
				"type": "bytes32"
			}
		],
		"name": "getVoteCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getWhitelist",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// Код контракта
// Здесь указывается адрес контракта, с которым мы будем взаимодействовать в нашем приложении.
const contractAddress = "0x5527675ef8c4b9d5dc9e71638fdc8d725d44d5b4";

// Получение провайдера и подключение к MetaMask
// В этой функции мы проверяем наличие провайдера (MetaMask) и запрашиваем разрешение на подключение.
// Затем мы указываем правильный chainId и name для тестовой сети Binance Smart Chain.
async function getProvider() {
    console.log('window.ethereum:', window.ethereum);
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            // Указываем правильный chainId и name для тестовой сети Binance Smart Chain
            const network = {
                chainId: 97,
                name: "bsc-testnet",
            };
            return new ethers.providers.Web3Provider(window.ethereum, network);
        } catch (error) {
            alert("Failed to connect to MetaMask: " + error.message);
            return null;
        }
    }
    alert("Please install MetaMask or another web3 wallet");
    return null;
}


// Для каждой кнопки на странице мы определяем соответствующую функцию для вызова методов контракта.
// Мы создаем экземпляр контракта с помощью библиотеки ethers.js и вызываем нужный метод контракта.
// В случае успеха мы обновляем текст на странице, а в случае ошибки выводим сообщение об ошибке.

window.addEventListener("DOMContentLoaded", () => {
	// Обработчики событий для кнопок взаимодействия с контрактом
	document.getElementById("signButton").onclick = async () => {
		const provider = await getProvider();
		console.log('provider:', provider);
		if (!provider) return;

		const signer = provider.getSigner();
		const documentHash = document.getElementById("documentHash").value;

		// Создаем экземпляр контракта с помощью библиотеки ethers.js
		const contract = new ethers.Contract(contractAddress, contractAbi, signer);
		try {
			
			// Вызываем функцию контракта
			const tx = await contract.signDocument(documentHash);
			document.getElementById("status").innerHTML = `Document signed. Transaction hash: ${tx.hash}`;
		} catch (error) {
			document.getElementById("status").innerHTML = `Error: ${error.message}`;
		}
	};

	// Добавление обработчика события на кнопку с id="checkButton".
	// Когда пользователь нажимает на эту кнопку, мы получаем провайдера (MetaMask) и проверяем, все ли адреса подписали документ с помощью метода allAddressesSignedDocument контракта.
	// Если успешно, то на странице отображается сообщение об успешной проверке, в противном случае выводится сообщение об ошибке.
	document.getElementById("checkButton").onclick = async () => {
		const provider = await getProvider();
		console.log('provider:', provider);
		if (!provider) return;

		// Создаем экземпляр контракта с помощью библиотеки ethers.js
		const documentHash = document.getElementById("documentHash").value;

		const contract = new ethers.Contract(contractAddress, contractAbi, provider);
		try {

			// Вызываем функцию контракта для проверки, все ли адреса подписали документ с заданным хешем
			const allSigned = await contract.allAddressesSignedDocument(documentHash);
			document.getElementById("status").innerHTML = allSigned
				? "All addresses have signed the document."
				: "Not all addresses have signed the document.";
		} catch (error) {
			document.getElementById("status").innerHTML = `Error: ${error.message}`;
		}
	};

	// Обработчик события для кнопки "Показать количество голосов"
	document.getElementById("voteCountButton").onclick = async () => {
		// Получаем провайдера и подключаемся к MetaMask
		const provider = await getProvider();
		console.log('provider:', provider);
		if (!provider) return;

		// Получаем хэш документа из поля ввода на странице
		const documentHash = document.getElementById("documentHash").value;

		// Создаем экземпляр контракта с помощью библиотеки ethers.js
		const contract = new ethers.Contract(contractAddress, contractAbi, provider);
		try {

			// Вызываем функцию контракта для получения количества голосов за документ
			const voteCount = await contract.getVoteCount(documentHash);
			// Обновляем текст на странице с количеством голосов
			document.getElementById("status").innerHTML = `Vote count: ${voteCount}`;
		} catch (error) {
			// Выводим сообщение об ошибке, если функция контракта вызвана с ошибкой
			document.getElementById("status").innerHTML = `Error: ${error.message}`;
		}
	};

	// Обработчик события для кнопки "Добавить хэш документа"
	document.getElementById("addDocumentHashButton").onclick = async () => {
		// Получаем провайдера и подключаемся к MetaMask
		const provider = await getProvider();
		console.log('provider:', provider);
		if (!provider) return;

		// Получаем подписчика для отправки транзакции
		const signer = provider.getSigner();
		// Получаем новый хэш документа из поля ввода на странице
		const newDocumentHash = document.getElementById("newDocumentHash").value;

		// Создаем экземпляр контракта с помощью библиотеки ethers.js
		const contract = new ethers.Contract(contractAddress, contractAbi, signer);
		try {

			// Вызываем функцию контракта
			const tx = await contract.setDocumentHash(newDocumentHash);
			// Обновляем текст на странице с сообщением о добавлении нового хэша документа и хэшем транзакции
			document.getElementById("status").innerHTML = `Document hash added. Transaction hash: ${tx.hash}`;
		} catch (error) {
			// Выводим сообщение об ошибке, если функция контракта вызвана с ошибкой
			document.getElementById("status").innerHTML = `Error: ${error.message}`;
		}
	};

	// Обработчик события для кнопки "Добавить адрес в белый список"
	document.getElementById("addAddressButton").onclick = async () => {
		// Получаем провайдера и подключаемся к MetaMask
		const provider = await getProvider();
		console.log('provider:', provider);
		if (!provider) return;

		// Получаем подписчика для отправки транзакции
		const signer = provider.getSigner();
		// Получаем новый адрес из поля ввода на странице
		const address = document.getElementById("address").value;

		// Создаем экземпляр контракта с помощью библиотеки ethers.js
		const contract = new ethers.Contract(contractAddress, contractAbi, signer);
			try {

				// Вызываем функцию контракта
				const tx = await contract.addToWhitelist(address);
				document.getElementById("status").innerHTML = `Address added to whitelist. Transaction hash: ${tx.hash}`;
			} catch (error) {
				document.getElementById("status").innerHTML = `Error: ${error.message}`;
			}
		};

		// Обработчики событий для кнопок взаимодействия с контрактом
		document.getElementById("removeAddressButton").onclick = async () => {
			const provider = await getProvider();
			console.log('provider:', provider);
			if (!provider) return;
			
			const signer = provider.getSigner();
			const address = document.getElementById("address").value;

			// Создаем экземпляр контракта с помощью библиотеки ethers.js
			const contract = new ethers.Contract(contractAddress, contractAbi, signer);
			try {

				// Вызываем функцию контракта
				const tx = await contract.removeAddressFromWhitelist(address);
				document.getElementById("status").innerHTML = `Address removed from whitelist. Transaction hash: ${tx.hash}`;
			} catch (error) {
				document.getElementById("status").innerHTML = `Error: ${error.message}`;
			}
		};

	// Обработчики событий для кнопок взаимодействия с контрактом
	document.getElementById("showWhitelistButton").onclick = async () => {
		const provider = await getProvider();
		console.log('provider:', provider);
		if (!provider) return;

		// Создаем экземпляр контракта с помощью библиотеки ethers.js
		const contract = new ethers.Contract(contractAddress, contractAbi, provider);
		try {
			// Вызываем функцию контракта
			const whitelist = await contract.getWhitelist();
			document.getElementById("status").innerHTML = `Whitelist addresses: ${whitelist.join(', ')}`;
		} catch (error) {
			document.getElementById("status").innerHTML = `Error: ${error.message}`;
		}
	};
})