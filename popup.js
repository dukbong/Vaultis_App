document.addEventListener('DOMContentLoaded', function () {
    const encryptionTab = document.getElementById('encryptionTab');
    const decryptionTab = document.getElementById('decryptionTab');
    const encryptionTabContent = document.getElementById('encryptionTabContent');
    const decryptionTabContent = document.getElementById('decryptionTabContent');
    const encryptSubmitButton = document.getElementById('encryptSubmitButton');
    const decryptSubmitButton = document.getElementById('decryptSubmitButton');
    const plaintextInput = document.getElementById('plaintextInput');
    const ciphertextInput = document.getElementById('ciphertextInput');
    const publicKeyFileInput = document.getElementById('publicKeyFileInput');
    const privateKeyFileInput = document.getElementById('privateKeyFileInput');
    const encryptionResponseOutput = document.getElementById('encryptionResponseOutput');
    const decryptionResponseOutput = document.getElementById('decryptionResponseOutput');

    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    encryptionResponseOutput.addEventListener('click', () => {
        const message = encryptionResponseOutput.value;
        if (message) {
            copyToClipboard(message);
        }
    });

    // 복호화 응답 클릭 시 복사
    decryptionResponseOutput.addEventListener('click', () => {
        const message = decryptionResponseOutput.value;
        if (message) {
            copyToClipboard(message);
        }
    });

    // 탭 전환
    encryptionTab.addEventListener('click', () => {
        encryptionTab.classList.add('active');
        decryptionTab.classList.remove('active');
        encryptionTabContent.classList.add('active');
        decryptionTabContent.classList.remove('active');

        chrome.storage.session.get('publicKeyFile', (result) => {
            if (result.publicKeyFile) {
                // Base64 데이터를 Blob으로 변환
                const byteCharacters = atob(result.publicKeyFile);
                const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray]);

                // Blob을 파일로 설정
                const file = new File([blob], "publicKey-file", { type: "application/octet-stream" });

                // File 객체를 publicKeyFileInput에 설정
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                publicKeyFileInput.files = dataTransfer.files;
            }
        });
    });

    decryptionTab.addEventListener('click', () => {
        decryptionTab.classList.add('active');
        encryptionTab.classList.remove('active');
        decryptionTabContent.classList.add('active');
        encryptionTabContent.classList.remove('active');

        chrome.storage.session.get('privateKeyFile', (result) => {
            if (result.privateKeyFile) {
                const byteCharacters = atob(result.privateKeyFile);
                const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray]);

                const file = new File([blob], "privateKey-file", { type: "application/octet-stream" });

                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                privateKeyFileInput.files = dataTransfer.files;
            }
        });
    });

    privateKeyFileInput.addEventListener('change', () => {
        const file = privateKeyFileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const base64File = event.target.result.split(',')[1]; // Base64 데이터 추출
                chrome.storage.session.set({ 'privateKeyFile': base64File }, () => {
                    console.log('파일 저장 완료');
                });
            };
            reader.readAsDataURL(file); // 파일 읽기
        }
    });

    publicKeyFileInput.addEventListener('change', () => {
        const file = publicKeyFileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const base64File = event.target.result.split(',')[1]; // Base64 데이터 추출
                chrome.storage.session.set({ 'publicKeyFile': base64File }, () => {
                    console.log('파일 저장 완료');
                });
            };
            reader.readAsDataURL(file); // 파일 읽기
        }
    });

    // 서버로 본문 및 파일 전송
    encryptSubmitButton.addEventListener('click', () => {
        const plaintext = plaintextInput.value;
        const file = publicKeyFileInput.files[0];

        const formData = new FormData();
        formData.append('content', plaintext);
        if (file) {
            formData.append('publicKeyFile', file);
        }

        fetch('http://localhost:8889/encrypt', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                encryptionResponseOutput.value = data.data.encryptedContent || '응답 메시지가 없습니다.';
            })
            .catch(error => {
                encryptionResponseOutput.value = '암호화에 실패하였습니다.'; // 오류 메시지 표시
            });
    });

    decryptSubmitButton.addEventListener('click', () => {
        const ciphertext = ciphertextInput.value;
        const file = privateKeyFileInput.files[0];

        const formData = new FormData();
        formData.append('encryptedMessage', ciphertext);
        if (file) {
            formData.append('privateKeyFile', file);
        }

        fetch('http://localhost:8889/decryption', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                decryptionResponseOutput.value = data.data.content || '응답 메시지가 없습니다.';
            })
            .catch(error => {
                decryptionResponseOutput.value = '복호화에 실패하였습니다.'; // 오류 메시지 표시
            });
    });

    encryptionTab.click();
});